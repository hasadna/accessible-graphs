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
    window.history.pushState('Accessible Graphs', 'Accessible Graphs', window.location.pathname + '?' + urlParams.toString());
};
/**
 * Note, code is not currently used
 * @param {string} name
 */
const deleteQueryParam = (name) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.delete(name);
    window.history.pushState('Accessible Graphs', 'Accessible Graphs', window.location.pathname + '?' + urlParams.toString());
};
//# sourceMappingURL=utils.js.map