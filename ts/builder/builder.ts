declare let Papa: any;
    

/** 
 * A CSV formatted string containing the data input from the user to pass to `view.ts` script
 * @type {string}
 */
let inputToPassToView: string = '';


/**
 * Set `dataInput` element focus, and adds `populateTtsList()` callback to `window.speechSynthesis.onvoiceschanged`
 */
function initializeAppScript() {
  (<HTMLInputElement>document.getElementById('dataInput')).focus();
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
  const minValue: string = (<HTMLInputElement>document.getElementById('minValue')).value;
  const maxValue: string = (<HTMLInputElement>document.getElementById('maxValue')).value;
  const instrumentType: string = (<HTMLInputElement>document.getElementById('instrumentType')).value;
  const ttsVoiceIndex: number = (<HTMLSelectElement>document.getElementById('ttsVoice')).selectedIndex;

  let newUrl: string = '';
  // Check if we are running on a localhost
  if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
    newUrl = window.location.pathname.split('/').slice(0, -2).join('/');
  } else {
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
function onRadioChange(radio: HTMLInputElement) {
  const minValuePicker: HTMLInputElement = (<HTMLInputElement>document.getElementById('minValue'));
  const maxValuePicker: HTMLInputElement = (<HTMLInputElement>document.getElementById('maxValue'));
  if (radio.value === 'auto') {
    minValuePicker.disabled = true;
    maxValuePicker.disabled = true;
  } else {
    minValuePicker.disabled = false;
    maxValuePicker.disabled = false;
  }
}


/**
 * Parses the input from the user inputted to the `dataInput` textarea as a CSV
 * Uses the 'Papa parse' API to achieve this
 */
function parseInput() {
  // Todo: refactor this function and the ones it calls to be simpler to maintain if it's possible
  const input: string = (<HTMLInputElement>document.getElementById('dataInput')).value;
  let normalizedData: string[][] = normalizeData(input);
  let rawData: string = Papa.unparse(normalizedData);
  let data: number[] = [];
  try {
    let combinedDataAndHeaders: { dataHeaders: string[], data: number[] } = parseWithHeaders(rawData);
    data = combinedDataAndHeaders.data;
  } catch (error) {
    try {
      data = parseWithoutHeaders(rawData);
    } catch (errorMessages) {
      displayErrorMessage(errorMessages);
      return;
    }
  }
  setMinAndMaxValuesFrom(data);
  displaySuccessMessage();
  inputToPassToView = Papa.unparse(normalizedData, { delimiter: '\t' });
}


/**
 * Normalizes the data entered by the user to the `dataInput` textarea by doing the following:
 * Parses the data using the 'Papa parse' API to parse CSV. Notifies the user in case there are errors
 * Insures that the data row or column lengths are equal. Notifies the user if not
 * Transposes the data in case we need to. The aim is to have the headers in the first row (if they are available)
 * and the data in the second row.
 * Alternatively, we could also have 1 row of numerical data
 * In case we have more than 2 rows or columns, the user is notified with a proper error message
 * @param {string} input - The input data to normalize
 * @returns {string[][]} The normalized data
 */
function normalizeData(input: string) {
  // Let's try to start to parse without headers first,
  // so we can decide whether we have 2 * N grid or N * 2
  // alternatively, we could also have 1 * N grid or N * 1
  let results: { data: string[][], errors: Object[], meta: object[] } = Papa.parse(input);
  if (results.errors.length > 0) {
    displayErrorMessage(getErrorMessages(results.errors));
    return null;
  }
  if (!isRowsEqual(results.data)) {
    displayErrorMessage('Row or column lengths aren\'t equal');
    return null;
  }
  if (results.data[0].length == 1 || results.data[0].length == 2) {
    // Transpose the data if we have 1 or 2 columns
    // in that case, the user is supposed to have entered either 1 column of numbers,
    // or 2 columns: the first is lables, and the second is numbers
    results.data = transpose(results.data);
  }
  if (results.data.length > 2) {
    displayErrorMessage('Too many columns or rows');
    return null;
  }
  return results.data;
}


/**
 * Gets all error messages from the result of the CSV parsing
 * The messages are concatenated in to one string
 * @param {Object[]} errors - An array of errors which may occured while parsing
 * @returns {string} A concatenation of all error messages
 */
function getErrorMessages(errors: Object[]) {
  let messages: string = '';
  for (let error of errors) {
    messages += `${error['message']}. `;
  }
  return messages;
}


/**
 * Tries to parse the normalized data with headers using 'Papa parse'
 * @param {string} rawData - The raw data, AKA the unparsed version of the normalized data
 * @returns {dataHeaders: string[], data: number[]} The result of parsing with headers if available
 * @throws {string} A 'Parsing with headers was unsuccessful' string if this was the case
 */
function parseWithHeaders(rawData: string) {
  let results: { data: Object[], errors: Object[], meta: Object[] } = Papa.parse(rawData,
    {
      'header': true,
      'dynamicTyping': true
    });
  if (results.errors.length > 0) {
    throw 'Parsing with headers was unsuccessful.';
  }
  if (results.data.length == 0) {
    throw 'Parsing with headers was unsuccessful.';
  }
  let dataHeaders: string[] = fillHeadersArray(results.data[0]);
  let data: number[] = fillDataArray(results.data[0]);
  return { dataHeaders, data };
}


/**
 * Tries to parse with out headers in case parsing with headers was unsuccessful
 * @param {string} rawData - The raw data, AKA the unparsed version of the normalized data
 * @returns {number[]} The parsed data
 * @throws {string} The error messages occured while parsing if this was the case
 */
function parseWithoutHeaders(rawData: string) {
  let results: { data: Object[], errors: Object[], meta: Object[] } =
    Papa.parse(rawData, { 'dynamicTyping': true });
  let data: number[] = fillDataArray(results.data[0]);
  if (results.errors.length > 0) {
    throw getErrorMessages(results.errors);
  }
  return data;
}


/**
 *  Returns the headers array of the parsed data in the final parsing step
 * @param {Object} data - The data part of the parsing result
 */
function fillHeadersArray(data: Object) {
  let dataHeadersArray: string[] = [];
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
function fillDataArray(data: Object) {
  let dataArray: number[] = [];
  for (let key in data) {
    let dataElement: number = data[key];
    if (typeof dataElement !== 'number') {
      throw 'You could enter either 1 row of  numerical data, or 2 rows, where the second is numerical.';
    }
    data
    dataArray.push(dataElement);
  }
  return dataArray;
}

/** 
 * Transposes the data matrix
 * @param {string[][]} data - The data matrix to transpose
 * @returns {string[][]} The data matrix transposed
 */
function transpose(data: string[][]) {
  // Initialize the result Array
  let result: string[][] = new Array(data[0].length);
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
 * @param {string[][]} data - The data matrix to check
 * @returns {boolean} Whether the row's lengths of the matrix were equal or not
 */
function isRowsEqual(data: string[][]) {
  if (data === [[]]) {
    return true;
  }
  let firstRowLength: Number = data[0].length;
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
 * @param {string} message - An error message to display to the user
 */
function displayErrorMessage(message: string) {
  (<HTMLSpanElement>document.getElementById('dataInputFeedback')).innerHTML = `&cross; In valid input! ${message}`;
  (<HTMLInputElement>document.getElementById('viewButton')).disabled = true;
}


/**
 * Displays a success message to the user notifying him that the CSV he entered is valid
 * The message is also accessible to screen readers using 'aria' techniques
 */
function displaySuccessMessage() {
  (<HTMLSpanElement>document.getElementById('dataInputFeedback')).innerHTML = '&check; Valid';
  (<HTMLInputElement>document.getElementById('viewButton')).disabled = false;
}


/**
 * Gets the min and max values from an array of numbers
 * @param {number[]} data - Array of numbers to get the min and max values from
 * @returns {number, number} An object contaning the max and min values
 */
function getMinMaxValues(data: number[]) {
  let maxValue: Number = Math.max(...data);
  let minValue: Number = Math.min(...data);
  return { maxValue, minValue };
}


/**
 * Sets values of min and max HTML IDs from numbers within data
 * @param {number[]} data - Array of numbers to pass to `getMinMaxValuesFrom()`
 * @param {string} min_html_id - HTML ID to set `.value` to min value
 * @param {string} max_html_id - HTML ID to set `.value` to max value
 */
function setMinAndMaxValuesFrom(
  data: number[],
  min_html_id: string = 'minValue',
  max_html_id: string = 'maxValue'
) {
  if ((<HTMLInputElement>document.getElementById('autoOption')).checked === false) {
    return;
  }

  const { maxValue, minValue } = getMinMaxValues(data);

  (<HTMLInputElement>document.getElementById(max_html_id)).value = maxValue.toString();
  (<HTMLInputElement>document.getElementById(min_html_id)).value = minValue.toString();
}


/**
 * Populates `select` element ID "ttsVoice"
 */
function populateTtsList() {
  const ttsVoiceSelect: HTMLElement = document.getElementById('ttsVoice');
  ttsVoiceSelect.innerHTML = '';

  const voices: Array<SpeechSynthesisVoice> = window.speechSynthesis.getVoices();
  voices.forEach((voice) => {
    const option = document.createElement('option');
    let optionValueAndText: string = `${voice.name}(${voice.lang})`;

    if (voice.default === true) {
      optionValueAndText += ' -- DEFAULT';
    }

    option.value = optionValueAndText;
    option.innerText = optionValueAndText;
    ttsVoiceSelect.appendChild(option);
  });
}
