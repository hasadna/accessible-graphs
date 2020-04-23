
declare class google {
  static translate: TranslateElement;
}


declare class TranslateElement {
  constructor(
    configs: {
      pageLanguage: string,
      autoDisplay: boolean,
      layout: string,
    },
    element_id: string
  );

  static InlineLayout: any;

  // TypeScript gets _whiney_ without the following
  TranslateElement: any;
}


function google_translate_callback() {
  /**
   * @param {JSON} configs
   * @param {string} element_id
   */
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      autoDisplay: true,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    'translate_selection'
  );
}


/**
 * @param {string?} language
 * @return {boolean}
 */
function select_translation(language?: string): boolean {
  const preferred_language_code: string = (
    language || window.navigator['userLanguage'] || window.navigator.language
  ).split('-')[0];

  if (preferred_language_code.length <= 0) {
    console.warn('Cannot detect browser language, or no language parameter provided');
    return false;
  }

  const translation_selector: HTMLSelectElement = document.getElementById(
    'translate_selection'
  ).getElementsByTagName(
    'select'
  )[0];

  for (let i = 0; i < translation_selector.options.length; i++) {
    if (translation_selector.options[i].value === preferred_language_code) {
      translation_selector.options.selectedIndex = i;
      translation_selector.dispatchEvent(new Event('change', { 'bubbles': true }));
      return true;
    }
  }

  return false;
}


// Add auto-select translation callback when page load is finished
window.addEventListener('onload', (_event) => {
  select_translation();
});
