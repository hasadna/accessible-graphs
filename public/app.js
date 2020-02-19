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
 * Sets `window.location.href` with search parameter data to be parsed by `view.ts`
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
 * Parses the input from the user inputted to the 'dataInput' `textarea` as a CSV
 * Uses the 'Papa parse' API to achieve this
 */
function parseInput() {
    const input = document.getElementById('dataInput').value;
    // Let's try to start to parse without headers first,
    // so we can decide whether we have 2 * N grid or N * 2
    // alternatively, we could also have 1 * N grid or N * 1
    let results = Papa.parse(input);
    if (results.errors.length > 0 || !isRowsEqual(results.data)) {
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
    let rawData = Papa.unparse(results.data);
    let data = [];
    try {
        let combinedDataAndHeaders = parseInputFinal(rawData);
        data = combinedDataAndHeaders.data;
    }
    catch (error) {
        displayErrorMessage();
        return;
    }
    setMinAndMaxValuesFrom(data);
    displaySuccessMessage();
    inputToPassToView = Papa.unparse(results.data, { delimiter: '\t' });
}
/**
 * Performs the final step of parsing the CSV data entered by the user
 * This step comes after we transposed the data matrix if this was necessary,
 * insured the row's lengths of the matrix are equal,
 *  and insured also that the matrix has 2 rows atmost
 * @param {string} rawData - The raw data to parse in this final step
 * @throws {string} A 'Parsing error' is thrown if an error occurs while parsing, or the type of the data is not as expected
 */
function parseInputFinal(rawData) {
    let dataHeaders = [];
    let data = [];
    // Let's try to parse with headers first:
    let results = Papa.parse(rawData, {
        'header': true,
        'dynamicTyping': true
    });
    if (results.errors.length > 0) {
        throw 'Parsing error';
    }
    if (results.data.length != 0) {
        for (let key of Object.keys(results.data[0])) {
            dataHeaders.push(key);
        }
    }
    else {
        // Parsing with headers was unsuccessfull 
        results =
            Papa.parse(rawData, { 'dynamicTyping': true });
    }
    if (results.errors.length > 0) {
        throw 'Parsing error';
    }
    for (let key of Object.keys(results.data[0])) {
        let dataElement = results.data[0][key];
        if (typeof dataElement !== 'number') {
            throw 'Parsing error';
        }
        data.push(dataElement);
    }
    return {
        dataHeaders,
        data
    };
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
 * Checks whether the rows of the data matrix's lengths are equal
 *  @param {string[][]} data - The data matrix to check
 * @returns {boolean} Whether the row's lengths of the matrix were equal or not
 */
function isRowsEqual(data) {
    if (data === [[]]) {
        return true;
    }
    let firstRowLength = data[0].length;
    for (let i = 0; i < data.length; i++) {
        if (data[i].length !== firstRowLength) {
            return false;
        }
    }
    return true;
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