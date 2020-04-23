let brailleController = null;
// A flag for debugging
// Reset it to true to have the BrailleController listen for all events of the textarea which contains the braille text
let listenForAllEvents = false;

class BrailleController {
  // These symbols map 1:1 to numbers.
  static BRAILLE_SYMBOLS = '⠀⣀⠤⠒⠉';

  textarea: HTMLTextAreaElement;
  selectionListener: (this: void, e: Event) => void;
  currentPosition: number;
  data: number[];

  constructor(parent, data) {
    if (document.getElementById('brailleControllerText')) {
      throw new Error('Braille controller already created');
    }
    const textarea: HTMLTextAreaElement = document.createElement('textarea');
    textarea.id = 'brailleControllerText';
    // In Chrome, readonly textarea doesn't support moving the cursor via the keyboard, or even cursor blinking
    // therefore, we can't use the readonly property, rather, we have to prevent the user from entering characters to the textarea. See:
    //https://stackoverflow.com/questions/19005579/how-to-enable-cursor-move-while-using-readonly-attribute-in-input-field-in-chrom
    textarea.setAttribute('maxlength', '0');
    textarea.addEventListener('keydown', this.onKeyDown);
    /**
     * TO-DO: correct TypeScript complaints about...
     *  - `(event: Event) => void` is not assignable to parameter of type 'ClipboardEvent'
     *  - Property `clipboardData` is missing in type `(event: Event) => void`
     */
    // @ts-ignore
    textarea.oncut(this.ignoreEvent);
    textarea.addEventListener('mousedown', this.onSecondRoutingKeyPress);
    if (listenForAllEvents == true) {
      BrailleController.bindAllEvents(textarea[0], this.logEvent);
    }
    // Limit the textarea to one line using css techniques
    textarea.style.whiteSpace = 'nowrap';
    textarea.style.overflowX = 'auto';

    const brailleControllerLabel: HTMLLabelElement = document.createElement('label');
    brailleControllerLabel.innerHTML = 'Use Left / Right arrows to navigate the graph.<br> Use space bar to get more info about the value under the cursor.';
    brailleControllerLabel.setAttribute('for', 'brailleControllerText');
    parent.appendChild(brailleControllerLabel[0]);
    parent.appendChild(textarea[0]);

    this.textarea = textarea;

    // Note: We initially tried document.addEventListener('selectionchange', func)
    //       but that didn't work in Firefox.
    setInterval(this.checkSelection, 50);
    this.currentPosition = -1;
    this.data = data;
    this.initializeBraille();
  }

  /**
   * @param {HTMLTextAreaElement} element
   * @param {callback} callback
   */
  static bindAllEvents(element: HTMLTextAreaElement, callback) {
    let events_list = [];
    for (var key in this) {
      if (key.indexOf('on') === 0) {
        events_list.push(key.slice(2));
      }
    }
    element.addEventListener(events_list.join(' '), callback)
  }

  static normalizeData(data: number[], range: number): number[] {
    const result: number[] = Array();
    for (let i = 0; i < data.length; i++) {
      result[i] = BrailleController.normalizeDataElement(data[i], range);
    }
    return result;
  }

  static normalizeDataElement(dataElement: number, range: number): number {
    const min: number = parseFloat(getUrlParam('minValue'));
    const max: number = parseFloat(getUrlParam('maxValue'));
    if (dataElement < min) {
      dataElement = min;
    }
    if (dataElement > max) {
      dataElement = max;
    }
    if (min == max) {
      return 0;
    }
    let normalizedDataElement: number = (dataElement - min) / (max - min) * (range - 0.01);
    return normalizedDataElement;
  }

  logEvent(event) {
    console.debug(event.type);
  }

  initializeBraille() {
    let leftSideData: number[] = BrailleController.normalizeData(this.data, 4);
    let allBrailleForeLeftSide: string = BrailleController.getAllBrailleForLeftSide(leftSideData);
    let initialBraile: string = '';
    let dataLength: number = allBrailleForeLeftSide.length;
    let iteration: number = 1;
    let i: number = 0;
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

  static getAllBrailleForLeftSide(data: number[]): string {
    let brailleData: string = '';
    for (let i = 0; i < data.length; i++) {
      const d: number = data[i];
      const b: number = BrailleController.getBrailleValue(d);
      brailleData += BrailleController.BRAILLE_SYMBOLS.charAt(b);
    }
    return brailleData;
  }

  static getBrailleForRightSide(dataElement: number): string {
    let result: string = '';
    let onCharscount: number = Math.round(dataElement);
    let i: number = 0;
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

  updateRightSideBraille(position: number) {
    let positionInData: number = position - Math.floor(position / 40) * 11;
    let rightSideDataElement: number = BrailleController.normalizeDataElement(this.data[positionInData], 10);
    let rightSideBraille: string = BrailleController.getBrailleForRightSide(rightSideDataElement);
    let positionToInsertBraille: number = Math.floor(position / 40) * 40 + 30;
    let brailleText: string = this.getBraille();
    brailleText = BrailleController.splice(brailleText, rightSideBraille, positionToInsertBraille);
    this.setBraille(brailleText);
    this.setCursorPosition(position);
  }

  static getBrailleValue(value: number): number {
    return Math.floor(value) + 1;
  }

  checkSelection() {
    if (brailleController.currentPosition !== brailleController.textarea.prop('selectionStart')) {
      brailleController.currentPosition = brailleController.textarea.prop('selectionStart');
      brailleController.onSelection();
    }
  }


  ignoreEvent(event: Event) {
    event.preventDefault();
  }

  onKeyDown(event) {
    if (event.key.includes('ArrowDown') || event.key.includes('ArrowUp') || event.key.includes('Backspace') || event.key.includes('Delete')) {
      event.preventDefault();
    }
    if (event.key == ' ') {
      const position = brailleController.currentPosition;
      if (position % 40 >= 0 && position % 40 < 29 && position < brailleController.data.length) {
        speakSelectedCellPositionInfo(); // On space key press
      }
      event.preventDefault();
    }
  }

  onSecondRoutingKeyPress(event) {
    const position: number = brailleController.currentPosition;
    if (position % 40 >= 0 && position % 40 < 29 && position < brailleController.data.length) {
      speakSelectedCellPositionInfo();
    }
  }

  setBraille(text: string) {
    this.textarea.setAttribute('text', text);
  }

  getBraille(): string {
    return this.textarea.getAttribute('text');
  }

  setSelectionListener(listener) {
    this.selectionListener = listener;
  }

  setCursorPosition(position: number) {
    // The cursor will leave it's original position when setting a new braille text to the textarea
    // so return it to the previous position in which it was before setting the braille text
    this.textarea.setAttribute('selectionEnd', position.toString());
    this.textarea.setAttribute('selectionStart', position.toString());
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

  static splice(string: string, substring: string, position: number): string {
    return string.slice(0, position) + substring + string.slice(position + substring.length);
  }
}
