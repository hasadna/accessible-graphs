// This variable stores the current cell under touch point in case touch is available.
// In case touch is not available, it stores the current focused cell.
let selectedCell = null;
let data: number[] = null;
let dataHeaders: string[] = null;
let brailleData: string[] = null;
let focusedRowIndex: number = 0;
let focusedColIndex: number = 0;

function initializeViewScript() {
  // Initialize speech synthesis
  // If we don't do that, Chrome will speak the first utterance with the default TTS voice
  let synth = window.speechSynthesis;
  let utterance = new SpeechSynthesisUtterance('');
  synth.speak(utterance);
  processData();
}

function brailleControllerSelectionListener(event) {
  console.log('brailleControllerSelectionListener: position=' + event.position + ' character=' + event.character);
  focusedRowIndex = dataHeaders.length == 0 ? 0 : 1;
  // First 2 characters and last character are not data
  const position = event.position - 2;
  if (position >= 0 && position < data.length) {
    updateSelectedCell($(`[row=${focusedRowIndex}][col=${position}]`)[0]);
  }
}

function processData() {
  brailleController = new BrailleController(document.getElementById('container'));
  brailleController.setSelectionListener(brailleControllerSelectionListener);
  parseData(getUrlParam('data'));
  brailleData = BrailleController.numbersToBraille(data);
  brailleController.setBraille(brailleData[0]);
  createGrid();
  addOnClickAndOnTouchSoundToGrid();
  addNavigationToGrid();
}

function createGrid() {
  let combinedDataAndHeaders = (dataHeaders.length != 0 ? [dataHeaders, data] : [data]);
  const grid = $(document.createElement('div'));
  grid.attr('role', 'grid');
  grid.prop('id', 'grid');
  grid.attr('aria-readonly', 'true');
  grid.width('100%');
  grid.height('90%');
  grid.prop('className', 'table');
  for (let rowIndex = 0; rowIndex < combinedDataAndHeaders.length; rowIndex++) {
    let gridRow = $(document.createElement('div'));
    gridRow.prop('role', 'row');
    gridRow.prop('className', 'row');
    for (let colIndex = 0; colIndex < combinedDataAndHeaders[0].length; colIndex++) {
      let gridCell = $(document.createElement('div'));
      gridCell.attr('role', 'gridcell');
      gridCell.prop('className', 'cell');
      gridCell.append(document.createTextNode(combinedDataAndHeaders[rowIndex][colIndex].toString()));
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
    if (index === 0) {
      $(gridCell).prop('tabindex', '0');
    } else {
      $(gridCell).prop('tabindex', '-1');
    }
    $(gridCell).keydown(navigateGrid);
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
    case 'Home':
      newFocusedCell = currentCell.parentNode.firstChild;
      break;
    case 'End':
      newFocusedCell = currentCell.parentNode.lastChild;
      break;
    default:
      return;
  }
  if (newFocusedCell != null) {
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
function get2DCoordinates(row, col) {
  const colCount = data.length;
  let xCoord = col - Math.floor(colCount / 2);
  // Align xCoord to be symmetric with respect to y-axis
  if (colCount % 2 === 0) {
    xCoord += 0.5;
  }
  let yCoord = 0;
  return {
    x: xCoord,
    y: yCoord,
  }
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
  if (dataHeaders.length == 1 && focusedRowIndex == 0) {
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
  // This function is found in app.ts file!
  let combinedDataAndHeaders = parseInputFinal(dataString);
  dataHeaders = combinedDataAndHeaders.dataHeaders;
  data = combinedDataAndHeaders.data;
}
