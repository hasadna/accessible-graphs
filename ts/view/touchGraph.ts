let oscillator = null;

function startup() {
  let element = document.getElementById('touchArea');
  element.addEventListener("touchstart", handleStart, false);
  element.addEventListener("touchend", handleEnd, false);
  element.addEventListener("touchcancel", handleCancel, false);
  element.addEventListener("touchmove", handleMove, false);
}

document.addEventListener("DOMContentLoaded", startup);

function handleStart(event) {
  event.preventDefault();
  if (!isOnGraph(event)) {
    return;
  }
  playWithOscilator();
}

function handleEnd(event) {
  event.preventDefault();
  if (oscillator) {
    oscillator.stop();
    oscillator = null;
  }
}

function handleMove(event) {
  event.preventDefault();
  if (isOnGraph(event) && oscillator !== null) {
    return;
  } else if (!isOnGraph(event) && oscillator !== null) {
    oscillator.stop();
    oscillator = null;
    return;
  } else if (!isOnGraph(event) && oscillator === null) {
    return;
  }
  playWithOscilator();
}

function handleCancel(event) {
  handleEnd(event);
}

function playWithOscilator() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  oscillator = audioContext.createOscillator();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // value in hertz
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

function isOnGraph(event) {
  let touch = event.changedTouches[0];
  let touchArea = document.getElementById('touchArea');
  const MAX_Y_COORD = parseFloat(window.getComputedStyle(touchArea).getPropertyValue('height'));
  let xCoord = touch.clientX / 80;
  let yCoord = (MAX_Y_COORD - touch.clientY) / 80;
  xCoord = Math.round(xCoord);
  yCoord = Math.round(yCoord);
  if (graphFunction(xCoord) === yCoord) {
    console.log('f(' + xCoord + ') ?= ' + yCoord)
    return true;
  } else {
    return false;
  }
}

function graphFunction(x) {
  return x;
}