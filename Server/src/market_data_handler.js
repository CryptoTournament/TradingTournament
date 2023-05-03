import axios from 'axios';

async function fetchSymbolData(symbol) {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const response = await axios.get(url);
    console.log(response.data)
    return response.data;
  }
async function fetchKlineData(symbol, interval = '1h',limit = 1) {
    const url = `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    console.log(response.data)
    return response.data;
  }

export { fetchSymbolData, fetchKlineData};
