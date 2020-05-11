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
