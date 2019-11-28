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
let focusedRowIndex = 0;
let focusedColIndex = 0;
function brailleControllerPositionChangeListener(event) {
    console.log('brailleControllerPositionChangeListener: cursorPosition=' + event.cursorPosition + ' cursorPosition=' + event.character);
}
function processData() {
    brailleController = new BrailleController(document.getElementById('container'));
    brailleController.setPositionChangeListener(brailleControllerPositionChangeListener);
    data = parseData(getUrlParam('data'));
    createGrid();
    addOnClickAndOnTouchSoundToGrid();
    addNavigationToGrid();
}
function createGrid() {
    let grid = $(document.createElement('div'));
    grid.attr('role', 'grid');
    grid.prop('id', 'grid');
    grid.attr('aria-readonly', 'true');
    grid.width('100%');
    grid.height('90%');
    grid.prop('className', 'table');
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        let gridRow = $(document.createElement('div'));
        gridRow.prop('role', 'row');
        gridRow.prop('className', 'row');
        for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
            let gridCell = $(document.createElement('div'));
            gridCell.attr('role', 'gridcell');
            gridCell.prop('className', 'cell');
            gridCell.append(document.createTextNode(data[rowIndex][colIndex].toString()));
            gridCell.attr('aria-readonly', 'true');
            gridCell.attr('row', rowIndex);
            gridCell.attr('col', colIndex);
            gridRow.append(gridCell);
        }
        grid.append(gridRow);
    }
    let container = $('#container');
    container.append(grid);
}
function addOnClickAndOnTouchSoundToGrid() {
    $('div[role="gridcell"]').each(function (index, element) {
        $(element).click(onClick);
        $(element).on('touchstart', startSoundPlayback);
        $(element).on('touchmove', onCellChange);
        $(element).on('touchleave', stopSoundPlayback);
        $(element).on('touchcancel', stopSoundPlayback);
        $(element).focus(noopEvent);
    });
}
function onClick(event) {
    updateSelectedCell(event.currentTarget);
    event.preventDefault();
}
function noopEvent(event) {
    event.preventDefault();
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
    let row = focusedRowIndex;
    let col = focusedColIndex;
    switch (event.key) {
        case 'ArrowUp':
            row -= 1;
            break;
        case 'ArrowDown':
            row += 1;
            break;
        case 'ArrowLeft':
            col -= 1;
            break;
        case 'ArrowRight':
            col += 1;
            break;
        case 'Home':
            col = 0;
            break;
        case 'End':
            col = data[0].length - 1;
            break;
        // TODO: add PageUp/Down keys
        default:
            return;
    }
    if (0 <= row && row < data.length && 0 <= col && col < data[0].length) {
        updateSelectedCell($(`[row=${row}][col=${col}]`)[0]);
    }
}
/**
* Maps (row, col) to a 2D coordinate. row and col are 0-based indices.
* Returns a map with the x and y coordinates (e.g {x:1, y:0}).
* Examples:
* Cells in a 2X2 grid will be positioned between -0.5 and 0.5 in both x and y.
* Cells in a 3X3 grid will be positioned between -1 and 1 in both x and y.
*/
function get2DCoordinates(row, col) {
    let colCount = data[0].length;
    let xCoord = col - Math.floor(colCount / 2);
    // Align xCoord to be symmetric with respect to y-axis
    if (colCount % 2 == 0) {
        xCoord += 0.5;
    }
    let rowCount = data.length;
    // The same applies for row attribute as col one
    let yCoord = row - Math.floor(rowCount / 2);
    // Align yCoord similar to xCoord:
    if (rowCount % 2 == 0) {
        yCoord += 0.5;
    }
    // Negate yCoord so upper cells have positive values, 
    // and lower cells have negative values
    yCoord = -yCoord;
    return {
        x: xCoord,
        y: yCoord,
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
    updateSelectedCell(elementUnderTouch);
    stopSoundPlayback();
    playSound();
    event.stopPropagation();
}
function updateSelectedCell(cell) {
    focusedRowIndex = parseInt(cell.getAttribute('row'));
    focusedColIndex = parseInt(cell.getAttribute('col'));
    $(selectedCell).css('background-color', '');
    $(selectedCell).css('border', '');
    selectedCell = cell;
    $(selectedCell).css('background-color', '#ffff4d');
    $(selectedCell).css('border', '1px solid #0099ff');
    selectedCell.focus();
    startSoundPlayback();
}
function getUrlParam(variableName) {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.has(variableName) == false) {
        return '';
    }
    return params.get(variableName);
}
function parseData(dataString) {
    let result = Array();
    let lines = dataString.split('\n');
    let line;
    let rowIndex = 0;
    for (line of lines) {
        result[rowIndex] = Array();
        let colIndex = 0;
        let values = line.split('\t');
        let value;
        for (value of values) {
            result[rowIndex][colIndex] = value;
            colIndex++;
        }
        rowIndex++;
    }
    return result;
}
//# sourceMappingURL=view.js.map