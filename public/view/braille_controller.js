let brailleController = null;
// A flag for debugging
// Reset it to true to have the BrailleController listen for all events of the textarea which contains the braille text
let listenForAllEvents = false;
class BrailleController {
    constructor(parent, data) {
        if (document.getElementById('brailleControllerText')) {
            throw new Error('Braille controller already created');
        }
        const textarea = document.createElement('textarea');
        textarea.id = 'brailleControllerText';
        // In Chrome, readonly textarea doesn't support moving the cursor via the keyboard, or even cursor blinking
        // therefore, we can't use the readonly property, rather, we have to prevent the user from entering characters to the textarea. See:
        //https://stackoverflow.com/questions/19005579/how-to-enable-cursor-move-while-using-readonly-attribute-in-input-field-in-chrom
        textarea.setAttribute('maxlength', '0');
        textarea.addEventListener('keydown', this.onKeyDown);
        textarea.addEventListener('oncut', this.ignoreEvent);
        textarea.addEventListener('mousedown', this.onSecondRoutingKeyPress);
        if (listenForAllEvents == true) {
            BrailleController.bindAllEvents(textarea, BrailleController.logEvent);
        }
        // Limit the textarea to one line using css techniques
        textarea.style.whiteSpace = 'nowrap';
        textarea.style.overflowX = 'auto';
        textarea.addEventListener('focus', this.onFocus);
        const brailleControllerInstructions = document.createElement('p');
        brailleControllerInstructions.innerHTML = 'Use Left / Right arrows to navigate the graph.<br> Use space bar to get more info about the value under the cursor.<br>To start, focus or click on the text box below:';
        parent.appendChild(brailleControllerInstructions);
        let brailleControllerLabel = document.createElement('label');
        brailleControllerLabel.innerHTML = 'Start navigating the graph';
        brailleControllerLabel.setAttribute('for', 'brailleControllerText');
        parent.appendChild(brailleControllerLabel);
        parent.appendChild(textarea);
        this.textarea = textarea;
        // Note: We initially tried document.addEventListener('selectionchange', func)
        //       but that didn't work in Firefox.
        setInterval(this.checkSelection, 50);
        this.currentPosition = 0;
        this.data = data;
        this.initializeBraille();
    }
    /**
     * @param {HTMLTextAreaElement} element
     * @param {callback} callback
     */
    static bindAllEvents(element, callback) {
        for (let key in element) {
            if (/^on/.test(key)) {
                element.addEventListener(key.slice(2), callback);
            }
        }
    }
    static normalizeData(data, range) {
        const result = Array();
        for (let i = 0; i < data.length; i++) {
            result[i] = BrailleController.normalizeDataElement(data[i], range);
        }
        return result;
    }
    static normalizeDataElement(dataElement, range) {
        const min = parseFloat(getUrlParam('minValue'));
        const max = parseFloat(getUrlParam('maxValue'));
        if (dataElement < min) {
            dataElement = min;
        }
        if (dataElement > max) {
            dataElement = max;
        }
        if (min == max) {
            return 0;
        }
        let normalizedDataElement = (dataElement - min) / (max - min) * (range - 0.01);
        return normalizedDataElement;
    }
    static logEvent(event) {
        console.debug(event.type);
    }
    initializeBraille() {
        let leftSideData = BrailleController.normalizeData(this.data, 4);
        let allBrailleForeLeftSide = BrailleController.getAllBrailleForLeftSide(leftSideData);
        let initialBraile = '';
        let dataLength = allBrailleForeLeftSide.length;
        let iteration = 1;
        let i = 0;
        while (i < dataLength) {
            while (i < 29 * iteration && i < dataLength) {
                initialBraile += allBrailleForeLeftSide[i];
                i++;
            }
            for (let j = 0; j < 29 * iteration - i; j++) {
                initialBraile += '⠀';
            }
            initialBraile += '⡇';
            for (let j = 0; j < 10; j++) {
                initialBraile += '⠀';
            }
            iteration++;
        }
        this.setBraille(initialBraile);
        this.updateRightSideBraille(0);
    }
    static getAllBrailleForLeftSide(data) {
        let brailleData = '';
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const b = BrailleController.getBrailleValue(d);
            brailleData += BrailleController.BRAILLE_SYMBOLS.charAt(b);
        }
        return brailleData;
    }
    static getBrailleForRightSide(dataElement) {
        let result = '';
        let onCharscount = Math.round(dataElement);
        let i = 0;
        while (i < onCharscount) {
            result += '⠒';
            i++;
        }
        while (i < 10) {
            result += '⠀';
            i++;
        }
        return result;
    }
    updateRightSideBraille(position) {
        let positionInData = position - (position / 40 | 0) * 11;
        let rightSideDataElement = BrailleController.normalizeDataElement(this.data[positionInData], 10);
        let rightSideBraille = BrailleController.getBrailleForRightSide(rightSideDataElement);
        let positionToInsertBraille = (position / 40 | 0) * 40 + 30;
        let brailleText = this.getBraille();
        brailleText = BrailleController.splice(brailleText, rightSideBraille, positionToInsertBraille);
        this.setBraille(brailleText);
        this.setCursorPosition(position);
    }
    static getBrailleValue(value) {
        return value + 1 | 0;
    }
    checkSelection() {
        if (brailleController.currentPosition !== brailleController.textarea.selectionStart) {
            brailleController.currentPosition = brailleController.textarea.selectionStart;
            brailleController.onSelection();
        }
    }
    ignoreEvent(event) {
        event.preventDefault();
    }
    onKeyDown(event) {
        if (event.key.includes('ArrowDown') || event.key.includes('ArrowUp') || event.key.includes('Backspace') || event.key.includes('Delete')) {
            event.preventDefault();
        }
        if (event.key == ' ') {
            const position = brailleController.currentPosition;
            if (position % 40 >= 0 && position % 40 < 29 && position < brailleController.data.length) {
                reportText(true); // On space key press
            }
            event.preventDefault();
        }
    }
    onSecondRoutingKeyPress(event) {
        const position = brailleController.currentPosition;
        if (position % 40 >= 0 && position % 40 < 29 && position < brailleController.data.length) {
            reportText(true);
        }
    }
    setBraille(text) {
        this.textarea.value = text;
    }
    getBraille() {
        return this.textarea.value;
    }
    setSelectionListener(listener) {
        this.selectionListener = listener;
    }
    setCursorPosition(position) {
        // The cursor will leave it's original position when setting a new braille text to the textarea
        // so return it to the previous position in which it was before setting the braille text
        this.textarea.selectionEnd = position;
        this.textarea.selectionStart = position;
    }
    onSelection() {
        if (brailleController.selectionListener == null) {
            return;
        }
        const cursorPosition = brailleController.currentPosition;
        const currrentChar = brailleController.textarea.value.slice(cursorPosition, cursorPosition + 1);
        const newEvent = {
            position: cursorPosition,
            character: currrentChar,
            text: brailleController.textarea.value
        };
        brailleController.selectionListener(newEvent);
    }
    static splice(string, substring, position) {
        return string.slice(0, position) + substring + string.slice(position + substring.length);
    }
    onFocus(event) {
        // @ts-ignore
        if (!window.chrome) {
            brailleController.onSelection();
        }
    }
}
// These symbols map 1:1 to numbers.
BrailleController.BRAILLE_SYMBOLS = '⠀⣀⠤⠒⠉';
//# sourceMappingURL=braille_controller.js.map