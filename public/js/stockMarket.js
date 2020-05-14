links = [];
// TODO: Read stocks/symbols.json into this variable
symbols = [];

// Get data by symbol
getStockData = (symbol) => {
  let historyData = { symbol: symbol, data: [] };
  fetch(`https://financialmodelingprep.com/api/company/historical-price/${symbol}?serietype=line&serieformat=array&datatype=json`)
    .then(response => response.json())
    .then(data => {
      data.historical.slice(data.historical.length - 21, data.historical.length).map((item) => {
        historyData.data.push(item[1]);
      })
      getLink(historyData);
    });
}

//get link from the data
getLink = (historyData) => {
  let maxValue = Math.max(...historyData.data);
  let minValue = Math.min(...historyData.data);
  let data = historyData.data.join('%09');
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

//get Currency History data
getCurrencyHistory = (currency) => {
  let historyData = { symbol: "", data: [] };
  fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/forex/${currency}`)
    .then(response => response.json())
    .then(data => {
      historyData.symbol = data.symbol;
      data.historical.slice(0, 20).map((item) => {
        historyData.data.push(item.close);
      })
      getLink(historyData);
    });
}

//get Index History data
getIndexHistory = (index) => {
  let historyData = { symbol: "", data: [] };
  fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/index/%5E${index}`)
    .then(response => response.json())
    .then(data => {
      historyData.symbol = data.symbol;
      data.historical.slice(0, 20).map((item) => {
        historyData.data.push(item.close);
      })
      getLink(historyData);
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
