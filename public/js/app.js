const langs = {};
let langDirection;
/**
 * @param {string} name
 * @returns {string}
 */
const getQueryParam = (name) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
};
/**
 * @param {string} name
 * @param {string} value
 */
const setQueryParam = (name, value) => {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set(name, value);
    urlParams.sort();
    window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
};
/**
 * Note, code is not currently used
 * @param {string} name
 */
const deleteQueryParam = (name) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.delete(name);
    window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
};
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
/**
 * @param {string} language
 */
const changeLanguage = (language) => {
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
    }
    else {
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
//# sourceMappingURL=app.js.map