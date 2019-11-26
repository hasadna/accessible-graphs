let brailleController = null;

class BrailleController {

  constructor(parent) {
    if (document.getElementById('braille_controller_text')) {
      throw 'Braille controller already created';
    }
    let textarea = document.createElement('textarea');
    textarea.setAttribute('id', 'braille_controller_text');

    textarea.value = '⠊⠉⠑⢄⣀⡠⠊⠉⠑⢄⣀⡠⠊';
    textarea.addEventListener('keydown', this.onKeyDown);
    textarea.addEventListener('keyup', this.noopEventCatcher);
    textarea.addEventListener('keypress', this.noopEventCatcher);
    textarea.addEventListener('click', this.noopEventCatcher);
    textarea.addEventListener('mousedown', this.noopEventCatcher);
    textarea.addEventListener('mouseup', this.noopEventCatcher);
    parent.appendChild(textarea);
    textarea.focus();

    this.textarea = textarea;
    this.listener = null;
    this.lastEvent = null;

    // Note: We initially tried document.addEventListener('selectionchange', func)
    //       but that didn't work in Firefox.
    setInterval(this.checkPosition, 50);
    this.currentPosition = -1;
  }

  checkPosition() {
    if (brailleController.currentPosition != brailleController.textarea.selectionStart) {
      brailleController.currentPosition = brailleController.textarea.selectionStart;
      brailleController.onPositionChange();
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
    this.textarea.value = text;
  }

  setPositionChangeListener(listener) {
    this.listener = listener;
  }

  onPositionChange() {
    if (brailleController.listener == null) {
      return;
    }
    let cursorPosition = brailleController.currentPosition;
    let currrentChar = brailleController.textarea.value.slice(cursorPosition - 1, cursorPosition);
    let newEvent = {
      cursorPosition: cursorPosition,
      character: currrentChar,
      text: brailleController.textarea.value
    };
    this.lastEvent = newEvent;

    brailleController.listener(newEvent);
  }
}