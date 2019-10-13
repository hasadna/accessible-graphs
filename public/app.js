// initialize Audio context on page load.
let AudioContext = window.webkitAudioContext || window.AudioContext;
let audioContext = new AudioContext();
let oscillator = null;
// This variable is not used currently.
let source = null;
let currentCellUnderTouchPoint = null;
let timeOut = null;

function processData() {
    document.getElementById("updateButton").disabled = false;
    let grid = createGrid();
    let oldGrid = document.getElementById("tableContainer").firstChild;
    if (oldGrid != null) {
        document.getElementById("tableContainer").removeChild(oldGrid);
    }
    document.getElementById("tableContainer").appendChild(grid);
    addOnClickAndOnTouchSoundToGrid();
    addNavigationToGrid();
    if (document.getElementById("autoOption").checked) {
        findMinAndMaxValues();
    }
    updateURL();
}

function createGrid() {
    let input = document.getElementById("dataInput").value;
    let lines = input.split("\n");
    let grid = document.createElement("div");
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-readonly", "true");
    grid.style.width = "100%";
    grid.style.height = "70%";
    grid.className = "table";
    let line;
    for (line of lines) {
        let gridRow = document.createElement("div");
        gridRow.setAttribute("role", "row");
        gridRow.className = "row";
        let values = line.split("\t");
        let value;
        for (value of values) {
            let gridCell = document.createElement("div");
            gridCell.setAttribute("role", "gridcell");
            gridCell.className = "cell";
            gridCell.appendChild(document.createTextNode(value));
            gridCell.setAttribute("aria-readonly", "true");
            gridRow.appendChild(gridCell);
        }
        grid.appendChild(gridRow);
    }
    return grid;
}

function addOnClickAndOnTouchSoundToGrid() {
    let element;
    for (element of document.querySelectorAll("div[role='gridcell']")) {
        element.addEventListener("click", startSoundPlayback);
        element.addEventListener("touchstart", startSoundPlayback);
        element.addEventListener("touchmove", onCellChange);
        element.addEventListener("touchleave", stopSoundPlayback);
        element.addEventListener("touchcancel", stopSoundPlayback);
        element.addEventListener("focus", startSoundPlayback);
    }
}

function addNavigationToGrid() {
    let firstElement = true;
    let gridCell;
    for (gridCell of document.querySelectorAll("div[role='gridcell']")) {
        if (firstElement == true) {
            gridCell.setAttribute("tabindex", "0");
            firstElement = false;
        } else {
            gridCell.setAttribute("tabindex", "-1");
        }
        gridCell.addEventListener("keydown", navigateGrid);
    }
}

function navigateGrid(event) {
    const keyName = event.key;
    let currentCell = event.currentTarget;
    let newFocussedCell = null;
    switch (keyName) {
        case "ArrowDown":
            if (currentCell.parentNode.nextSibling != null) {
                let index = getChildIndex(currentCell);
                newFocussedCell = currentCell.parentNode.nextSibling.childNodes[index];
            }
            break;
        case "ArrowUp":
            if (currentCell.parentNode.previousSibling != null) {
                let index = getChildIndex(currentCell);
                newFocussedCell = currentCell.parentNode.previousSibling.childNodes[index];
            }
        break;
        case "ArrowLeft":
            newFocussedCell = currentCell.previousSibling;
            break;
        case "ArrowRight":
            newFocussedCell = currentCell.nextSibling;
            break;
        case "Home":
            newFocussedCell = currentCell.parentNode.firstChild;
            break;
        case "End":
            newFocussedCell = currentCell.parentNode.lastChild;
            break;
        // TODO: add PageUp/Down keys
        default:
            return;
    }
    if (newFocussedCell != null) {
        newFocussedCell.focus();
    }
}

function getChildIndex(currentChild) {
    let index = 0;
    while (currentChild.previousSibling) {
        index++;
        currentChild = currentChild.previousSibling;
    }
    return index;
}

function startSoundPlayback(event) {
    currentCellUnderTouchPoint = event.currentTarget;
    event.preventDefault();
    stopSoundPlayback(event);
    let selectedValue = event.currentTarget.firstChild.data;
    playSound(selectedValue);
}

