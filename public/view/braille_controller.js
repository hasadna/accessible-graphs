let brailleController = null;

class BrailleController {

  constructor(parent) {
    if (document.getElementById('braille_controller_text')) {
      throw 'Braille controller already created';
    }
    let textarea = document.createElement('textarea');
    textarea.setAttribute('id', 'braille_controller_text');
    textarea.value = '⠊⠉⠑⢄⣀⡠⠊⠉⠑⢄⣀⡠⠊';
    //textarea.className = 'hidden';
    textarea.addEventListener('keydown', this.eventCatcher);
    textarea.addEventListener('keyup', this.eventCatcher);
    textarea.addEventListener('keypress', this.eventCatcher);
    textarea.addEventListener('click', this.eventCatcher);
    textarea.addEventListener('mousedown', this.eventCatcher);
    textarea.addEventListener('mouseup', this.eventCatcher);
    parent.appendChild(textarea);
    textarea.focus();

    this.textarea = textarea;
    this.listener = null;
    this.lastEvent = null;
    // TODO: check if we still need the following line
    document.addEventListener('selectionchange',
      this.onRoutingKeyPress);
    document.addEventListener('selectionchange', function () {
      brailleController.onRoutingKeyPress();
    });
  }

  eventCatcher(event) {
    // Second rooting key press in the same position is received as a mousedown event
    if (event.target.id == 'braille_controller_text') {
      // We ignore other events since we assume they belong to the same rooting key press
      if (event.type == 'mousedown') {
        if (brailleController.lastEvent != null) {
          brailleController.listener(brailleController.lastEvent);
        } else {
          console.error('BrailleController.lastEvent is null on supposedly second rooting key press');
        }
      }
    } else {
      debugger;
      console.log('Event caught: ' + event);
    }
  }

  setBraille(text) {
    this.textarea.value = text;
  }

  setRoutingKeyPressListener(listener) {
    this.listener = listener;
  }

  onRoutingKeyPress() {
    let event = document.getSelection();

    if (event.baseNode == null ||
      event.baseNode.parentElement == null ||
      event.baseNode.parentElement.offsetParent == null ||
      event.baseNode.parentElement.offsetParent.id != 'braille_controller_text') {
      console.log('Selection not on braille_controller_text');
    }

    if (brailleController.listener == null) {
      return;
    }
    let cursorPosition = event.baseOffset;
    // TODO: maybe we should pass to slice start index of cursorPosition,
    // and end index of cursorPosition + 1
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
