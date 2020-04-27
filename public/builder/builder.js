;
/**
 * A CSV formatted string containing the data input from the user to pass to `view.ts` script
 * @type {string}
 */
let inputToPassToView = '';
/**
 * Try to get the data param from the URL, and set the retrieved value to `dataInput`
 * Set `dataInput` element focus
 * adds `populateTtsList()` callback to `window.speechSynthesis.onvoiceschanged`
 */
function initializeBuilderScript() {
    const data = getUrlParam('data');
    document.getElementById('dataInput').value = data;
    populateTtsList();
    // In Chrome, we need to wait for the "voiceschanged" event to be fired before we can get the list of all voices. See
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
    // for more details
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateTtsList;
    }
}
/**
 * Handles the user's click on the view button.
 * In case there are errors, the focus is set back to the `data input` field.
 * Error / success messages are displayed properly.
 */
function handleViewClick() {
    let validationResult = parseInput();
    if (validationResult === '') {
        updateURL();
    }
    else {
        document.getElementById('dataInput').focus();
        displayErrorMessage(validationResult);
    }
}
/**
 * Sets `window.location.href` with search parameter data to be parsed by `view.ts`
 */
function updateURL() {
    inputToPassToView = encodeURIComponent(inputToPassToView);
    const description = document.getElementById('graphDescription').value;
    const minValue = document.getElementById('minValue').value;
    const maxValue = document.getElementById('maxValue').value;
    const instrumentType = document.getElementById('instrumentType').value;
    const ttsVoiceSelect = document.getElementById('ttsVoice');
    const ttsVoiceName = ttsVoiceSelect.options[ttsVoiceSelect.selectedIndex].getAttribute('data-name');
    let newUrl = '';
    // Check if we are running on a localhost
    if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
        newUrl = window.location.pathname.split('/').slice(0, -2).join('/');
    }
    else {
        newUrl = new URL(window.location.href).origin;
    }
    newUrl += '/view/index.html?';
    newUrl += `data=${inputToPassToView}`;
    newUrl += `&description=${description}`;
    newUrl += `&minValue=${minValue}`;
    newUrl += `&maxValue=${maxValue}`;
    newUrl += `&instrumentType=${instrumentType}`;
    newUrl += `&ttsName=${ttsVoiceName}`;
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
 * Parses the input from the user inputted to the `dataInput` textarea as a CSV
 * Uses the 'Papa parse' API to achieve this
 *
 * Why is this returning an empty string?
 */
function parseInput() {
    // Todo: refactor this function and the ones it calls to be simpler to maintain if it's possible
    const input = document.getElementById('dataInput').value;
    let normalizedData = null;
    try {
        normalizedData = normalizeData(input);
    }
    catch (error) {
        throw error;
    }
    let rawData = Papa.unparse(normalizedData);
    let data = [];
    try {
        let combinedDataAndHeaders = parseWithHeaders(rawData);
        data = combinedDataAndHeaders.data;
    }
    catch (error) {
        if (!(error instanceof ParsingWithHeadersNotSuccessfulError)) {
            throw error;
        }
        try {
            data = parseWithoutHeaders(rawData);
        }
        catch (error) {
            throw error;
        }
    }
    setMinAndMaxValuesFrom(data);
    displaySuccessMessage();
    inputToPassToView = Papa.unparse(normalizedData, { delimiter: '\t' });
    return '';
}
/**
 * Normalizes the data entered by the user to the `dataInput` textarea by doing the following:
 * Parses the data using the 'Papa parse' API to parse CSV, notifies the user in case there are errors.
 * Insures that the data row or column lengths are equal, notifies the user if not.
 * Transposes the data in case we need to. The aim is to have the headers in the first row (if they are available)
 * and the data in the second row.
 * Alternatively, we could also have 1 row or column of numerical data.
 * In case we have more than 2 rows or columns, the user is notified with a proper error message
 * @param {string} input - The input data to normalize
 * @returns {string[][]} The normalized data
 */
function normalizeData(input) {
    // Let's try to start to parse without headers first,
    // so we can decide whether we have 2 * N grid or N * 2
    // alternatively, we could also have 1 * N grid or N * 1
    let results = Papa.parse(input);
    if (results.meta['aborted'] === true) {
        throw results.errors;
    }
    results.data = removeEmptyElements(results.data);
    if (results.data.length === 0 || results.data[0].length === 0) {
        throw new Error('Empty data is invalid');
    }
    if (!isRowsEqual(results.data)) {
        throw new Error("Row or column lengths aren't equal");
    }
    if (needToTranspose(results.data)) {
        // Transpose the data if we have 1 or 2 columns
        // in that case, the user is supposed to have entered either 1 column of numbers,
        // or 2 columns: the first is lables, and the second is numbers
        results.data = transpose(results.data);
    }
    if (results.data.length > 2) {
        throw new Error('Too many columns or rows');
    }
    return results.data;
}
/**
 * Checks whether we need to transpose the `data` matrix.
 * This is needed because 'Papa parse' API can deal with headers when they're in the first row only, so we need to insure this happens.
 * @param {string[][]} data - The data matrix to check
 * @returns {boolean} Whether the matrix needs to be transposed
 */
