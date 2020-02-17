let inputToPassToView = '';
function initializeAppScript() {
    $('#dataInput').focus();
    populateTtsList();
    // In Chrome, we need to wait for the "voiceschanged" event to be fired before we can get the list of all voices. See
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
    // for more details 
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateTtsList;
    }
}
function updateURL() {
    inputToPassToView = encodeURIComponent(inputToPassToView);
    let minValue = $('#minValue').val();
    let maxValue = $('#maxValue').val();
    let instrumentType = $('#instrumentType').val();
    let ttsVoiceIndex = $('#ttsVoice').prop('selectedIndex');
    let currentUrl = new URL(window.location.href);
    let newUrl;
    // Check if we are running on a localhost
    if (location.hostname == 'localhost' || location.hostname == '127.0.0.1' ||
        location.hostname == '') {
        newUrl = window.location.pathname;
        newUrl = newUrl.substring(0, newUrl.lastIndexOf('/'));
    }
    else {
        newUrl = currentUrl.origin;
    }
    newUrl += '/view/index.html?';
    newUrl += 'data=' + inputToPassToView;
    newUrl += '&minValue=' + minValue;
    newUrl += '&maxValue=' + maxValue;
    newUrl += '&instrumentType=' + instrumentType;
    newUrl += '&ttsIndex=' + ttsVoiceIndex;
    window.location.href = newUrl;
}
function onRadioChange(radio) {
    let minValuePicker = $('#minValue');
    let maxValuePicker = $('#maxValue');
    if (radio.value == 'auto') {
        minValuePicker.prop('disabled', true);
        maxValuePicker.prop('disabled', true);
    }
    else {
        minValuePicker.prop('disabled', false);
        maxValuePicker.prop('disabled', false);
    }
}
function parseInput() {
    let input = $('#dataInput').val();
    // Let's try to start to parse without  headers first,
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
    findMinAndMaxValues(extractedData);
    displaySuccessMessage();
    inputToPassToView = Papa.unparse(results.data, { delimiter: '\t' });
}
function extractData(data) {
    let result = [];
    for (let key of Object.keys(data)) {
        result.push(data[key]);
    }
    return result;
}
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
function displayErrorMessage() {
    $('#dataInputFeedback').html('&cross; In valid input');
    $('#viewButton').prop('disabled', true);
}
function displaySuccessMessage() {
    $('#dataInputFeedback').html('&check; Valid');
    $('#viewButton').prop('disabled', false);
}
function findMinAndMaxValues(data) {
    if ($('#autoOption').prop('checked') == false) {
        return;
    }
    let maxValue = Math.max(...data);
    let minValue = Math.min(...data);
    $('#maxValue').val(maxValue);
    $('#minValue').val(minValue);
}
function populateTtsList() {
    let ttsVoiceSelect = $('#ttsVoice');
    let synth = window.speechSynthesis;
    let voices = synth.getVoices();
    ttsVoiceSelect.html('');
    for (let i = 0; i < voices.length; i++) {
        let option = $('<option>');
        let optionValueAndText = voices[i].name + ' (' + voices[i].lang + ')';
        if (voices[i].default == true) {
            optionValueAndText += ' -- DEFAULT';
        }
        option.val(optionValueAndText);
        option.text(optionValueAndText);
        ttsVoiceSelect.append(option);
    }
}
//# sourceMappingURL=app.js.map