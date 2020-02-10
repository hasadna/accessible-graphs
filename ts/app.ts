/**
 * Set `dataInput` element focus, and adds `populateTtsList()` callback to `window.speechSynthesis.onvoiceschanged`
 */
function initializeAppScript() {
  (<HTMLInputElement> document.getElementById('dataInput')).focus();
  populateTtsList();
  // In Chrome, we need to wait for the "voiceschanged" event to be fired before we can get the list of all voices. See
  //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
  // for more details
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateTtsList;
  }
}

/**
 * Sets `window.location.href` with search paramater data to be parsed by `view.js`
 */
function updateURL() {
  const input: string = encodeURIComponent((<HTMLInputElement> document.getElementById('dataInput')).value);
  const minValue: string = (<HTMLInputElement> document.getElementById('minValue')).value;
  const maxValue: string = (<HTMLInputElement> document.getElementById('maxValue')).value;
  const instrumentType: string = (<HTMLInputElement> document.getElementById('instrumentType')).value;

  // const ttsVoice: HTMLSelectElement = (<HTMLSelectElement> document.getElementById('ttsVoice'));
  // const ttsVoiceIndex: string = ttsVoice.options[ttsVoice.selectedIndex].value;
  /**
   * @note: if selected value is needed, then consider using above two lines in-place of bellow
   */
  const ttsVoiceIndex: number = (<HTMLSelectElement> document.getElementById('ttsVoice')).selectedIndex;

  let newUrl: string = '';
  // Check if we are running on a localhost
  if (['localhost', '127.0.0.1', ''].includes(location.hostname)) {
    newUrl = window.location.pathname.split('/').slice(0, -1).join('/');
  } else {
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


/**
 * Callback for radio input `autoOption` and `manualOption` elements
 */
function onRadioChange(radio: HTMLInputElement) {
  const minValuePicker: HTMLInputElement = (<HTMLInputElement> document.getElementById('minValue'));
  const maxValuePicker: HTMLInputElement = (<HTMLInputElement> document.getElementById('maxValue'));
  if (radio.value === 'auto') {
    minValuePicker.disabled = true;
    maxValuePicker.disabled = true;
  } else {
    minValuePicker.disabled = false;
    maxValuePicker.disabled = false;
    /**
     * @note: the following element does **not** seem to exist
     */
    (<HTMLInputElement> document.getElementById('updateButton')).disabled = false;
  }
}


/**
 *
 * @param {string} input - String with `\r\n` or `\n` line separators, and either spaces or tabs separating items
 */
function getMinMaxValuesFrom(input: string) {
  // TODO: Add a method to parse the input data to a array of arrays for example,
  //       so it can be used here and in processData().
  //
  // Note: Parsing input into a matrix of values may be better
  //       via a promising iterator or generator.
  let maxValue: number = -Infinity;
  let minValue: number = Infinity;
  input.split(/\r\n|\n/).forEach((line: string) => {
    line.split(/\t| +/).forEach((value: string) => {
      const value_as_float: number = parseFloat(value);
      if (value_as_float > maxValue) {
        maxValue = value_as_float;
      }
      if (value_as_float < minValue) {
        minValue = value_as_float;
      }
    });
  });
  return {maxValue, minValue};
}


/**
 * Sets values of min and max HTML IDs from values within values HTML ID
 * @param {string} values_html_id - HTML ID to read `.value` from
 * @param {string} min_html_id - HTML ID to set `.value` to min value
 * @param {string} max_html_id - HTML ID to set `.value` to max value
 */
function setMinAndMaxValuesFrom(
  values_html_id: string = 'dataInput',
  min_html_id: string = 'minValue',
  max_html_id: string = 'maxValue'
) {
  if ((<HTMLInputElement> document.getElementById('autoOption')).checked === false) {
    return;
  }

  const input = (<HTMLInputElement> document.getElementById(values_html_id)).value;
  const {maxValue, minValue} = getMinMaxValuesFrom(input);

  (<HTMLInputElement> document.getElementById(min_html_id)).value = maxValue.toString();
  (<HTMLInputElement> document.getElementById(max_html_id)).value = minValue.toString();
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
