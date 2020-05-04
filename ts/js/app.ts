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
  let urlParams: URLSearchParams = new URLSearchParams(window.location.search);
  urlParams.set(name, value);
  urlParams.sort();
  window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
};


/**
 * Note, code is not currently used
 * @param {string} name
 */
const deleteQueryParam = (name: string) => {
  const queryString: string = window.location.search;
  const urlParams: URLSearchParams = new URLSearchParams(queryString);
  urlParams.delete(name);
  window.history.pushState('Sensory interface', 'Sensory interface', window.location.pathname + '?' + urlParams.toString());
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
