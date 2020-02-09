let brailleController = null;
// A flag for debugging
// Reset it to true to have the BrailleController listen for all events of the textarea which contains the braille text
let listenForAllEvents = false;

class BrailleController {
  // These symbols map 1:1 to numbers.
  static BRAILLE_SYMBOLS = '⠀⣀⠤⠒⠉';
  // These symbols map 1:2 to numbers. Each symbol maps to 2 numbers.
  static BRAILLE_SYMBOLS2 = '⠀⢀⠠⠐⠈⡀⣀⡠⡐⡈⠄⢄⠤⠔⠌⠂⢂⠢⠒⠊⠁⢁⠡⠑⠉';

  textarea: JQuery<HTMLElement>;
  selectionListener: (this: void, e: Event) => void;
  currentPosition: number;

  constructor(parent) {
    if (document.getElementById('brailleControllerText')) {
      throw 'Braille controller already created';
    }
    const textarea = $(document.createElement('textarea'));
    textarea.prop('id', 'brailleControllerText');
    // In Chrome, readonly textarea doesn't support moving the cursor via the keyboard, or even cursor blinking
    // therefore, we can't use the readonly property, rather, we have to ignore none navigational key presses. See:
    //https://stackoverflow.com/questions/19005579/how-to-enable-cursor-move-while-using-readonly-attribute-in-input-field-in-chrom
    textarea.keydown(this.onKeyDown);
    textarea.mousedown(this.onSecondRoutingKeyPress);
    textarea.keyup(this.noopEventCatcher);
    textarea.keypress(this.noopEventCatcher);
    textarea.click(this.noopEventCatcher);
    textarea.mouseup(this.noopEventCatcher);
    if (listenForAllEvents == true) {
      textarea.bind(BrailleController.getAllEvents(textarea[0]), this.logEvent);
    }
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
  }

  static normalizeData(data: number[], maxValue: number): number[] {
    const result: number[] = Array();
    const min = Math.min(...data);
    const max = Math.max(...data);
    for (let i = 0; i < data.length; i++) {
      result[i] = (data[i] - min) / (max - min) * (maxValue - 0.01);
    }
    console.log(`data=${data}`);
    console.log(`normalizedData=${result}`);
    return result;
  }

  static getAllEvents(element) {
    let result = [];
    for (let key in element) {
      if (key.indexOf('on') === 0) {
        result.push(key.slice(2));
      }
    }
    return result.join(' ');
  }

  logEvent(event) {
    console.debug(event.type);
  }

  static numbersToBraille(data: number[]): string {
    let leftSideData = BrailleController.normalizeData(data, 16);
    let rightSideData = BrailleController.normalizeData(data, 12);
    let rightSideDataElement = rightSideData[brailleController.currentPosition];
    return BrailleController.getBrailleForLeftSide(leftSideData) + '⡇' +
    BrailleController.getBrailleForRightSide(rightSideDataElement);
  }

  static getBrailleForLeftSide(data) {
    let brailleData = '';
    for (let i = 0; i < data.length; i += 1) {
      const d = data[i];
      const b = BrailleController.getBrailleValue(d);
      brailleData += BrailleController.BRAILLE_SYMBOLS.charAt(b);
    }
    return brailleData;
  }

  static getBrailleForRightSide(dataElement: number) {
    let result = '';
    let count = Math.round(dataElement);
    while (count > 0) {
      result += '⠒';
      count--;
    }
    return result;
  }

  /** The equivalent of getBraille(), for a 1:2 mapping of character to number.*/
  /*
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
  */

  static getBrailleValue(value) {
    return Math.floor(value / 4) + 1;
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
    if (event.key == ' ') {
      speakSelectedCellPositionInfo(); // On space key press
    }
    event.preventDefault();
  }

  onSecondRoutingKeyPress(event) {
    speakSelectedCellPositionInfo();
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
