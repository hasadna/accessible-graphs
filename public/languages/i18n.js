let langs = {};
let lang;
let langDirection;


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

// Save language in local storage if not already there, update HTML
const setLanguage = (selectedLang) => {
  lang = selectedLang;
  localStorage.setItem('language', lang);
  setQueryParam('lang', lang);
  langDirection = langs[lang].direction;
  setTranslationInHTML();
  document.title = i18n('title');
};

const setTranslationInHTML = () => {
  // For keys that match element IDs:
  for (let key in langs[lang]) {
    setTranslationByID(key, key);
  }
  setTranslationByID('select-language-header', 'selectLanguage');
  handleLanguageSwitch(lang);
};

const setTranslationByID = (id, langKey) => {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = i18n(langKey);
  }
};

const i18n = langKey => {
  if (langs[lang].hasOwnProperty(langKey)) {
    return langs[lang][langKey];
  } else {
    console.log(langKey);
    return langs['en'][langKey];
  }
};

const initLanguage = () => {
  // Get language from url or local storage
  lang = getLanguage();
  // Set it, and update everything needed
  setLanguage(lang);
};


//Save on the design between language
const changeLanguage = (language) => {
  $('#language-popup').modal('toggle');
  console.log(language);
  setLanguage(language);
};

const handleLanguageSwitch = (language) => {
  $('html').attr('lang', lang); //'language' value is retrieved from a cookie
  updateLinksAccessibility();
  let tutorialLanguage =  lang == 'en' ? 'english' : 'hebrew';
  let tutorialPath = `${tutorialLanguage}_guides/usage_tutorial_${lang}.html`;
  $('#tutorial').attr('href', tutorialPath);
  $('#goToTutorial') .attr('href', tutorialPath);
}
