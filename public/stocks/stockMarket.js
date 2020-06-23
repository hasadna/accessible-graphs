
// Get data by symbol
getStockData = async (symbol) => {
  let historyData = { symbol: symbol, data: [], dates: [] };
  let response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=d14cc5b97d675f42397fba2bbaa98d4c&serietype=line`);
  let data = await response.json();
  data.historical.slice(0, 20).map((item) => {
    historyData.data.push(item.close);
    let date = new Date(item.date).toDateString();
    historyData.dates.push(date);
  });
  return historyData;
}

//get Currency History data
getCurrencyHistory = async (currency) => {
  let historyData = { symbol: '', data: [], dates: [] };
  let response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/forex/${currency}?apikey=d14cc5b97d675f42397fba2bbaa98d4c`);
  let data = await response.json();
  historyData.symbol = data.symbol;
  data.historical.slice(0, 20).map((item) => {
    historyData.data.push(item.close);
    let date = new Date(item.date).toDateString();
    historyData.dates.push(date);
  });
  return historyData;
}

//get Index History data
getIndexHistory = async (index) => {
  let historyData = { symbol: '', data: [], dates: [] };
  let response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/index/${index}?apikey=d14cc5b97d675f42397fba2bbaa98d4c`);
  let data = await response.json();
  historyData.symbol = data.symbol;
  data.historical.slice(0, 20).map((item) => {
    historyData.data.push(item.close);
    let date = new Date(item.date).toDateString();
    historyData.dates.push(date);
  });
  return historyData;
}

getCryptoHistory = async (crypto) => {
  let historyData = { symbol: '', data: [], dates: [] };
  let response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/crypto/${crypto}?apikey=d14cc5b97d675f42397fba2bbaa98d4c`);
  let data = await response.json();
  historyData.symbol = data.symbol;
  data.historical.slice(0, 20).map((item) => {
    historyData.data.push(item.close);
    let date = new Date(item.date).toDateString();
    historyData.dates.push(date);
  });
  return historyData;
}

//get link from the data
getLink = async (symbol, graphType) => {
  let historyData = null;
  if (graphType === 'stocks') {
    historyData = await getStockData(symbol);
  } else if (graphType === 'indexes') {
    historyData = await getIndexHistory(symbol);
  } else if (graphType === 'crypto') {
    historyData = await getCryptoHistory(symbol);
  }
  else {
    historyData = await getCurrencyHistory(symbol);
  }
  let maxValue = Math.max(...historyData.data);
  let minValue = Math.min(...historyData.data);
  let dates = historyData.dates.join('%09');
  let prices = historyData.data.join('%09');
  let data = `${dates}%0A${prices}`;
  let link = `view/index.html?
data=${data}
&description=${await symbolToName(symbol, graphType)}%20stock (${symbol})
&minValue=${minValue}
&maxValue=${maxValue}
&instrumentType=synthesizer`;
  return link;
}

symbolToName = async (symbol, graphType) => {
  let response = await fetch(`stocks/${graphType}.json`)
  let data = await response.json();
  for (let dataElement of data) {
    if (dataElement.symbol === symbol) {
      return dataElement.name;
    }
  }
}

updateLink = async (symbol, graphType) => {
  let link = await getLink(symbol, graphType);
  document.getElementById(symbol).href = link;
}

window.addEventListener('DOMContentLoaded', async (event) => {
  await updateLink('FB', 'stocks');
  await updateLink('AMZN', 'stocks');
  await updateLink('AAPL', 'stocks');
  await updateLink('TSLA', 'stocks');
  await updateLink('GOOG', 'stocks');
  await updateLink('MSFT', 'stocks');
  await updateLink('NFLX', 'stocks');
  await updateLink('BABA', 'stocks');
  await updateLink('EURUSD', 'currency');
  await updateLink('EURGBP', 'currency');
  await updateLink('^DJI', 'indexes');
  await updateLink('^GSPC', 'indexes');
});

onGraphRadioClick = (radioElement) => {
  if (radioElement.id === 'stocks') {
    showAutoComplete();
    document.getElementById('graphCombo').selectedIndex = 0;
  } else {
    shoComboBox(radioElement);
    document.getElementById('stockSearch').value = '';
  }
}

shoComboBox = (radioElement) => {
  fetch(`stocks/${radioElement.id}.json`)
    .then(response => response.json())
    .then(data => {
      let comboContainer = document.getElementById('comboContainer');
      comboContainer.style = '';
      let autocompleteContainer = document.getElementById('autocompleteContainer');
      autocompleteContainer.style = 'display: none;';
      let comboBox = document.getElementById('graphCombo');
      comboBox.innerHTML = '';
      for (let dataElement of data) {
        let option = document.createElement('option');
        option.value = dataElement.name;
        option.innerHTML = dataElement.name;
        comboBox.appendChild(option);
      }
    });
}

showAutoComplete = () => {
  let comboContainer = document.getElementById('comboContainer');
  comboContainer.style = 'display: none;';
  let autocompleteContainer = document.getElementById('autocompleteContainer');
  autocompleteContainer.style = '';
}

viewGraph = async () => {
  let container = document.getElementById('autocompleteContainer');
  let input = '';
  if (window.getComputedStyle(container).display === 'none') {
    input = document.getElementById('graphCombo').value;
  } else {
    input = document.getElementById('stockSearch').value;
  }
  let graphType = findGraphType();
  let symbol = await nameToSymbol(input, graphType);
  if (!symbol) {
    alert('No such name');
    return;
  }
  let link = await getLink(symbol, graphType);
  window.location.href = link;
}

findGraphType = () => {
  if (document.getElementById('stocks').checked) {
    return 'stocks';
  } else if (document.getElementById('indexes').checked) {
    return 'indexes';
  } else if (document.getElementById('crypto').checked) {
    return 'crypto';
  } else if (document.getElementById('currency').checked) {
    return 'currency';
  } else {
    return '';
  }
}

nameToSymbol = async (name, graphType) => {
  let response = await fetch(`stocks/${graphType}.json`)
  let data = await response.json();
  for (let dataElement of data) {
    if (dataElement.name === name) {
      return dataElement.symbol;
    }
  }
}
