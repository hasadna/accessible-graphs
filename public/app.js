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
    const input = encodeURIComponent(document.getElementById('dataInput').value);
    const minValue = document.getElementById('minValue').value;
    const maxValue = document.getElementById('maxValue').value;
    const instrumentType = document.getElementById('instrumentType').value;
    // const ttsVoice: HTMLSelectElement = (<HTMLSelectElement> document.getElementById('ttsVoice'));
    // const ttsVoiceIndex: string = ttsVoice.options[ttsVoice.selectedIndex].value;
    /**
     * @note: if selected value is needed, then consider using above two lines in-place of bellow bellow
     */
    const ttsVoiceIndex = document.getElementById('ttsVoice').selectedIndex;
    // let input: string = <string>$('#dataInput').val();
    // input = encodeURIComponent(input);
    // let minValue = $('#minValue').val();
    // let maxValue = $('#maxValue').val();
    // let instrumentType = $('#instrumentType').val();
    // let ttsVoiceIndex = $('#ttsVoice').prop('selectedIndex');
    // let currentUrl = new URL(window.location.href);
    let newUrl = '';
    // Check if we are running on a localhost
    if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
        newUrl = window.location.pathname.substring(0, newUrl.lastIndexOf('/'));
    }
    else {
        newUrl = new URL(window.location.href).origin;
    }
    newUrl += '/view/index.html?';
    newUrl += `data=${input}`;
    newUrl += `&minValue=${minValue}`;
    newUrl += `&maxValue=${maxValue}`;
    newUrl += `&instrumentType=${instrumentType}`;
    newUrl += `&ttsIndex=${ttsVoiceIndex}`;
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
        $('#updateButton').prop('disabled', false);
    }
}
/**
 *
 * @param {string} input -
 * @note: StackOverflow discussions may be worth review on why `forEach`
 * @question: find-the-min-max-element-of-an-array-in-javascript
 * @link: https://stackoverflow.com/questions/1669190/#8986992
 */
function getMinMaxValuesFrom(input) {
    // TODO: Add a method to parse the input data to a array of arrays for example,
    //       so it can be used here and in processData().
    //
    // Note: Parsing input into a matrix of values may be better
    //       via a promising iterator or generator.
    let maxValue = -Infinity;
    let minValue = Infinity;
    input.split(/\r\n|\n/).forEach((line) => {
        line.split(/\t| +/).forEach((value) => {
            const value_as_float = parseFloat(value);
            if (value_as_float > maxValue) {
                maxValue = value_as_float;
            }
            if (value_as_float < minValue) {
                minValue = value_as_float;
            }
        });
    });
    return { maxValue, minValue };
}
/**
 * Sets values of min and max HTML IDs from values within values HTML ID
 * @param {string} values_html_id - HTML ID to read `.value` from
 * @param {string} min_html_id - HTML ID to set `.value` to min value
 * @param {string} max_html_id - HTML ID to set `.value` to max value
 */
function setMinAndMaxValuesFrom(values_html_id = 'dataInput', min_html_id = 'minValue', max_html_id = 'maxValue') {
    if (document.getElementById('autoOption').checked === false) {
        return;
    }
    const input = document.getElementById(values_html_id).value;
    const { maxValue, minValue } = getMinMaxValuesFrom(input);
    document.getElementById(min_html_id).value = maxValue.toString();
    document.getElementById(max_html_id).value = minValue.toString();
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