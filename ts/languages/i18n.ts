let langs = {};
let lang;
let langDirection;

/**
 * @returns {string} Defaults to "en" if no language defined by query string or local storage
 */
const getLanguage = (): string => {
  let lang: string = getQueryParam('lang');
  if (lang) {
    return lang.toLowerCase();
  }

  lang = localStorage.getItem('language');
  if (lang) {
    return lang.toLowerCase();
  }

  return 'en';
};


/**
 * Save language in local storage if not already there, update HTML
 * @param {string} selectedLanguage
 */
const setLanguage = (selectedLanguage: string) => {
  const language = selectedLanguage;
  localStorage.setItem('language', language);
  setQueryParam('lang', language);
  langDirection = langs[language].direction;
  setTranslationInHTML(language);
  document.title = i18n('title', language);
  handleLanguageSwitch(language);
};


/**
 * @param {string} language
 */
const setTranslationInHTML = (language: string) => {
  // For keys that match element IDs:
  for (let key in langs[language]) {
    if (langs[language].hasOwnProperty(key)) {
      setTranslationByID(key, key, language);
    }
  }

  setTranslationByID('select-language-header', 'selectLanguage', language);
};


/**
 * @param {string} id
 * @param {string} langKey
 * @param {string} language
 */
const setTranslationByID = (id: string, langKey: string, language: string) => {
  const element: HTMLElement = document.getElementById(id);
  if (element) {
    element.innerHTML = i18n(langKey, language);
    element.dir = langDirection;
  }
};


/**
 * @param {string} langKey
 * @returns {string}
 */
const i18n = (langKey: string, language: string): string => {
  if (langs[language].hasOwnProperty(langKey)) {
    return langs[language][langKey];
  } else {
    console.log(langKey);
    return langs['en'][langKey];
  }
};


/**
 *
 */
const initLanguage = () => {
  const lang: string = getLanguage();
  setLanguage(lang);
};


/**
 * 
 * @param {string} language 
 */
const changeLanguage = (language: string) => {
  // @ts-ignore: Property 'modal' does not exist on type 'JQuery<HTMLElement>'
  $('#language-popup').modal('toggle');
  console.log(language);
  setLanguage(language);
};


/**
 * 
 * @param {string} language 
 */
const handleLanguageSwitch = (language: string) => {
  document.getElementsByTagName('html')[0].lang = language;
  updateLinksAccessibility();
  let tutorialLanguage: string = language == 'en' ? 'english' : 'hebrew';
  let tutorialPath: string = `${tutorialLanguage}_guides/usage_tutorial_${language}.html`;
  let tutorialLink: HTMLElement = document.getElementById('tutorial');
  if (tutorialLink) {
    tutorialLink.setAttribute('href', tutorialPath);
  }
  tutorialLink = document.getElementById('goToTutorial');
  if (tutorialLink) {
    tutorialLink.setAttribute('href', tutorialPath);
  }
}
