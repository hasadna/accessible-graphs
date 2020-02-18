/**
 * A CSV formatted string containing the data input from the user to pass to `view.ts` script
 * @type {string}
 */
let inputToPassToView = '';
/**
 * Set `dataInput` element focus, and adds `populateTtsList()` callback to `window.speechSynthesis.onvoiceschanged`
 */
function initializeAppScript() {
    document.getElementById('dataInput').focus();
    populateTtsList();
    // In Chrome, we need to wait for the "voiceschanged" event to be fired before we can get the list of all voices. See
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
    // for more details
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateTtsList;
    }
}
/**
 * Sets `window.location.href` with search parameter data to be parsed by `view.js`
 */
function updateURL() {
    inputToPassToView = encodeURIComponent(inputToPassToView);
    const minValue = document.getElementById('minValue').value;
    const maxValue = document.getElementById('maxValue').value;
    const instrumentType = document.getElementById('instrumentType').value;
    const ttsVoiceIndex = document.getElementById('ttsVoice').selectedIndex;
    let newUrl = '';
    // Check if we are running on a localhost
    if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
        newUrl = window.location.pathname.split('/').slice(0, -1).join('/');
    }
    else {
        newUrl = new URL(window.location.href).origin;
    }
    newUrl += '/view/index.html?';
    newUrl += `data=${inputToPassToView}`;
    newUrl += `&minValue=${minValue}`;
    newUrl += `&maxValue=${maxValue}`;
    newUrl += `&instrumentType=${instrumentType}`;
    newUrl += `&ttsIndex=${ttsVoiceIndex}`;
    window.location.href = newUrl;
}
/**
 * Callback for radio input `autoOption` and `manualOption` elements
 */
function onRadioChange(radio) {
    const minValuePicker = document.getElementById('minValue');
    const maxValuePicker = document.getElementById('maxValue');
    if (radio.value === 'auto') {
        minValuePicker.disabled = true;
        maxValuePicker.disabled = true;
    }
    else {
        minValuePicker.disabled = false;
        maxValuePicker.disabled = false;
    }
}
/**
 * Parses the input from the user which was inputted to the 'dataInput' `textarea` as a CSV
 * Uses the 'Papa parse' API to achieve this
 */
function parseInput() {
    const input = document.getElementById('dataInput').value;
    // Let's try to start to parse without headers first,
    // so we can decide whether we have 2 * N grid or N * 2
    // alternatively, we could also have 1 * N grid or N * 1
    let results = Papa.parse(input);
    if (results.errors.length > 0) {
        displayErrorMessage();
        return;
    }
    if (results.data[0].length == 1 || results.data[0].length == 2) {
        results.data = transpose(results.data);
    }
    if (results.data.length > 2) {
        displayErrorMessage();
        return;
    }
    if (results.data.length == 2) {
        // Parsing with headers should be successful
        // so let's unparse, and try to reparse with headers
        let parsedData = Papa.unparse(results.data);
        results = Papa.parse(parsedData, { header: true });
    }
    if (results.errors.length > 0 || results.data.length > 1) {
        displayErrorMessage();
        return;
    }
    let extractedData = extractData(results.data[0]);
    setMinAndMaxValuesFrom(extractedData);
    displaySuccessMessage();
    inputToPassToView = Papa.unparse(results.data, { delimiter: '\t' });
}
/**
 * Extracts the numerical data found in the first element of the 'data' array found in the 'results' object which was returned by 'Papa' API
 * @param data {Object} data - The object containing the numerical data to extract, it could be an array also
 */
function extractData(data) {
    let result = [];
    for (let key of Object.keys(data)) {
        result.push(data[key]);
    }
    return result;
}
/**
 * Transposes the data matrix
 * @param {string[][]} data - The data matrix to transpose
 * @returns {string[][]} Data matrix transposed
 */
function transpose(data) {
    // Initialize the result Array
    let result = new Array(data[0].length);
    for (let i = 0; i < data[0].length; i++) {
        result[i] = new Array(data.length);
    }
    // Store transposed data in result
    for (let i = 0; i < data[0].length; i++) {
        for (let j = 0; j < data.length; j++) {
            result[i][j] = data[j][i];
        }
    }
    return result;
}
/**
 * Displays an error message to the user notifying him that the CSV he entered is in valid
 * The message is also accessible to screen readers using 'aria' techniques
 */
function displayErrorMessage() {
    document.getElementById('dataInputFeedback').innerHTML = '&cross; In valid input';
    document.getElementById('viewButton').disabled = true;
}
/**
 * Displays a success message to the user notifying him that the CSV he entered is valid
 * The message is also accessible to screen readers using 'aria' techniques
 */
function displaySuccessMessage() {
    document.getElementById('dataInputFeedback').innerHTML = '&check; Valid';
    document.getElementById('viewButton').disabled = false;
}
/**
 * Gets the min and max values from an array of numbers
 * @param {number[]} data - Array of numbers to get the min and max values from
 * @returns {number, number} An object contaning the max and min values
 */
function getMinMaxValuesFrom(data) {
    let maxValue = Math.max(...data);
    let minValue = Math.min(...data);
    return { maxValue, minValue };
}
/**
 * Sets values of min and max HTML IDs from numbers within data
 * @param {number[]} data - Array of numbers to pass to `getMinMaxValuesFrom()`
 * @param {string} min_html_id - HTML ID to set `.value` to min value
 * @param {string} max_html_id - HTML ID to set `.value` to max value
 */
function setMinAndMaxValuesFrom(data, min_html_id = 'minValue', max_html_id = 'maxValue') {
    if (document.getElementById('autoOption').checked === false) {
        return;
    }
    const { maxValue, minValue } = getMinMaxValuesFrom(data);
    document.getElementById(max_html_id).value = maxValue.toString();
    document.getElementById(min_html_id).value = minValue.toString();
}
/**
 * Populates `select` element ID "ttsVoice"
 */
function populateTtsList() {
    const ttsVoiceSelect = document.getElementById('ttsVoice');
    ttsVoiceSelect.innerHTML = '';
    const voices = window.speechSynthesis.getVoices();
    voices.forEach((voice) => {
        const option = document.createElement('option');
        let optionValueAndText = `${voice.name}(${voice.lang})`;
        if (voice.default === true) {
            optionValueAndText += ' -- DEFAULT';
        }
        option.value = optionValueAndText;
        option.innerText = optionValueAndText;
        ttsVoiceSelect.appendChild(option);
    });
}
//# sourceMappingURL=app.js.map