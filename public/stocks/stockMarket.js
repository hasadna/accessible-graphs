links = [];

// Get data by symbol
getStockData = (symbol) => {
  let historyData = { symbol: symbol, data: [], dates: []};
  fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=d14cc5b97d675f42397fba2bbaa98d4c&serietype=line`)
    .then(response => response.json())
    .then(data => {
      data.historical.slice(0, 20).map((item) => {
        historyData.data.push(item.close);
        let date = new Date(item.date).toDateString();
        historyData.dates.push(date);
      })
      getLink(historyData);
    });
}

//get Currency History data
getCurrencyHistory = (currency) => {
  let historyData = { symbol: "", data: [], dates: [] };
  fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/forex/${currency}?apikey=d14cc5b97d675f42397fba2bbaa98d4c`)
    .then(response => response.json())
    .then(data => {
      historyData.symbol = data.symbol;
      data.historical.slice(0, 20).map((item) => {
        historyData.data.push(item.close);
        let date = new Date(item.date).toDateString();
        historyData.dates.push(date);
      })
      getLink(historyData);
    });
}

//get Index History data
getIndexHistory = (index) => {
  let historyData = { symbol: "", data: [], dates: [] };
  fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/index/%5E${index}?apikey=d14cc5b97d675f42397fba2bbaa98d4c`)
    .then(response => response.json())
    .then(data => {
      historyData.symbol = data.symbol;
      data.historical.slice(0, 20).map((item) => {
        historyData.data.push(item.close);
        let date = new Date(item.date).toDateString();
        historyData.dates.push(date);
      })
      getLink(historyData);
    });
}

//get link from the data
getLink = (historyData) => {
  let maxValue = Math.max(...historyData.data);
  let minValue = Math.min(...historyData.data);
  let dates = historyData.dates.join('%09');
  let prices = historyData.data.join('%09');
  let data = `${dates}%0A${prices}`;
  let symbol = historyData.symbol;
  let link = `view/index.html?
data=${data}
&description=${symbolToName(symbol)}%20stock (${symbol})
&minValue=${minValue}
&maxValue=${maxValue}
&instrumentType=synthesizer`;
  this.links.push({ symbol: symbol, href: link });
  document.getElementById(symbol).href = link;
}

onGraphRadioClick = (radioElement) => {
  if (radioElement.id === 'stock') {
    showAutoComplete();
  } else {
    shoComboBox(radioElement);
  }
}

shoComboBox = (radioElement) => {
  let comboBox = document.createElement('select');
  fetch(`stocks/${radioElement.id}.json`)
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById('graphPickerContainer');
      container.insertBefore(comboBox, container.firstChild);
      for (let name of data) {
        let option = document.createElement('option');
        option.value = name.name;
        option.innerHTML = name.name;
        comboBox.appendChild(option);
      }
    });
}

symbolToName = (symbol) => {
  switch(symbol) {
    case 'FB':
      return 'Facebook';
    case 'AMZN':
      return 'Amazon';
    case 'AAPL':
      return 'Apple';
    case 'TSLA':
      return 'Tesla';
    case 'GOOG':
      return 'Google';
    case 'MSFT':
      return 'Microsoft';
    case 'NFLX':
      return 'Netflix';
    case 'BABA':
      return 'Alibaba';
    case '^GSPC':
      return 'S and P 500';
    case '^DJI':
      return 'Dow Jones';
    case 'EUR/USD':
      return 'EUR/USD';
    case 'EUR/GBP':
      return 'EUR/GBP';
    default:
      return '';
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  getStockData('FB');
  getStockData('AMZN');
  getStockData('AAPL');
  getStockData('TSLA');
  getStockData('GOOG');
  getStockData('MSFT');
  getStockData('NFLX');
  getStockData('BABA');
  getCurrencyHistory('EURUSD');
  getCurrencyHistory('EURGBP');
  getIndexHistory('DJI');
  getIndexHistory('GSPC');
});
