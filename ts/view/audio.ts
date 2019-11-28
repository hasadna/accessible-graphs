/** Calculates the maximum Euclidean distance, in 2D, of a cell in the grid. */
function getCellMaxDistance() {
    let maxCoords = get2DCoordinates(data.length, data[0].length);
    // Calculate Euclidean distance of cell from origin (0,0)
    return Math.sqrt(Math.pow(maxCoords.x, 2) + Math.pow(maxCoords.y, 2));
}

function createAndSetPanner(currentCell) {
    let panner = audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'linear';
    panner.refDistance = 0;
    panner.rolloffFactor = panner.maxDistance / (getCellMaxDistance() * 2);
    let coordinates = get2DCoordinates(
        currentCell.getAttribute('row'), currentCell.getAttribute('col'));
    panner.setPosition(coordinates.x, coordinates.y, 0);
    return panner;
}

function createAndSetOscillator(currentCell) {
    oscillator = audioContext.createOscillator();
    let selectedValue = currentCell.firstChild.data;
    const MAX_FREQUENCY = 1000;
    const MIN_FREQUENCY = 100;
    let minValue = parseFloat(getUrlParam('minValue'));
    let maxValue = parseFloat(getUrlParam('maxValue'));
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
    // because those nodes are singel use entities
    createAndSetOscillator(selectedCell);
    let panner = createAndSetPanner(selectedCell);
    oscillator.connect(panner);
    panner.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    timeOut = setTimeout(() => {
        stopSoundPlayback();
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
    let minValue = parseFloat(getUrlParam('minValue'));
    let maxValue = parseFloat(getUrlParam('maxValue'));
    let selectedValue = currentCell.firstChild.data;
    selectedValue = parseFloat(selectedValue);
    const NUMBER_OF_TRACKS = 22;
    let trackNumber = (selectedValue - minValue) / (maxValue - minValue) * NUMBER_OF_TRACKS;
    trackNumber = Math.ceil(trackNumber);
    if (trackNumber == 0) {
        trackNumber++;
    }
    let instrumentType = getUrlParam('instrumentType');
    let fileName = '/assets/' + instrumentType;
    fileName += '/track' + trackNumber + '.mp3';
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
