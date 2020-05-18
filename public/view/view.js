// This variable stores the current cell under touch point in case touch is available.
// In case touch is not available, it stores the current focused cell.
let selectedCell = null;
let data = [];
let dataHeaders = [];
let brailleData = null;
let focusedRowIndex = 0;
let focusedColIndex = 0;
function initializeViewScript() {
    // Initialize speech synthesis
    // If we don't do that, Chrome will speak the first utterance with the default TTS voice
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance('');
    synth.speak(utterance);
    processData();
}
function brailleControllerSelectionListener(event) {
    focusedRowIndex = dataHeaders.length == 0 ? 0 : 1;
    const position = event.position;
    const positionInData = position - (position / 40 | 0) * 11;
    if (position % 40 >= 0 && position % 40 < 29 && positionInData < data.length) {
        let cellSelector = `[row='${focusedRowIndex}'][col='${positionInData}']`;
        const cell = document.querySelectorAll(cellSelector)[0];
        updateSelectedCell(cell);
        brailleController.updateRightSideBraille(position);
    }
}
function processData() {
    const container = document.getElementById('container');
    const graphDescription = getUrlParam('description');
    if (graphDescription !== '') {
        const graphDescriptionHeading = document.createElement('h1');
        graphDescriptionHeading.innerText = graphDescription;
        container.appendChild(graphDescriptionHeading);
    }
    parseData(getUrlParam('data'));
    brailleController = new BrailleController(container, data);
    brailleController.setSelectionListener(brailleControllerSelectionListener);
    createGrid();
    addOnClickAndOnTouchSoundToGrid();
    addNavigationToGrid();
}
function createGrid() {
    const combinedDataAndHeaders = (dataHeaders.length != 0 ? [dataHeaders, data] : [data]);
    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('id', 'grid');
    grid.setAttribute('aria-readonly', 'true');
    grid.setAttribute('aria-hidden', 'true');
    grid.style.width = '100%';
    grid.style.height = '90%';
    grid.setAttribute('class', 'table');
    combinedDataAndHeaders.forEach((_rowData, rowIndex) => {
        const gridRow = document.createElement('div');
        gridRow.setAttribute('role', 'row');
        gridRow.setAttribute('class', 'row');
        /**
         * The `combinedDataAndHeaders[0]` feels like it should be `combinedDataAndHeaders[rowIndex]`
         * however, that would require type hinting similar to _`combinedDataAndHeaders: string[][]`_
         */
        for (let colIndex = 0; colIndex < combinedDataAndHeaders[0].length; colIndex++) {
            const gridCell = document.createElement('div');
            gridCell.setAttribute('role', 'gridcell');
            gridCell.setAttribute('class', 'cell');
            gridCell.append(document.createTextNode(combinedDataAndHeaders[rowIndex][colIndex].toString()));
            gridCell.setAttribute('aria-readonly', 'true');
            gridCell.setAttribute('row', rowIndex.toString());
            gridCell.setAttribute('col', colIndex.toString());
            gridRow.append(gridCell);
        }
        grid.append(gridRow);
    });
    document.getElementById('container').appendChild(grid);
}
function addOnClickAndOnTouchSoundToGrid() {
    document.querySelectorAll('[role="gridcell"]').forEach((element, _index) => {
        element.addEventListener('click', onClick);
        element.addEventListener('touchstart', startSoundPlayback);
        element.addEventListener('touchmove', onCellChange);
        element.addEventListener('touchleave', stopSoundPlayback);
        element.addEventListener('touchcancel', stopSoundPlayback);
    });
}
/**
 * To-do: double-check type hints for `event` on `onClick` and `navigateGrid`
 * @link https://github.com/Microsoft/TypeScript/issues/299
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Event
 */
