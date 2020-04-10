/**
 * Set `dataInput` element focus, and adds `populateTtsList()` callback to `window.speechSynthesis.onvoiceschanged`
 */
function initializeAppScript() {
    document.getElementById('dataInput').focus();
    populateTtsList();
    // In Chrome, we need to wait for the "voiceschanged" event to be fired before we can get the list of all voices. See
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
    // for more details
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateTtsList;
    }
}
/**
 *
 * @param {string} input - String with `\r\n` or `\n` line separators, and either spaces or tabs separating items
 */
function getMinMaxValuesFrom(input) {
    // TODO: Add a method to parse the input data to a array of arrays for example,
    //       so it can be used here and in processData().
    //
    // Note: Parsing input into a matrix of values may be better
    //       via a promising iterator or generator.
    let maxValue = -Infinity;
    let minValue = Infinity;
    input.split(/\r\n|\n/).forEach((line) => {
        line.split(/\t| +/).forEach((value) => {
            const value_as_float = parseFloat(value);
            if (value_as_float > maxValue) {
                maxValue = value_as_float;
            }
            if (value_as_float < minValue) {
                minValue = value_as_float;
            }
        });
    });
    return { maxValue, minValue };
}
//# sourceMappingURL=app.js.map