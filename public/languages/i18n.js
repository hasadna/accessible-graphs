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
 * @param {string} selectedLanguage
 */
const setLanguage = (selectedLanguage) => {
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
const setTranslationInHTML = (language) => {
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
const setTranslationByID = (id, langKey, language) => {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = i18n(langKey, language);
        element.dir = langDirection;
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
/**
 *
 * @param {string} language
 */
const changeLanguage = (language) => {
    // @ts-ignore: Property 'modal' does not exist on type 'JQuery<HTMLElement>'
    $('#language-popup').modal('toggle');
    console.log(language);
    setLanguage(language);
};
/**
 *
 * @param {string} language
 */
const handleLanguageSwitch = (language) => {
    document.getElementsByTagName('html')[0].lang = language;
    updateLinksAccessibility();
    let tutorialLanguage = language == 'en' ? 'english' : 'hebrew';
    let tutorialPath = `${tutorialLanguage}_guides/usage_tutorial_${language}.html`;
    let tutorialLink = document.getElementById('tutorial');
    if (tutorialLink) {
        tutorialLink.setAttribute('href', tutorialPath);
    }
    tutorialLink = document.getElementById('goToTutorial');
    if (tutorialLink) {
        tutorialLink.setAttribute('href', tutorialPath);
    }
};
//# sourceMappingURL=i18n.js.map