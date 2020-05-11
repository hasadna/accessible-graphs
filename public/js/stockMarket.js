links = [];

//get symbol by name
getSymbolByName = (name) =>{
    let symbol;
    fetch('https://financialmodelingprep.com/api/v3/search?query='+name+'&limit=10&exchange=NASDAQ')
        .then(response => response.json())
        .then(data => getStockData(data[0].symbol));
}

//get data by symbol
getStockData = (symbol) =>{
    let historyData={symbol:symbol, data: []};
    fetch('https://financialmodelingprep.com/api/company/historical-price/'+symbol+'?serietype=line&serieformat=array&datatype=json')
        .then(response => response.json())
        .then(data =>{
            data.historical.slice(data.historical.length-21, data.historical.length).map((item)=>{
                historyData.data.push(item[1]);
            })
            getLink(historyData)
        });
}

//get link from the data
getLink = (historyData) =>{
    let maxVal = Math.max.apply(Math,historyData.data);
    let minVal = Math.min.apply(Math,historyData.data);
    let data = historyData.data.join('%09');
    let symbol = historyData.symbol;
    let link = 'https://sensoryinterface.com/view/index.html?' +
        'data='+data +
        '&description='+symbol+'%20graph' +
        '&minValue='+minVal +
        '&maxValue='+maxVal+
        '&instrumentType=synthesizer';
    this.links.push({symbol : symbol, href : link});
    document.getElementById(symbol).href=link;
}

//get Currency History data
getCurrencyHistory = (currency) =>{
    let historyData={symbol:"", data: []};
    fetch('https://financialmodelingprep.com/api/v3/historical-price-full/forex/'+currency)
        .then(response => response.json())
        .then(data =>{
            historyData.symbol=data.symbol;
            data.historical.slice(0, 20).map((item)=>{
                console.log(item.close)
                historyData.data.push(item.close);
            })
            getLink(historyData)
        });
}

//get Index History data
getIndexHistory = (index) =>{
    let historyData={symbol:"", data: []};
    fetch('https://financialmodelingprep.com/api/v3/historical-price-full/index/%5E'+index)
        .then(response => response.json())
        .then(data =>{
            historyData.symbol=data.symbol;
            data.historical.slice(0, 20).map((item)=>{
                console.log(item.close)
                historyData.data.push(item.close);
            })
            getLink(historyData)
        });
}


//STOCK PRICE
getStockData('teva');
getSymbolByName('microsoft');
getSymbolByName('apple');
getSymbolByName('amazon');
getSymbolByName('Alphabet');
getSymbolByName('facebook');
getCurrencyHistory('EURUSD');
getCurrencyHistory('EURGBP');
getIndexHistory('DJI');
getIndexHistory('GSPC');