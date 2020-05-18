declare let Tone: any;
// initialize Audio context on page load.
const audioContext = new (window['webkitAudioContext'] || window['AudioContext'])();
let synth = null;
let panner = null;
let source = null;


/** Calculates the maximum Euclidean distance, in 2D, of a cell in the grid. */
function getCellMaxDistance() {
  let rowNumber = dataHeaders.length == 0 ? 0 : 1;
  let maxCoords = get2DCoordinates(rowNumber, data.length);
  // Calculate Euclidean distance of cell from origin (0,0)
  return Math.sqrt(Math.pow(maxCoords.x, 2) + Math.pow(maxCoords.y, 2));
}

function setPanner(currentCell) {
  const coordinates = get2DCoordinates(
    currentCell.getAttribute('row'),
    currentCell.getAttribute('col'));
  if (panner == null) {
    panner = new Tone.Panner3D(coordinates.x, coordinates.y, 0).toMaster();
  } else {
    panner.setPosition(coordinates.x, coordinates.y, 0);
  }
  Tone.Listener.forwardZ = -1;
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
}

function getFrequency(currentCell) {
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
  let frequency = MIN_FREQUENCY;
  if (maxValue != minValue) {
    frequency += (selectedValue - minValue) / (maxValue - minValue) * (MAX_FREQUENCY - MIN_FREQUENCY);
  }
  return frequency;
}

function startSoundPlayback() {
  stopSoundPlayback();
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
  if (getUrlParam('instrumentType') == 'synthesizer') {
    playSoundWithSynthesizer();
  } else {
    playSoundFromAudioFile();
  }
}

function playSoundWithSynthesizer() {
  setPanner(selectedCell);
  if (synth == null) {
    synth = new Tone.Synth();
  }
  if (synth.context.state == 'suspended') {
    synth.context.resume();
  }
  synth.connect(panner);
  synth.triggerAttackRelease(getFrequency(selectedCell), '8n');
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
  setPanner(selectedCell);
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
    if (synth != null) {
      synth.triggerRelease();
    }
    if (source != null) {
      source.stop(audioContext.currentTime);
    }
  } catch (e) {
    console.error(e);
  }
}

function speakText(textToSpeak) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  let selectedTtsVoice = findTtsVoice(ttsName);
  utterance.voice = selectedTtsVoice;
  synth.speak(utterance);
}

function findTtsVoice(ttsName) {
  const synth = window.speechSynthesis;
  for (let ttsVoice of synth.getVoices()) {
    if (ttsVoice.name === ttsName) {
      return ttsVoice;
    }
  }
  for (let ttsVoice of synth.getVoices()) {
    if (ttsVoice.default === true) {
      return ttsVoice;
    }
  }
  for (let ttsVoice of synth.getVoices()) {
    if (ttsVoice.lang.startsWith('en')) {
      return ttsVoice;
    }
  }
  return synth.getVoices()[0];
}