function needToTranspose(data) {
    if (data[0].length === 1) {
        return true;
    }
    else if (data[0].length === 2 && data.length === 1) {
        return false;
    }
    else if (data[0].length === 2) {
        let isSecondRowNums = true;
        for (let element of data[1]) {
            // Number will coerce `null` and "null" to `0` which is a number!
            if (isNaN(Number(element)) || element === 'null') {
                isSecondRowNums = false;
                break;
            }
        }
        // Why is this boolean inverted?
        return !isSecondRowNums;
    }
    return false;
}
/**
 * Tries to parse the normalized data with headers using 'Papa parse'
 * @param {string} rawData - The raw data, AKA the unparsed version of the normalized data
 * @returns {dataHeaders: string[], data: number[]} The result of parsing with headers if available
 * @throws {string} A 'Parsing with headers was unsuccessful' string if this was the case
 */
function parseWithHeaders(rawData) {
    let results = Papa.parse(rawData, {
        'header': true,
        'dynamicTyping': true
    });
    if (results.errors.length > 0) {
        throw new ParsingWithHeadersNotSuccessfulError();
    }
    if (results.data.length == 0) {
        throw new ParsingWithHeadersNotSuccessfulError();
    }
    let dataHeaders = fillHeadersArray(results.data[0]);
    let data = fillDataArray(results.data[0]);
    return { dataHeaders, data };
}
/**
 * Represents an error whitch states that parsing with headers was unsuccessful
 */
class ParsingWithHeadersNotSuccessfulError extends Error {
    /**
     * Instantiates a new error of this type
     * @param {string} message - An optional message to be passed to the constructor
     */
    constructor(message = '') {
        super(...arguments);
        this.message = message;
        this.name = 'ParsingWithHeadersNotSuccessfulError';
    }
}
/**
 * Tries to parse with out headers in case parsing with headers was unsuccessful
 * @param {string} rawData - The raw data, AKA the unparsed version of the normalized data
 * @returns {number[]} The parsed data
 * @throws {string} The error messages occured while parsing if this was the case
 */
function parseWithoutHeaders(rawData) {
    let results = Papa.parse(rawData, {
        'dynamicTyping': true
    });
    if (results['aborted'] === true) {
        throw results.errors;
    }
    let data = fillDataArray(results.data[0]);
    return data;
}
/**
 *  Returns the headers array of the parsed data in the final parsing step
 * @param {Object} data - The data part of the parsing result
 */
function fillHeadersArray(data) {
    let dataHeadersArray = [];
    for (let key in data) {
        dataHeadersArray.push(key);
    }
    return dataHeadersArray;
}
/**
 *  Returns the data array of the parsed data in the final parsing step
 * @param {Object} data - The data part of the parsing result
 * @throws {string} A proper error message displayed to the user in case the data isn't numerical
 */
function fillDataArray(data) {
    let dataArray = [];
    for (let key in data) {
        let dataElement = data[key];
        if (typeof (dataElement) !== 'number') {
            throw new Error('You could enter either 1 row or column of numerical data, or 2 rows or 2 columns, where the second ones is numerical.');
        }
        dataArray.push(dataElement);
    }
    return dataArray;
}
/**
 * Transposes the data matrix
 * @param {string[][]} data - The data matrix to transpose
 * @returns {string[][]} The data matrix transposed
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
 * Removes empty rows or columns from the `data` matrix
 * @param {string[][]} data - The matrix to remove empty elements from if necessary
 * @returns {string[][]} The result after the removal if that happend
 */
function removeEmptyElements(data) {
    let result = [];
    let currentRow = 0;
    let rowWasEmpty = true;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] !== '') {
                if (result[currentRow] === undefined) {
                    result.push([]);
                }
                result[currentRow].push(data[i][j]);
                rowWasEmpty = false;
            }
        }
        if (!rowWasEmpty) {
            currentRow++;
            rowWasEmpty = true;
        }
    }
    return result;
}
/**
 * Checks whether the rows of the data matrix's lengths are equal
 * @param {string[][]} data - The data matrix to check
 * @returns {boolean} Whether the row's lengths of the matrix were equal or not
 */
function isRowsEqual(data) {
    if (data.length === 0) {
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
 * Displays an error message to the user notifying them that the CSV entered is invalid
 * The message is also accessible to screen readers using 'aria' techniques
 * @param {string} message - An error message to display to the user
 */
function displayErrorMessage(message) {
    document.getElementById('dataInputFeedback').innerHTML = `&cross; Invalid input! ${message}`;
}
/**
 * Displays a success message to the user notifying him that the CSV he entered is valid
 * The message is also accessible to screen readers using 'aria' techniques
 */
function displaySuccessMessage() {
    document.getElementById('dataInputFeedback').innerHTML = '&check; Valid';
}
/**
 * Gets the min and max values from an array of numbers
 * @param {number[]} data - Array of numbers to get the min and max values from
 * @returns {maxValue: number, minValue: number} An object contaning the max and min values
 */
function getMinMaxValues(data) {
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
    const { maxValue, minValue } = getMinMaxValues(data);
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
        option.setAttribute('data-name', voice.name);
        ttsVoiceSelect.appendChild(option);
    });
}
//# sourceMappingURL=builder.js.map