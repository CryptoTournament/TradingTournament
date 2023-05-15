import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import { w3cwebsocket as WebSocket } from "websocket";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=30";

const Chart = () => {
  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("1m");
  const [domain, setDomain] = useState([null, null]);
  const [zoomLevel, setZoomLevel] = useState(50);
  const chartContainerRef = useRef(null);
  const [action, setAction] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [lastData, setLastData] = useState(null);
  const [pointToBuySell, setPointToBuySell] = useState(null);
  const [buySellPoints, setBuySellPoints] = useState([]);

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
        console.log("Draw ! ");
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
    const clampedZoomLevel = Math.max(0, Math.min(100, newZoomLevel));
    setZoomLevel(clampedZoomLevel);
  };

  const handleBuy = () => {
    setBuySellPoints((prevPoints) => [
      ...prevPoints,
      { ...pointToBuySell, action: "buy" },
    ]);
  };

  const handleSell = () => {
    setBuySellPoints((prevPoints) => [
      ...prevPoints,
      { ...pointToBuySell, action: "sell" },
    ]);
  };

  const scalePoint = (price, timestamp, chartData, chartHeight, chartWidth) => {
    const minPrice = Math.min(...chartData.map((d) => d.price));
    const maxPrice = Math.max(...chartData.map((d) => d.price));
    const minTimestamp = chartData[0].timestamp;
    const maxTimestamp = chartData[chartData.length - 1].timestamp;
    console.log("price is:" + price);
    console.log("minPrice is:" + minPrice);
    console.log("maxPrice is:" + maxPrice);
    console.log("chartHeight is:" + chartHeight);

    const y =
      chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    const x =
      ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * chartWidth;

    return [x, y];
  };

  const CustomDot = ({ action, width, height, chartData, cx, cy }) => {
    return (
      <>
        {buySellPoints.map((point, index) => {
          console.log(buySellPoints);
          const [x, y] = scalePoint(
            point[1],
            point.timestamp,
            chartData,
            height,
            width
          );

          if (point.action === "buy") {
            return (
              <text key={index} x={x} y={y} fill="green" fontSize="10">
                &#x25B2;
              </text>
            );
          } else if (point.action === "sell") {
            return (
              <text key={index} x={x} y={y} fill="red" fontSize="10">
                &#x25BC;
              </text>
            );
          }
        })}
      </>
    );
  };

  const chartHeight = 400;
  const chartWidth = "100%";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <ResponsiveContainer width={chartWidth} height={chartHeight}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          className="bg-white"
        >
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => moment(timestamp).format("h:mm A")}
            domain={["dataMin", "dataMax"]}
            scale="time"
            type="number"
          />
          <YAxis domain={domain} />
          <Tooltip
            labelFormatter={(timestamp) =>
              moment(timestamp).format("MMM DD, YYYY h:mm A")
            }
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#000000"
            strokeWidth={1}
            dot={
              <CustomDot
                action={action}
                chartHeight={chartHeight}
                chartWidth={chartWidth}
                chartData={data}
              />
            }
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center mt-2">
        <div className="mr-2">Interval:</div>
        <select
          value={interval}
          onChange={handleIntervalChange}
          className="border border-gray-300 rounded-md"
        >
          <option value="1m">1m</option>
          <option value="3m">3m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="30m">30m</option>
          <option value="1h">1h</option>
          <option value="2h">2h</option>
          <option value="4h">4h</option>
          <option value="6h">6h</option>
          <option value="12h">12h</option>
          <option value="1d">1d</option>
          <option value="3d">3d</option>
          <option value="1w">1w</option>
        </select>
      </div>
      <div className="flex items-center mt-2">
        <div className="mr-2">Zoom Level:</div>
        <input
          type="range"
          min="0"
          max="100"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(e.target.value)}
          onWheel={handleWheel}
          className="w-40"
        />
      </div>
      <div className="flex items-center mt-2">
        <button
          onClick={handleBuy}
          className="mr-2 bg-green-500 px-3 py-1 rounded-md text-white"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="bg-red-500 px-3 py-1 rounded-md text-white"
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default Chart;