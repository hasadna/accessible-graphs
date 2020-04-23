const langs = {};
let langDirection;

/**
 * @param {string} name
 * @returns {string}
 */
const getQueryParam = (name: string): string => {
  const queryString: string = window.location.search;
  const urlParams: URLSearchParams = new URLSearchParams(queryString);
  return urlParams.get(name);
};


/**
 * @param {string} name
 * @param {string} value
 */
const setQueryParam = (name: string, value: string) => {
  let urlParams = new URLSearchParams(window.location.search);
  urlParams.set(name, value);
  urlParams.sort();
  window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
};


/**
 * Note, code is not currently used
 * @param {string} name
 */
const deleteQueryParam = (name: string) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  urlParams.delete(name);
  window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
};


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
 * @param {string} selectLanguage
 */
const setLanguage = (selectedLang: string) => {
  const language = selectedLang;
  localStorage.setItem('language', language);
  setQueryParam('lang', language);
  langDirection = langs[language].direction;
  setTranslationInHTML(language);
  document.title = i18n('title', language);
};


/**
 * @param {string} language
 */
const setTranslationInHTML = (language: string) => {
  // For keys that match element IDs:
  langs[language].forEach((key) => {
    setTranslationByID(key, key, language);
  });

  setTranslationByID('select-language-header', 'selectLanguage', language);
  document.addEventListener('load', () => {
    document.getElementsByTagName('html')[0].lang = language;
  })
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
 * @param {string} language
 */
const changeLanguage = (language: string) => {
  document.getElementById('language-popup').setAttribute('modal', 'toggle');
  // Note, TypeScript complained about `.modal` not being present on JQuery element
  // $('#language-popup').modal('toggle');

  console.log(language);

  setLanguage(language);
  if (language === 'he') {
    document.body.setAttribute('dir', 'rtl');
    if (!document.getElementById('aboutP1').classList.contains('text-right')) {
      document.getElementsByTagName('H3')[0].classList.toggle('text-right');
      document.getElementById('aboutP1').classList.toggle('text-right');
      document.getElementById('aboutP2').classList.toggle('text-right');
      document.getElementById('aboutP3').classList.toggle('text-right');
    }
  } else {
    if (language === 'en') {
      document.body.setAttribute('dir', 'ltr');
      if (document.getElementById('aboutP1').classList.contains('text-right')) {
        document.getElementsByTagName('H3')[0].classList.toggle('text-right');
        document.getElementById('aboutP1').classList.toggle('text-right');
        document.getElementById('aboutP2').classList.toggle('text-right');
        document.getElementById('aboutP3').classList.toggle('text-right');
      }
    }
  }
};
