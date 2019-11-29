let brailleController = null;

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
    let textarea = $(document.createElement('textarea'));
    textarea.prop('id', 'brailleControllerText');
    textarea.keydown(this.onKeyDown);
    textarea.keyup(this.noopEventCatcher);
    textarea.keypress(this.noopEventCatcher);
    textarea.click(this.noopEventCatcher);
    textarea.mousedown(this.noopEventCatcher);
    textarea.mouseup(this.noopEventCatcher);
    parent.appendChild(textarea[0]);
    textarea.focus();

    this.textarea = textarea;

    // Note: We initially tried document.addEventListener('selectionchange', func)
    //       but that didn't work in Firefox.
    setInterval(this.checkSelection, 50);
    this.currentPosition = -1;
  }

  static normalizeData(data: number[]): number[] {
    let result: number[] = Array();
    const min = Math.min(...data);
    const max = Math.max(...data);
    for (let i = 0; i < data.length; i++) {
      result[i] = (data[i] - min) / max * 16;
    }
    console.log('data=' + data);
    console.log('normalizedData=' + result);
    return result;
  }

  static numbersToBraille(data: number[]): string[] {
    data = BrailleController.normalizeData(data);
    return [
      "⣿⣿" + BrailleController.getBraille(data, 1, 0) + "⣿",
      "⠛⣿" + BrailleController.getBraille(data, 2, 1) + "⣿",
      "⣤⣿" + BrailleController.getBraille(data, 2, 0) + "⣿",
      "⠉⣿" + BrailleController.getBraille(data, 4, 3) + "⣿",
      "⠒⣿" + BrailleController.getBraille(data, 4, 2) + "⣿",
      "⠤⣿" + BrailleController.getBraille(data, 4, 1) + "⣿",
      "⣀⣿" + BrailleController.getBraille(data, 4, 0) + "⣿"
    ];
  }

  static getBraille(data, totalSegments, segmentNumber) {
    let brailleData = '';
    let i;
    for (i = 0; i < data.length; i+=1) {
      const d = data[i];
      const b = BrailleController.getBrailleValue(totalSegments, segmentNumber, d);
      brailleData += BrailleController.BRAILLE_SYMBOLS.charAt(b);
    }
    return brailleData;
  }

  /** The equivalent of getBraille(), for a 1:2 mapping of character to number.*/
  static getBraille2(data, totalSegments, segmentNumber) {
    let brailleData = '';
    let i;
    for (i = 0; i < data.length; i+=2) {
      const d1 = data[i];
      const d2 = data[i + 1];
      const b1 = BrailleController.getBrailleValue(totalSegments, segmentNumber, d1);
      const b2 = BrailleController.getBrailleValue(totalSegments, segmentNumber, d2);
      brailleData += BrailleController.BRAILLE_SYMBOLS2.charAt(b1*5 + b2);
    }
    return brailleData;
  }

  static getBrailleValue(totalSegments, segmentNumber, value) {
    const segmentSize = 16 / totalSegments;
    value = value - segmentSize * (segmentNumber);
    if (value < 0 || value >= segmentSize) {
      return 0;
    }
    const brailleDotMultiples = segmentSize / 4;
    return Math.floor(value / brailleDotMultiples) + 1;
  }

  checkSelection() {
    if (brailleController.currentPosition != brailleController.textarea.prop('selectionStart')) {
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
    event.preventDefault();
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
    let cursorPosition = brailleController.currentPosition;
    let currrentChar = brailleController.textarea.text().slice(cursorPosition, cursorPosition + 1);
    let newEvent = {
      position: cursorPosition,
      character: currrentChar,
      text: brailleController.textarea.text()
    };

    brailleController.selectionListener(newEvent);
  }
}
