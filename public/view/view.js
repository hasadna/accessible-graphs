// initialize Audio context on page load.
let AudioContextClass = window.webkitAudioContext || window.AudioContext;
let audioContext = new AudioContextClass();
let oscillator = null;
let source = null;
// This variable stores the current cell under touch point in case touch is available.
// In case touch is not available, it stores the current focused cell.
let selectedCell = null;
let timeOut = null;
let data = null;
function brailleControllerPositionChangeListener(event) {
    console.log('brailleControllerPositionChangeListener: cursorPosition=' + event.cursorPosition + ' cursorPosition=' + event.character);
}
function processData() {
    brailleController = new BrailleController(document.getElementById('container'));
    brailleController.setPositionChangeListener(brailleControllerPositionChangeListener);
    data = getDataFromUrl();
    createGrid();
    addOnClickAndOnTouchSoundToGrid();
    addNavigationToGrid();
}
function createGrid() {
    let grid = $(document.createElement('div'));
    grid.prop('role', 'grid');
    grid.prop('id', 'grid');
    grid.prop('aria-readonly', 'true');
    grid.width('100%');
    grid.height('70%');
    grid.prop('className', 'table');
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        let gridRow = $(document.createElement('div'));
        gridRow.prop('role', 'row');
        gridRow.prop('className', 'row');
        for (let columnIndex = 0; columnIndex < data[0].length; columnIndex++) {
            let gridCell = $(document.createElement('div'));
            gridCell.attr('role', 'gridcell');
            gridCell.prop('className', 'cell');
            gridCell.append(document.createTextNode(data[rowIndex][columnIndex].toString()));
            gridCell.prop('aria-readonly', 'true');
            gridCell.prop('row', rowIndex);
            gridCell.prop('col', columnIndex);
            gridRow.append(gridCell);
        }
        grid.append(gridRow);
    }
    let container = $('#container');
    container.append(grid);
}
function addOnClickAndOnTouchSoundToGrid() {
    $('div[role="gridcell"]').each(function (index, element) {
        $(element).click(startSoundPlayback);
        $(element).on('touchstart', startSoundPlayback);
        $(element).on('touchmove', onCellChange);
        $(element).on('touchleave', stopSoundPlayback);
        $(element).on('touchcancel', stopSoundPlayback);
        $(element).focus(startSoundPlayback);
    });
}
function addNavigationToGrid() {
    $('div[role="gridcell"]').each(function (index, gridCell) {
        if (index == 0) {
            $(gridCell).prop('tabindex', '0');
        }
        else {
            $(gridCell).prop('tabindex', '-1');
        }
        $(gridCell).keydown(navigateGrid);
    });
}
function navigateGrid(event) {
    const keyName = event.key;
    let currentCell = event.currentTarget;
    let newFocusedCell = null;
    switch (keyName) {
        case 'ArrowDown':
            if (currentCell.parentNode.nextSibling != null) {
                let index = currentCell.getAttribute('col');
                newFocusedCell = currentCell.parentNode.nextSibling.childNodes[index];
            }
            break;
        case 'ArrowUp':
            if (currentCell.parentNode.previousSibling != null) {
                let index = currentCell.getAttribute('col');
                newFocusedCell = currentCell.parentNode.previousSibling.childNodes[index];
            }
            break;
        case 'ArrowLeft':
            newFocusedCell = currentCell.previousSibling;
            break;
        case 'ArrowRight':
            newFocusedCell = currentCell.nextSibling;
            break;
        case 'Home':
            newFocusedCell = currentCell.parentNode.firstChild;
            break;
        case 'End':
            newFocusedCell = currentCell.parentNode.lastChild;
            break;
        // TODO: add PageUp/Down keys
        default:
            return;
    }
    if (newFocusedCell != null) {
        newFocusedCell.focus();
    }
}
/**
* Maps each cell's row and col to a 2D coordinate.
* Returns a map with the x and y coordinates (e.g {x:1, y:0}).
* Examples:
* Cells in a 3X3 grid will be positioned between -1 and 1 in both x and y.
* Cells in a 2X2 grid will be positioned between -1.5 and 1.5 in both x and y.
*/
function get2DCoordinates(rowNumber, columnNumber) {
    let columnCount = data[0].length;
    // The col attribute is zero based indexe
    // For example, the value of  col attribute for a cell found in the third column is 2
    let xCoordinate = columnNumber - Math.floor(columnCount / 2);
    // Align xCoordinate to be symmetric with respect to y-axis
    if (columnCount % 2 == 0) {
        xCoordinate += 0.5;
    }
    let rowCount = data.length;
    // The same applies for row attribute as col one
    let yCoordinate = rowNumber - Math.floor(rowCount / 2);
    // Align yCoordinate similar to xCoordinate:
    if (rowCount % 2 == 0) {
        yCoordinate += 0.5;
    }
    // Negate yCoordinate so upper cells have positive values, 
    // and lower cells have negative values
    yCoordinate = -yCoordinate;
    return {
        x: xCoordinate,
        y: yCoordinate,
    };
}
function onCellChange(event) {
    // Get the first changed touch point. We surely have one because we are listening to touchmove event, and surely a touch point have changed since the last event.
    let changedTouch = event.changedTouches[0];
    let elementUnderTouch = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
    if (elementUnderTouch == selectedCell) {
        return;
    }
    if (elementUnderTouch == null || elementUnderTouch.getAttribute('role') != 'gridcell') {
        return;
    }
    selectedCell = elementUnderTouch;
    stopSoundPlayback(event);
    playSound(event);
    event.stopPropagation();
}
function getUrlParam(variableName) {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.has(variableName) == false) {
        return '';
    }
    return params.get(variableName);
}
function getDataFromUrl() {
    let result = Array();
    const dataString = getUrlParam('data');
    let lines = dataString.split('\n');
    let line;
    let rowIndex = 0;
    for (line of lines) {
        result[rowIndex] = Array();
        let columnIndex = 0;
        let values = line.split('\t');
        let value;
        for (value of values) {
            result[rowIndex][columnIndex] = value;
            columnIndex++;
        }
        rowIndex++;
    }
    return result;
}
//# sourceMappingURL=view.js.map