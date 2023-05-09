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
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=30"; // 10080 minutes = 1 week

const Chart = () => {
  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("1m");
  const [domain, setDomain] = useState([null, null]);
  const [zoomLevel, setZoomLevel] = useState(50);
  const chartContainerRef = useRef(null);
  const [action, setAction] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(true);

  useEffect(() => {
    // Fetch historical data for the previous week
    fetch(HISTORY_API_URL)
      .then((response) => response.json())
      .then((data) => {
        // Parse the data and format it as an array of objects
        const formattedData = data.map((item) => {
          const timestamp = item[0];
          const price = parseFloat(item[4]);
          return { timestamp, price };
        });
        // Set the formatted data as the initial state of the `data` variable
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
        console.log(data);
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
    const chartHeight = 400; // set this to the height of your chart
    const priceRange =
      Math.max(...data.map((d) => d.price)) -
      Math.min(...data.map((d) => d.price));
    const pricePerPixel = priceRange / chartHeight;
    const zoomFactor = zoomLevel / 50; // scale zoom level from 0-100 to 0-1
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
    // Increase/decrease zoom level based on the direction of the scroll
    const newZoomLevel = zoomLevel + (e.deltaY > 0 ? -5 : 5);
    // Ensure zoom level stays within the range of 0 to 100
    const clampedZoomLevel = Math.max(0, Math.min(100, newZoomLevel));
    setZoomLevel(clampedZoomLevel);
  };

  const handleBuy = () => {
    setAction("buy");
  };

  const handleSell = () => {
    setAction("sell");
  };

  const renderArrow = (data) => {
    if (action === "buy") {
      return (
        <text x={data.cx - 5} y={data.cy + 5} fill="green" fontSize="20">
          &#x25B2;
        </text>
      );
    } else if (action === "sell") {
      return (
        <text x={data.cx - 5} y={data.cy + 5} fill="red" fontSize="20">
          &#x25BC;
        </text>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <ResponsiveContainer width="100%" height={400}>
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
            strokeWidth={2}
            dot={renderArrow}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleBuy}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sell
        </button>
      </div>
      <div className="mt-4">
        <label className="mr-2">
          Interval:
          <select
            value={interval}
            onChange={handleIntervalChange}
            className="ml-2 py-1 px-2 border border-gray-400 rounded"
          >
            <option value="1m">1 minute</option>
            <option value="5m">5 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="1h">1 hour</option>
            <option value="6h">6 hours</option>
            <option value="1d">1 day</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Chart;
