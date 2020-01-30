let brailleController = null;
class BrailleController {
    constructor(parent) {
        if (document.getElementById('brailleControllerText')) {
            throw 'Braille controller already created';
        }
        const textarea = $(document.createElement('textarea'));
        textarea.prop('id', 'brailleControllerText');
        textarea.keydown(this.onKeyDown);
        textarea.keyup(this.noopEventCatcher);
        textarea.keypress(this.noopEventCatcher);
        textarea.click(this.noopEventCatcher);
        textarea.mousedown(this.noopEventCatcher);
        textarea.mouseup(this.noopEventCatcher);
        textarea.attr('aria-describedby', 'speechOffNote');
        parent.appendChild(textarea[0]);
        const speechOffNote = $(document.createElement('p'));
        speechOffNote.prop('id', 'speechOffNote');
        speechOffNote.text('Please turn off your screen reader\'s speech. The system includes its own speech output.');
        speechOffNote.prop('style', 'display:none');
        parent.appendChild(speechOffNote[0]);
        textarea.focus();
        this.textarea = textarea;
        // Note: We initially tried document.addEventListener('selectionchange', func)
        //       but that didn't work in Firefox.
        setInterval(this.checkSelection, 50);
        this.currentPosition = -1;
        this.data = null;
        this.currentZoomLevel = 0;
        this.currentPanningStep = 0;
    }
    static normalizeData(data) {
        const result = Array();
        const min = Math.min(...data);
        const max = Math.max(...data);
        for (let i = 0; i < data.length; i++) {
            result[i] = (data[i] - min) / (max - min) * 15.99;
        }
        console.log(`data=${data}`);
        console.log(`normalizedData=${result}`);
        return result;
    }
    setData(data) {
        this.data = data;
    }
    static numbersToBraille(data) {
        data = BrailleController.normalizeData(data);
        let result = [];
        result.push('⣿⣿' + BrailleController.getBraille(data, 0, 0) + '⣿');
        result.push('⣤⣿' + BrailleController.getBraille(data, 1, 0) + '⣿');
        result.push('⠤⣿' + BrailleController.getBraille(data, 1, 1) + '⣿');
        result.push('⠶⣿' + BrailleController.getBraille(data, 1, 2) + '⣿');
        result.push('⠒⣿' + BrailleController.getBraille(data, 1, 3) + '⣿');
        result.push('⠛⣿' + BrailleController.getBraille(data, 1, 4) + '⣿');
        for (let i = 0; i < 4; i++) {
            result.push('⣀⣿' + BrailleController.getBraille(data, 2, i) + '⣿');
        }
        for (let i = 4; i < 8; i++) {
            result.push('⠤⣿' + BrailleController.getBraille(data, 2, i) + '⣿');
        }
        for (let i = 8; i < 12; i++) {
            result.push('⠒⣿' + BrailleController.getBraille(data, 2, i) + '⣿');
        }
        result.push('⠉⣿' + BrailleController.getBraille(data, 2, 12) + '⣿');
        return result;
    }
    static getBraille(data, currentZoomLevel, currentPanningStep) {
        let brailleData = '';
        for (let i = 0; i < data.length; i += 1) {
            const d = data[i];
            const b = BrailleController.getBrailleValue(currentZoomLevel, currentPanningStep, d);
            brailleData += BrailleController.BRAILLE_SYMBOLS.charAt(b);
        }
        return brailleData;
    }
    /** The equivalent of getBraille(), for a 1:2 mapping of character to number.*/
    static getBraille2(data, totalSegments, segmentNumber) {
        let brailleData = '';
        for (let i = 0; i < data.length; i += 2) {
            const d1 = data[i];
            const d2 = data[i + 1];
            const b1 = BrailleController.getBrailleValue(totalSegments, segmentNumber, d1);
            const b2 = BrailleController.getBrailleValue(totalSegments, segmentNumber, d2);
            brailleData += BrailleController.BRAILLE_SYMBOLS2.charAt(b1 * 5 + b2);
        }
        return brailleData;
    }
    static getBrailleValue(currentZoomLevel, currentPanningStep, value) {
        const windowSize = 16 / Math.pow(2, currentZoomLevel);
        value = value - currentPanningStep * (windowSize / 4);
        if (value < 0 || value >= windowSize) {
            return 0;
        }
        const brailleDotMultiples = windowSize / 4;
        return Math.floor(value / brailleDotMultiples) + 1;
    }
    checkSelection() {
        if (brailleController.currentPosition !== brailleController.textarea.prop('selectionStart')) {
            brailleController.currentPosition = brailleController.textarea.prop('selectionStart');
            brailleController.onSelection();
        }
    }
    noopEventCatcher(event) {
        event.preventDefault();
    }
    onKeyDown(event) {
        if (event.key.includes('Arrow') || event.key.includes('Home') || event.key.includes('End')) {
            return; // OK
        }
        if (event.key == 'j') {
            brailleController.currentZoomLevel != 2 ? brailleController.currentZoomLevel++ : brailleController.currentZoomLevel = 2;
            brailleController.currentPanningStep = 0;
            brailleController.updateDisplaidBraille();
        }
        if (event.key == 'u') {
            brailleController.currentZoomLevel != 0 ? brailleController.currentZoomLevel-- : brailleController.currentZoomLevel = 0;
            brailleController.currentPanningStep = 0;
            brailleController.updateDisplaidBraille();
        }
        if (event.key == 'i') {
            let maxPanningStep = brailleController.getMaxPanningStep();
            brailleController.currentPanningStep != maxPanningStep ? brailleController.currentPanningStep++ : brailleController.currentPanningStep = maxPanningStep;
            brailleController.updateDisplaidBraille();
        }
        if (event.key == 'k') {
            brailleController.currentPanningStep != 0 ? brailleController.currentPanningStep-- : brailleController.currentPanningStep = 0;
            brailleController.updateDisplaidBraille();
        }
        event.preventDefault();
    }
    updateDisplaidBraille() {
        let allBrailleData = BrailleController.numbersToBraille(brailleController.data);
        let index = 0;
        if (brailleController.currentZoomLevel == 1) {
            index += 1;
        }
        else if (brailleController.currentZoomLevel == 2) {
            index += 6;
        }
        index += brailleController.currentPanningStep;
        brailleController.setBraille(allBrailleData[index]);
    }
    getMaxPanningStep() {
        // The relation between currentZoomLevel and maxPanningStep is discribed by the following expression:
        // y = 2x^2 + 2x
        // when x is currentZoomLevel, and y is the MaxPanningStep
        let x = brailleController.currentZoomLevel;
        let y = 2 * Math.pow(x, 2) + 2 * x;
        return y;
    }
    setBraille(text) {
        this.textarea.text(text);
    }
    setSelectionListener(listener) {
        this.selectionListener = listener;
    }
    onSelection() {
        if (brailleController.selectionListener == null) {
            return;
        }
        const cursorPosition = brailleController.currentPosition;
        const currrentChar = brailleController.textarea.text().slice(cursorPosition, cursorPosition + 1);
        const newEvent = {
            position: cursorPosition,
            character: currrentChar,
            text: brailleController.textarea.text()
        };
        brailleController.selectionListener(newEvent);
    }
}
// These symbols map 1:1 to numbers.
BrailleController.BRAILLE_SYMBOLS = '⠀⣀⠤⠒⠉';
// These symbols map 1:2 to numbers. Each symbol maps to 2 numbers.
BrailleController.BRAILLE_SYMBOLS2 = '⠀⢀⠠⠐⠈⡀⣀⡠⡐⡈⠄⢄⠤⠔⠌⠂⢂⠢⠒⠊⠁⢁⠡⠑⠉';
//# sourceMappingURL=braille_controller.js.map