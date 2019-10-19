function setFocusToInputField() {
    document.getElementById("dataInput").focus();
}

function updateURL() {
    let input = document.getElementById("dataInput").value;
    input = encodeURIComponent(input);
    let minValue = document.getElementById("minValue").value;
    let maxValue = document.getElementById("maxValue").value;
    let currentUrl = new URL(window.location.href);
    let newUrl = currentUrl.origin;
    if (newUrl == "null") {
        // For local host only
        newUrl = window.location.pathname;
        newUrl = newUrl.substring(0, newUrl.lastIndexOf("/"));
    }
    newUrl += "/view/index.html?";
    newUrl += "data=" + input;
    newUrl += "&minValue=" + minValue;
    newUrl += "&maxValue=" + maxValue;
    window.location.href = newUrl;
}

function onRadioChange(radio) {
    let minValuePicker = document.getElementById("minValue");
    let maxValuePicker = document.getElementById("maxValue");
    if (radio.value == "auto") {
        minValuePicker.disabled = true;
        maxValuePicker.disabled = true;
    } else {
        minValuePicker.disabled = false;
        maxValuePicker.disabled = false;
        document.getElementById("updateButton").disabled = false;
    }
}

function findMinAndMaxValues() {
    if (document.getElementById("autoOption").checked == false) {
        return;
    }
    let input = document.getElementById("dataInput").value;
    let maxValue = -Infinity;
    let minValue = Infinity;
    // TODO: Add a method to parse the input data to a array of arrays for example, so it can be used here and in processData().
    let lines = input.split("\n");
    let line;
    for (line of lines) {
        let values = line.split("\t");
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
    document.getElementById("maxValue").value = maxValue;
    document.getElementById("minValue").value = minValue;
}
