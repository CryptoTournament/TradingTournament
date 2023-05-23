import React, { useState, useEffect } from "react";
import moment from "moment";
import { w3cwebsocket as WebSocket } from "websocket";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=30";

const CryptoChart = () => {
  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("1m");
  const [domain, setDomain] = useState([null, null]);
  const [zoomLevel, setZoomLevel] = useState(50);
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [lastData, setLastData] = useState(null);
  const [pointToBuySell, setPointToBuySell] = useState(null);
  const [buySellPoints, setBuySellPoints] = useState([]);
  const [buyMarker, setBuyMarker] = useState(null);
  const [sellMarker, setSellMarker] = useState(null);

  useEffect(() => {
    fetch(HISTORY_API_URL)
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((item) => {
          const timestamp = item[0];
          const price = parseFloat(item[4]);
          setPointToBuySell([timestamp, price]);
          return { timestamp, price };
        });
        setData(formattedData);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const socket = new WebSocket(API_URL);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`btcusdt@kline_${interval}`],
          id: 1,
        })
      );
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.k && shouldUpdate) {
        const timestamp = data.k.t;
        const price = parseFloat(data.k.c);
        setPointToBuySell([timestamp, price]);
        setData((prevData) => [...prevData, { timestamp, price }]);
        setShouldUpdate(false);
        setTimeout(() => {
          setShouldUpdate(true);
        }, 60000); // 60 seconds
      }
    };
    return () => {
      socket.close();
    };
  }, [interval, shouldUpdate]);

  useEffect(() => {
    const chartHeight = 400;
    const priceRange =
      Math.max(...data.map((d) => d.price)) -
      Math.min(...data.map((d) => d.price));
    const pricePerPixel = priceRange / chartHeight;
    const zoomFactor = zoomLevel / 50;
    const newPriceRange = priceRange * zoomFactor;
    const newDomainMidpoint =
      (Math.max(...data.map((d) => d.price)) +
        Math.min(...data.map((d) => d.price))) /
      2;
    const newDomain = [
      newDomainMidpoint - newPriceRange / 2,
      newDomainMidpoint + newPriceRange / 2,
    ];
    setDomain(newDomain);
  }, [zoomLevel, data]);

  const handleIntervalChange = (e) => {
    setInterval(e.target.value);
  };

  const handleWheel = (e) => {
    const newZoomLevel = zoomLevel + (e.deltaY > 0 ? -5 : 5);
    if (newZoomLevel >= 5 && newZoomLevel <= 100) {
      setZoomLevel(newZoomLevel);
    }
  };

  const handleBuyButtonClick = () => {
    if (pointToBuySell) {
      setBuySellPoints((prevPoints) => [...prevPoints, pointToBuySell]);
      setBuyMarker(pointToBuySell);
    }
  };

  const handleSellButtonClick = () => {
    if (pointToBuySell) {
      setBuySellPoints((prevPoints) => [...prevPoints, pointToBuySell]);
      setSellMarker(pointToBuySell);
    }
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    interaction: {
      mode: "index",
      intersect: false,
      axis: "x",
      callbacks: {
        label: (context) => {
          const labelTimestamp = context.parsed.x;
          const matchingDataPoint = data.find(
            (d) => d.timestamp === labelTimestamp
          );
          if (matchingDataPoint) {
            return [
              moment(matchingDataPoint.timestamp).format("YYYY-MM-DD HH:mm"),
              `Price: $${matchingDataPoint.price.toFixed(2)}`,
            ];
          }
          return null;
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "YYYY-MM-DD HH:mm",
          },
        },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          autoSkip: true,
          maxTicksLimit: 15,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        ticks: {
          color: "rgba(255,255,255,0.7)",
        },
      },
    },
  };

  const chartData = {
    datasets: [
      {
        data: data.map((d) => ({
          x: d.timestamp,
          y: d.price,
        })),
        type: "line",
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        data: buySellPoints.map((point) => ({
          x: point[0],
          y: point[1],
        })),
        type: "scatter",
        backgroundColor: "rgba(255,0,0,1)",
        borderColor: "rgba(255,0,0,1)",
        borderWidth: 1,
        pointRadius: 5,
        pointStyle: "circle",
      },
      {
        data: [buyMarker].filter(Boolean).map((point) => ({
          x: point[0],
          y: point[1],
        })),
        type: "scatter",
        backgroundColor: "green", // Set the color to green
        borderColor: "green", // Set the border color to green
        borderWidth: 0,
        pointRadius: 25,
        pointStyle: "arrow-up", // Set the point style to "arrow-up"
      },
      {
        data: [sellMarker].filter(Boolean).map((point) => ({
          x: point[0],
          y: point[1],
        })),
        type: "scatter",
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 0,
        pointRadius: 25,
        pointStyle: "arrow-down",
      },
    ],
  };

  return (
    <div>
      <div>
        <label htmlFor="interval">Interval: </label>
        <select id="interval" value={interval} onChange={handleIntervalChange}>
          <option value="1m">1 minute</option>
          <option value="5m">5 minutes</option>
          <option value="15m">15 minutes</option>
        </select>
      </div>
      <div style={{ position: "relative" }}>
        <Line data={chartData} options={options} height={400} onWheel={handleWheel} />
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <button onClick={handleBuyButtonClick}>Buy</button>
          <button onClick={handleSellButtonClick}>Sell</button>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;
