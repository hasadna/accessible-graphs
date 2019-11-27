// initialize Audio context on page load.
let AudioContextClass = (<any>window).webkitAudioContext || window.AudioContext;
let audioContext = new AudioContextClass();
let oscillator = null;
let source = null;
// This variable stores the current cell under touch point in case touch is available.
// In case touch is not available, it stores the current focused cell.
let selectedCell = null;
let timeOut = null;

function brailleControllerPositionChangeListener(event) {
  console.log('brailleControllerPositionChangeListener: cursorPosition=' + event.cursorPosition + ' cursorPosition=' + event.character);
}

function processData() {
  brailleController = new BrailleController(document.getElementById('container'));
  brailleController.setPositionChangeListener(brailleControllerPositionChangeListener);
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
  let input = getDataFromURL('data');
  let lines = input.split('\n');
  let line;
  let rowIndex = 0;
  for (line of lines) {
    let gridRow = $(document.createElement('div'));
    gridRow.prop('role', 'row');
    gridRow.prop('className', 'row');
    let columnIndex = 0;
    let values = line.split('\t');
    let value;
    for (value of values) {
      let gridCell = $(document.createElement('div'));
      gridCell.attr('role', 'gridcell');
      gridCell.prop('className', 'cell');
      gridCell.append(document.createTextNode(value));
      gridCell.prop('aria-readonly', 'true');
      gridCell.prop('row', rowIndex);
      gridCell.prop('col', columnIndex);
      gridRow.append(gridCell);
      columnIndex++;
    }
    grid.append(gridRow);
    rowIndex++;
  }
  let container = $('#container');
  container.append(grid);
}

function addOnClickAndOnTouchSoundToGrid() {
  $('div[role="gridcell"]').each(function(index, element) {
    $(element).click(startSoundPlayback);
    $(element).on('touchstart', startSoundPlayback);
    $(element).on('touchmove', onCellChange);
    $(element).on('touchleave', stopSoundPlayback);
    $(element).on('touchcancel', stopSoundPlayback);
    $(element).focus(startSoundPlayback);
  });
}

function addNavigationToGrid() {
  $('div[role="gridcell"]').each(function(index, gridCell) {
    if (index == 0) {
      $(gridCell).prop('tabindex', '0');
    } else {
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
function get2DCoordinates(currentCell) {
  let grid = document.getElementById('grid');
  let columnCount = grid.firstChild.childNodes.length;
  // The col attribute is zero based indexe
  // For example, the value of  col attribute for a cell found in the third column is 2
  let columnNumber = currentCell.getAttribute('col');
  let xCoordinate = columnNumber - Math.floor(columnCount / 2);
  // Align xCoordinate to be symmetric with respect to y-axis
  if (columnCount % 2 == 0) {
    xCoordinate += 0.5;
  }
  let rowCount = grid.childNodes.length;
  // The same applies for row attribute as col one
  let rowNumber = currentCell.getAttribute('row');
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
  }
}

/**
* Calculates the greatest Euclidean distance possible for a cell in the grid, 
* when it's coordinates is mapped to 2D coordinates
* Assumes that the number of cells in each row is equal,
*  and the number of cells in each column is equal also
*/
function getMaxDistancePossible() {
  let grid = $('#grid')[0];
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
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
  panner.refDistance = 0;
  panner.rolloffFactor = panner.maxDistance / (getMaxDistancePossible() * 2);
  let coordinates = get2DCoordinates(currentCell);
  panner.setPosition(coordinates.x, coordinates.y, 0);
  return panner;
}

function createAndSetOscillator(currentCell) {
  oscillator = audioContext.createOscillator();
  let selectedValue = currentCell.firstChild.data;
  const MAX_FREQUENCY = 1000;
  const MIN_FREQUENCY = 100;
  let minValue = parseFloat(getDataFromURL('minValue'));
  let maxValue = parseFloat(getDataFromURL('maxValue'));
  selectedValue = parseFloat(selectedValue);
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
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
  if (getDataFromURL('instrumentType') == 'synthesizer') {
    playSoundWithOscillator();
  } else {
    playSoundFromAudioFile();
  }
}

function playSoundWithOscillator() {
  // Create oscillator and panner nodes and connect them each time we want to play audio
  // because those nodes are singel use entities
  createAndSetOscillator(selectedCell);
  let panner = createAndSetPanner(selectedCell);
  oscillator.connect(panner);
  panner.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime);
  timeOut = setTimeout(() => {
    stopSoundPlayback(event);
  }, 1000);
}

function playSoundFromAudioFile() {
  let fileName = getFileToPlay(selectedCell);
  let request = new XMLHttpRequest();
  request.open('get', fileName, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    let data = request.response;
    audioContext.decodeAudioData(data, playAudioFile);
  };
  request.send();
}

function playAudioFile(buffer) {
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  let panner = createAndSetPanner(selectedCell);
  source.connect(panner);
  panner.connect(audioContext.destination);
  source.start(audioContext.currentTime);
}

function getFileToPlay(currentCell) {
  let minValue = parseFloat(getDataFromURL('minValue'));
  let maxValue = parseFloat(getDataFromURL('maxValue'));
  let selectedValue = currentCell.firstChild.data;
  selectedValue = parseFloat(selectedValue);
  const NUMBER_OF_TRACKS = 22;
  let trackNumber = (selectedValue - minValue) / (maxValue - minValue) * NUMBER_OF_TRACKS;
  trackNumber = Math.ceil(trackNumber);
  if (trackNumber == 0) {
    trackNumber++;
  }
  let instrumentType = getDataFromURL('instrumentType');
  let fileName = '/assets/' + instrumentType;
  fileName += '/track' + trackNumber + '.mp3';
  return fileName;
}

function stopSoundPlayback(event) {
  try {
    if (oscillator != null) {
      oscillator.stop(audioContext.currentTime);
    }
    if (source != null) {
      source.stop(audioContext.currentTime);
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
  if (elementUnderTouch == null || elementUnderTouch.getAttribute('role') != 'gridcell') {
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
    return '';
  }
  return params.get(variableName);
}