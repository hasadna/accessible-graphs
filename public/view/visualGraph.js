function setGraph(data, dataHeader) {
    console.log(data, dataHeader);
    // Create the canvas element and place it in the page
    let labels = (dataHeader.length===0) ? data : dataHeader;
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    canvas.width=300;
    canvas.height=100;
    document.body.appendChild(canvas); // adds the canvas to the body element
    document.getElementById('container').appendChild(canvas); // adds the canvas to #container

    const ctx = document.getElementById('myChart').getContext('2d');
    // Create the chart
    const chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: 'MyGraph',
                backgroundColor:'rgba(159,154,241,0.3)',
                borderColor: 'rgba(106, 82, 223, 1)',
                data: data
            }]
        },
        // Configuration options go here
        options: {}
    });
}
