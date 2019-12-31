function setFocusToInputField() {
  $('#dataInput').focus();
}

function updateURL() {
  let input: string = <string>$('#dataInput').val();
  input = encodeURIComponent(input);
  let minValue = $('#minValue').val();
  let maxValue = $('#maxValue').val();
  let instrumentType = $('#instrumentType').val();
  let currentUrl = new URL(window.location.href);
  let newUrl;
  // Check if we are running on a localhost
  if (location.hostname == 'localhost' || location.hostname == '127.0.0.1' ||
    location.hostname == '') {
    newUrl = window.location.pathname;
    newUrl = newUrl.substring(0, newUrl.lastIndexOf('/'));
  } else {
    newUrl = currentUrl.origin;
  }
  newUrl += '/view/index.html?';
  newUrl += 'data=' + input;
  newUrl += '&minValue=' + minValue;
  newUrl += '&maxValue=' + maxValue;
  newUrl += '&instrumentType=' + instrumentType;
  window.location.href = newUrl;
}

function onRadioChange(radio) {
  let minValuePicker = $('#minValue');
  let maxValuePicker = $('#maxValue');
  if (radio.value == 'auto') {
    minValuePicker.prop('disabled', true);
    maxValuePicker.prop('disabled', true);
  } else {
    minValuePicker.prop('disabled', false);
    maxValuePicker.prop('disabled', false);
    $('#updateButton').prop('disabled', false);
  }
}

function findMinAndMaxValues() {
  if ($('#autoOption').prop('checked') == false) {
    return;
  }
  let input = <string>$('#dataInput').val();
  let maxValue = -Infinity;
  let minValue = Infinity;
  // TODO: Add a method to parse the input data to a array of arrays for example, so it can be used here and in processData().
  let lines = input.split('\n');
  let line;
  for (line of lines) {
    let values = line.split('\t');
    let value;
    for (value of values) {
      value = parseFloat(value);
      if (value > maxValue) {
        maxValue = value;
      }
      if (value < minValue) {
        minValue = value;
      }
    }
  }
  $('#maxValue').val(maxValue);
  $('#minValue').val(minValue);
}
