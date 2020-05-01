let langs = {};
let lang;
let langDirection;
/**
 * @returns {string} Defaults to "en" if no language defined by query string or local storage
 */
const getLanguage = () => {
    let lang = getQueryParam('lang');
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
const setLanguage = (selectedLang) => {
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
const setTranslationInHTML = (language) => {
    // For keys that match element IDs:
    langs[language].forEach((key) => {
        setTranslationByID(key, key, language);
    });
    setTranslationByID('select-language-header', 'selectLanguage', language);
    document.addEventListener('load', () => {
        document.getElementsByTagName('html')[0].lang = language;
    });
};
/**
 * @param {string} id
 * @param {string} langKey
 * @param {string} language
 */
const setTranslationByID = (id, langKey, language) => {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = i18n(langKey, language);
    }
};
/**
 * @param {string} langKey
 * @returns {string}
 */
const i18n = (langKey, language) => {
    if (langs[language].hasOwnProperty(langKey)) {
        return langs[language][langKey];
    }
    else {
        console.log(langKey);
        return langs['en'][langKey];
    }
};
/**
 *
 */
const initLanguage = () => {
    const lang = getLanguage();
    setLanguage(lang);
};
//# sourceMappingURL=i18n.js.map