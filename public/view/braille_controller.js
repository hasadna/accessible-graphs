let brailleController = null;
class BrailleController {
    constructor(parent) {
        if (document.getElementById('braille_controller_text')) {
            throw 'Braille controller already created';
        }
        let textarea = $(document.createElement('textarea'));
        textarea.prop('id', 'braille_controller_text');
        textarea.text('⠊⠉⠑⢄⣀⡠⠊⠉⠑⢄⣀⡠⠊');
        textarea.keydown(this.onKeyDown);
        textarea.keyup(this.noopEventCatcher);
        textarea.keypress(this.noopEventCatcher);
        textarea.click(this.noopEventCatcher);
        textarea.mousedown(this.noopEventCatcher);
        textarea.mouseup(this.noopEventCatcher);
        parent.appendChild(textarea[0]);
        textarea.focus();
        this.textarea = textarea;
        this.listener = null;
        // Note: We initially tried document.addEventListener('selectionchange', func)
        //       but that didn't work in Firefox.
        setInterval(this.checkPosition, 50);
        this.currentPosition = -1;
    }
    checkPosition() {
        if (brailleController.currentPosition != brailleController.textarea.prop('selectionStart')) {
            brailleController.currentPosition = brailleController.textarea.prop('selectionStart');
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
        this.textarea.text(text);
    }
    setPositionChangeListener(listener) {
        this.listener = listener;
    }
    onPositionChange() {
        if (brailleController.listener == null) {
            return;
        }
        let cursorPosition = brailleController.currentPosition;
        let currrentChar = brailleController.textarea.text().slice(cursorPosition - 1, cursorPosition);
        let newEvent = {
            cursorPosition: cursorPosition,
            character: currrentChar,
            text: brailleController.textarea.text()
        };
        brailleController.listener(newEvent);
    }
}
//# sourceMappingURL=braille_controller.js.map