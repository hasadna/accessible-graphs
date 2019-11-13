class BrailleController {

    constructor(parent) {
        this.parent = parent;
        let contentArea = this.parent.firstChild;
        contentArea.addEventListener("selectionchange", this.onRoutingKeyPress);
        this.listener = null;
    }

    create() {
        let parent = this.parent;
        let oldContentArea = parent.firstChild;
        if (oldContentArea != null) {
            parent.removeChild(oldContentArea);
        }
        let newContentArea = document.createElement("textarea");
        parent.appendChild(newContentArea);
    }

    setBraille(text) {
        this.parent.firstChild.value = text;
    }

    setRoutingKeyPressListener(listener) {
        this.listener = listener;
    }

    onRoutingKeyPress(event) {
        if (this.listener != null) {
            let listener = this.listener;
            listener(event);
        }
    }

}