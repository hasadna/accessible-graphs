// initialize Audio context on page load.
let AudioContext = window.webkitAudioContext || window.AudioContext;
let audioContext = new AudioContext();
let oscillator = null;
// This variable is not used currently.
let source = null;
// This variable stores the current cell under touch point in case touch is available.
// In case touch is not available, it stores the current focused cell.
let selectedCell = null;
let timeOut = null;

function processData() {
    let grid = createGrid();
    let oldGrid = document.getElementById("gridContainer").firstChild;
    if (oldGrid != null) {
        document.getElementById("gridContainer").removeChild(oldGrid);
    }
    document.getElementById("gridContainer").appendChild(grid);
    addOnClickAndOnTouchSoundToGrid();
    addNavigationToGrid();
}

function createGrid() {
    let grid = document.createElement("div");
    grid.setAttribute("role", "grid");
    grid.setAttribute("id", "grid");
    grid.setAttribute("aria-readonly", "true");
    grid.style.width = "100%";
    grid.style.height = "70%";
    grid.className = "table";
    let input = getDataFromURL("data");
    let lines = input.split("\n");
    let line;
    let rowIndex = 0;
    for (line of lines) {
        let gridRow = document.createElement("div");
        gridRow.setAttribute("role", "row");
        gridRow.className = "row";
        let columnIndex = 0;
        let values = line.split("\t");
        let value;
        for (value of values) {
            let gridCell = document.createElement("div");
            gridCell.setAttribute("role", "gridcell");
            gridCell.className = "cell";
            gridCell.appendChild(document.createTextNode(value));
            gridCell.setAttribute("aria-readonly", "true");
            gridCell.setAttribute("row", rowIndex);
            gridCell.setAttribute("col", columnIndex);
            gridRow.appendChild(gridCell);
            columnIndex++;
        }
        grid.appendChild(gridRow);
        rowIndex++;
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
                let index = currentCell.getAttribute("col");
                newFocussedCell = currentCell.parentNode.nextSibling.childNodes[index];
            }
            break;
        case "ArrowUp":
            if (currentCell.parentNode.previousSibling != null) {
                let index = currentCell.getAttribute("col");
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

/**
* Maps the row and col attributes for each cell in the grid 
* to 2D coordinates (x,y)
* Row index is mapped to y coordinate, and col index is mapped to x coordinate
* The row and col attributes are zero based indexes
* For example, the values of row and col attributes for a cell found in 
* the second row, and in the third column is:
* Row is 1, and col is 2
* Returns a value of type object, where the key of the first element is x, 
* and the value is the calculated x coordinate,
* and the second element's key is y, and the value is the calculated y coordinate
*/
function get2DCoordinates(currentCell) {
    let grid = document.getElementById("grid");
    let columnCount = grid.firstChild.childNodes.length;
    let columnNumber = currentCell.getAttribute("col");
    let xCoordinate = columnNumber - Math.floor(columnCount / 2);
    // Aline xCoordinate to be symmetric with respect to y-axis
    if (columnCount % 2 == 0) {
        xCoordinate += 0.5;
    }
    let rowCount = grid.childNodes.length;
    let rowNumber = currentCell.getAttribute("row");
    let yCoordinate = rowNumber - Math.floor(rowCount / 2);
    // Aline yCoordinate similar to xCoordinate:
    if (rowCount % 2 == 0) {
        yCoordinate += 0.5;
    }
    // Negate yCoordinate so uper cells to have positive values, 
    // and lower cells have negative values
    yCoordinate = -yCoordinate;
    return {
        x: xCoordinate,
        y: yCoordinate,
    }
}

/**
* Calculates the greatest Euclidean distance possible for a cell in the grid, 
* when it's coordinates is mapped to 2D coordinates
* Assumes that the number of cells in each row is equal,
*  and the number of cells in each column is equal also
*/
function getMaxDistancePossible() {
    let grid = document.getElementById("grid");
    // The cell with max coordinates is naturaly found in the upper right corner of the grid
    // so get it
    let cellWithMaxCoordinates = grid.firstChild.lastChild;
    let maxCoordinates = get2DCoordinates(cellWithMaxCoordinates);
    // Calculate the Euclidean distance of this cell from the origin (0,0)
    let maxDistance = 0;
    maxDistance += Math.pow(maxCoordinates.x, 2);
    maxDistance += Math.pow(maxCoordinates.y, 2);
    maxDistance = Math.sqrt(maxDistance);
    return maxDistance;
}

function createAndSetPanner(currentCell) {
    let panner = audioContext.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "linear";
    panner.refDistance = 0;
    panner.rolloffFactor = (panner.maxDistance * 99) / (getMaxDistancePossible() * 100);
    let coordinates = get2DCoordinates(currentCell);
    panner.setPosition(coordinates.x, coordinates.y, 0);
    return panner;
}

function createAndSetOscillator(currentCell) {
    oscillator = audioContext.createOscillator();
    let selectedValue = currentCell.firstChild.data;
    const MAX_FREQUENCY = 1000;
    const MIN_FREQUENCY = 100;
    let minValue = getDataFromURL("minValue");
    let maxValue = getDataFromURL("maxValue");
    selectedValue = parseFloat(selectedValue);
    minValue = parseFloat(minValue);
    maxValue = parseFloat(maxValue);
    if (selectedValue < minValue) {
        selectedValue = minValue;
    }
    if (selectedValue > maxValue) {
        selectedValue = maxValue;
    }
    let frequency = MIN_FREQUENCY + (selectedValue - minValue) / (maxValue - minValue) * (MAX_FREQUENCY - MIN_FREQUENCY);
    oscillator.frequency.value = frequency;
    oscillator.channelCount = 1;
}

function startSoundPlayback(event) {
    selectedCell = event.currentTarget;
    event.preventDefault();
    stopSoundPlayback(event);
    playSound(event);
}

function playSound(event) {
    if (audioContext.state == "suspended") {
        audioContext.resume();
    }
    let currentCell = selectedCell;
    // Create oscillator and panner nodes and connect them each time we want to play audio
    // because those nodes are singel use intities
    createAndSetOscillator(currentCell);
    let panner = createAndSetPanner(currentCell);
    oscillator.connect(panner);
    panner.connect(audioContext.destination);
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
    if (elementUnderTouch == selectedCell) {
        return;
    }
    if (elementUnderTouch == null || elementUnderTouch.getAttribute("role") != "gridcell") {
        return;
    }
    selectedCell = elementUnderTouch;
    stopSoundPlayback(event);
    playSound(event);
    event.stopPropagation();
}

function getDataFromURL(variableName) {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.has(variableName) == false) {
        return "";
    }
    return params.get(variableName);
}