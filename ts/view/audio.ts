// initialize Audio context on page load.
const audioContext = new (window['webkitAudioContext'] || window['AudioContext'])();
let oscillator = null;
let source = null;
let timeOut = null;


/** Calculates the maximum Euclidean distance, in 2D, of a cell in the grid. */
function getCellMaxDistance() {
  let maxCoords = get2DCoordinates(1, actualData.length);
  // Calculate Euclidean distance of cell from origin (0,0)
  return Math.sqrt(Math.pow(maxCoords.x, 2) + Math.pow(maxCoords.y, 2));
}

function createAndSetPanner(currentCell) {
  const panner = audioContext.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
  panner.refDistance = 0;
  panner.rolloffFactor = panner.maxDistance / (getCellMaxDistance() * 2);
  const coordinates = get2DCoordinates(
    currentCell.getAttribute('row'),
    currentCell.getAttribute('col'));
  panner.setPosition(coordinates.x, coordinates.y, 0);
  return panner;
}

function createAndSetOscillator(currentCell) {
  oscillator = audioContext.createOscillator();
  const MAX_FREQUENCY = 1000;
  const MIN_FREQUENCY = 100;
  const minValue = parseFloat(getUrlParam('minValue'));
  const maxValue = parseFloat(getUrlParam('maxValue'));
  let selectedValue = parseFloat(currentCell.firstChild.data);
  /**
   * Notice, when `selectedValue` is `NaN` the following `if` checks are `false`
   *         and when `selectedValue` is `NaN` then so too is `frequency`
   */
  if (selectedValue < minValue) {
    selectedValue = minValue;
  }
  if (selectedValue > maxValue) {
    selectedValue = maxValue;
  }
  const frequency = MIN_FREQUENCY + (selectedValue - minValue) / (maxValue - minValue) * (MAX_FREQUENCY - MIN_FREQUENCY);
  oscillator.frequency.value = frequency;
  oscillator.channelCount = 1;
}

function startSoundPlayback() {
  stopSoundPlayback();
  playSound();
}

function playSound() {
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
  if (getUrlParam('instrumentType') == 'synthesizer') {
    playSoundWithOscillator();
  } else {
    playSoundFromAudioFile();
  }
}

function playSoundWithOscillator() {
  // Create oscillator and panner nodes and connect them each time we want to play audio
  // because those nodes are single use entities
  createAndSetOscillator(selectedCell);
  const panner = createAndSetPanner(selectedCell);
  oscillator.connect(panner);
  panner.connect(audioContext.destination);
  oscillator.start(audioContext.currentTime);
  timeOut = setTimeout(() => {
    stopSoundPlayback();
  }, 1000);
}

function playSoundFromAudioFile() {
  const fileName = getFileToPlay(selectedCell);
  const request = new XMLHttpRequest();
  request.open('get', fileName, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    const data = request.response;
    audioContext.decodeAudioData(data, playAudioFile);
  };
  request.send();
}

function playAudioFile(buffer) {
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  const panner = createAndSetPanner(selectedCell);
  source.connect(panner);
  panner.connect(audioContext.destination);
  source.start(audioContext.currentTime);
}

function getFileToPlay(currentCell) {
  const minValue = parseFloat(getUrlParam('minValue'));
  const maxValue = parseFloat(getUrlParam('maxValue'));
  const selectedValue = parseFloat(currentCell.firstChild.data);
  const NUMBER_OF_TRACKS = 22;
  let trackNumber = (selectedValue - minValue) / (maxValue - minValue) * NUMBER_OF_TRACKS;
  trackNumber = Math.ceil(trackNumber);
  if (trackNumber == 0) {
    trackNumber++;
  }
  const instrumentType = getUrlParam('instrumentType');
  const fileName = `/assets/${instrumentType}/track${trackNumber}.mp3`;
  return fileName;
}

function stopSoundPlayback() {
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
  } catch (e) {
    console.log(e);
  }
}

function speakSelectedCell() {
  const synth = window.speechSynthesis;
  synth.cancel();
  let value = actualData[focusedColIndex];
  let valueText = String(value);
  if (value < 0) {
    value = Math.abs(value);
    valueText = `Minus ${value}`;
  }
  const utterance = new SpeechSynthesisUtterance(valueText);
  let ttsIndex = getUrlParam('ttsIndex');
  let selectedTtsVoice = synth.getVoices()[ttsIndex];
  utterance.voice = selectedTtsVoice;
  synth.speak(utterance);
}

function speakSelectedCellPositionInfo() {
  const synth = window.speechSynthesis;
  synth.cancel();
  let textToSpeak = '';
  if (dataHeaders == null) {
    textToSpeak = `Column ${focusedColIndex + 1}`;
  } else {
    let headerText = dataHeaders[focusedColIndex];
    textToSpeak = `${headerText}, column ${focusedColIndex + 1}`;
  }
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  let ttsIndex = getUrlParam('ttsIndex');
  let selectedTtsVoice = synth.getVoices()[ttsIndex];
  utterance.voice = selectedTtsVoice;
  synth.speak(utterance);
}