function playSound(selectedValue) {
    if (audioContext.state == "suspended") {
        audioContext.resume();
    }
    oscillator = audioContext.createOscillator();
    const MAX_FREQUENCY = 1000;
    const MIN_FREQUENCY = 100;
    let minValue = document.getElementById("minValue").value;
    let maxValue = document.getElementById("maxValue").value;
    maxValue = parseFloat(maxValue);
    minValue = parseFloat(minValue);
    selectedValue = parseFloat(selectedValue);
    if (selectedValue > maxValue) {
        selectedValue = maxValue;
    }
    if (selectedValue < minValue) {
        selectedValue = minValue;
    }
    let frequency = MIN_FREQUENCY + (selectedValue - minValue) / (maxValue - minValue) * (MAX_FREQUENCY - MIN_FREQUENCY);
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    timeOut = setTimeout(() => {
        stopSoundPlayback(event);
    }, 1000);
}

// This function is not used currently.
function playAudioFile() {
    let request = new XMLHttpRequest();
    request.open("get", "assets/beep_digital.mp3", true);
    request.responseType = "arraybuffer";
    request.onload = function () {
        let data = request.response;
        playSoundFromData(data);
    };
    request.send();
}

// This function is not used currently.
function playSoundFromData(data) {
    source = audioContext.createBufferSource();
    audioContext.decodeAudioData(data, function (buffer) {
        source.buffer = buffer;
        source.connect(audioContext.destination);
        playSoundFromBufferSource();
    });
}

// This function is not used currently.
function playSoundFromBufferSource() {
    source.start(audioContext.currentTime);
}

function stopSoundPlayback(event) {
    try {
        if (oscillator != null) {
            oscillator.stop(audioContext.currentTime);
        }
        if (timeOut != null) {
            window.clearTimeout(timeOut);
        }
        if (event != undefined) {
            event.preventDefault();
        }
    } catch (e) {
        console.log(e);
    }
}

function onCellChange(event) {
    // Get the first changed touch point. We surely have one because we are listening to touchmove event, and surely a touch point have changed since the last event.
    let changedTouch = event.changedTouches[0];
    let elementUnderTouch = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
    if (elementUnderTouch == currentCellUnderTouchPoint) {
        return;
    }
    if (elementUnderTouch == null || elementUnderTouch.getAttribute("role") != "gridcell") {
        return;
    }
    currentCellUnderTouchPoint = elementUnderTouch;
    stopSoundPlayback(event);
    let selectedValue = elementUnderTouch.firstChild.data;
    playSound(selectedValue);
    event.stopPropagation();
}

function onRadioChange(radio) {
    let minValuePicker = document.getElementById("minValue");
    let maxValuePicker = document.getElementById("maxValue");
    if (radio.value == "auto") {
        minValuePicker.disabled = true;
        maxValuePicker.disabled = true;
    } else {
        minValuePicker.disabled = false;
        maxValuePicker.disabled = false;
        document.getElementById("updateButton").disabled = false;
    }
}

function findMinAndMaxValues() {
    // TODO: Add a method to parse the input data to a array of arrays for example, so it can be used here and in processData().
    let input = document.getElementById("dataInput").value;
    let maxValue = -Infinity;
    let minValue = Infinity;
    let lines = input.split("\n");
    let line;
    for (line of lines) {
        let values = line.split("\t");
        let value;
        for (value of values) {
            value = parseFloat(value);
            if (value > maxValue) {
                maxValue = value;
            }
            if (value < minValue) {
                minValue = value;
            }
        }
    }
    document.getElementById("maxValue").value = maxValue;
    document.getElementById("minValue").value = minValue;
}

function updateURL() {
    let input = document.getElementById("dataInput").value;
    input = encodeURIComponent(input);
    window.history.pushState({
        state: "examining data"
    },
        "",
        "/index.html?data=" + input);
}

function getDataFromURL() {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.has("data") == false) {
        return;
    }
    let input = params.get("data");
    document.getElementById("dataInput").value = input;
    processData();
}