function onClick(event) {
    updateSelectedCell(event.currentTarget);
    event.preventDefault();
}
function addNavigationToGrid() {
    document.querySelectorAll('[role="gridcell"]').forEach((gridCell, index) => {
        gridCell.addEventListener('keydown', navigateGrid);
    });
}
function navigateGrid(event) {
    let currentCell = event.currentTarget;
    let newFocusedCell = null;
    switch (event.key) {
        case 'ArrowLeft':
            newFocusedCell = currentCell.previousSibling;
            break;
        case 'ArrowRight':
            newFocusedCell = currentCell.nextSibling;
            break;
        case 'ArrowDown':
            if (currentCell.parentNode.nextSibling != null) {
                const index = Number(currentCell.getAttribute('col'));
                newFocusedCell = currentCell.parentNode.nextSibling.childNodes[index];
            }
            break;
        case 'ArrowUp':
            if (currentCell.parentNode.previousSibling != null) {
                const index = Number(currentCell.getAttribute('col'));
                newFocusedCell = currentCell.parentNode.previousSibling.childNodes[index];
            }
            break;
        case 'Home':
            newFocusedCell = currentCell.parentNode.firstChild;
            break;
        case 'End':
            newFocusedCell = currentCell.parentNode.lastChild;
            break;
        default:
            return;
    }
    if (newFocusedCell !== null) {
        newFocusedCell.focus();
        updateSelectedCell(newFocusedCell);
    }
}
/**
* Maps (row, col) to a 2D coordinate. row and col are 0-based indices
* Returns a map with the x and y coordinates (e.g {x:1, y:0})
* The data part of the grid will be always with only 1 row, therefore, y coordinate will be always 0
* Examples:
* Cells in a 1X2 grid will be positioned between -0.5 and 0.5 in x, and y will be 0
* Cells in a 1X3 grid will be positioned between -1 and 1 in x, and y will be also 0
*/
function get2DCoordinates(_row, col) {
    // Note, `_row` is not used within this function
    const colCount = data.length;
    let xCoord = col - (colCount / 2 | 0);
    // Align xCoord to be symmetric with respect to y-axis
    if (colCount % 2 === 0) {
        xCoord += 0.5;
    }
    let yCoord = 0;
    return {
        x: xCoord,
        y: yCoord,
    };
}
function onCellChange(event) {
    // Get the first changed touch point. We surely have one because we are listening to touchmove event, and surely a touch point have changed since the last event.
    const changedTouch = event.changedTouches[0];
    const elementUnderTouch = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
    if (elementUnderTouch === selectedCell) {
        return;
    }
    if (elementUnderTouch === null || elementUnderTouch.getAttribute('role') !== 'gridcell') {
        return;
    }
    updateSelectedCell(elementUnderTouch);
    stopSoundPlayback();
    startSoundPlayback();
    event.stopPropagation();
}
function updateSelectedCell(cell) {
    focusedRowIndex = parseInt(cell.getAttribute('row'));
    focusedColIndex = parseInt(cell.getAttribute('col'));
    if (selectedCell) {
        selectedCell.style.backgroundColor = '';
        selectedCell.style.border = '';
    }
    selectedCell = cell;
    selectedCell.style.backgroundColor = '#ffff4d';
    selectedCell.style.boarder = '1px solid #0099ff';
    if (dataHeaders.length != 0 && focusedRowIndex == 0) {
        return;
    }
    startSoundPlayback();
    speakSelectedCell();
}
function getUrlParam(variableName) {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    if (params.has(variableName) === false) {
        return '';
    }
    return params.get(variableName);
}
function parseData(dataString) {
    try {
        // parseWithHeaders and parseWithoutHeaders functions are found in app.ts file
        let combinedDataAndHeaders = parseWithHeaders(dataString);
        dataHeaders = combinedDataAndHeaders.dataHeaders;
        data = combinedDataAndHeaders.data;
    }
    catch (error) {
        data = parseWithoutHeaders(dataString);
    }
}
//# sourceMappingURL=view.js.map