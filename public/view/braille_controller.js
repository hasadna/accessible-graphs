class BrailleController {

    constructor(cursorEventsHandler, parent) {
        let oldContentArea = document.getElementById("brailleControllerArea");
        if (oldContentArea != null) {
            throw "Braille controller content area already exists";
        }
        let newContentArea = document.createElement("input");
        newContentArea.setAttribute("id", "brailleControllerArea");
        newContentArea.className = "hidden";
        //newContentArea.addEventListener("keydown", cursorEventsHandler);
        //newContentArea.addEventListener("keyup", cursorEventsHandler);
        newContentArea.addEventListener("keypress", cursorEventsHandler);
        newContentArea.addEventListener("click", cursorEventsHandler);
        newContentArea.addEventListener("mousedown", cursorEventsHandler);
        newContentArea.addEventListener("mouseup", cursorEventsHandler);
        parent.appendChild(newContentArea);
        this.contentArea = newContentArea;
        this.listener = null;
    }

    setBraille(text) {
        this.contentArea.value = text;
    }

    setRoutingKeyPressListener(listener) {
        this.listener = listener;
    }

    onRoutingKeyPress(event) {
        if (this.listener == null) {
            return;
        }
        let target = event.target;
        let cursorPosition = target.selectionStart;
        let currrentChar = target.value.slice(cursorPosition - 1, cursorPosition);
        let position = {
            cursorPosition: cursorPosition,
            character: currrentChar
        };
        let listener = this.listener;
        listener(position);
    }

}