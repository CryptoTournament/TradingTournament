import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { w3cwebsocket as WebSocket } from "websocket";
import Chart from "chart.js/auto";
import "chartjs-adapter-moment";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60";

const CryptoChart = () => {
  const initBalance = 1000;
  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("1m");
  const [domain, setDomain] = useState([null, null]);
  const [zoomLevel, setZoomLevel] = useState(50);
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [pointToBuySell, setPointToBuySell] = useState(null);
  const [buyPoints, setBuyPoints] = useState([]);
  const [sellPoints, setSellPoints] = useState([]);
  const [amount, setAmount] = useState(0);
  const [canTrade, setCanTrade] = useState(true);
  const [gameBalance, setGameBalance] = useState(initBalance);
  const [showButton, setShowButton] = useState(false);
  const [positions, setPositions] = useState([]);

  const updateBalance = () => {
    let balance = initBalance
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(buyPoints);
    console.log(sellPoints);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

    for (const buyPoint of buyPoints) {
      const [timestamp, price, amount, closePrice] = buyPoint;
      if (closePrice !== 0) {
        balance-= amount
        balance += (closePrice / price) * amount;
      } else {
        balance -= amount;
      }
    }
  
    for (const sellPoint of sellPoints) {
      const [timestamp, price, amount, closePrice] = sellPoint;
      if (closePrice !== 0) {
        balance-= amount
        balance += (price / closePrice) * amount;
      } else {
        balance -= amount;
      }
    }

    setGameBalance(balance);
  };
  // useEffect(() => {
    
  //   ;

  // },[]);

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
          setCanTrade(true);
        }, 60000); // 60 seconds
      }
    };
    return () => {
      socket.close();
    };
  }, [interval, shouldUpdate]);

  useEffect(() => {
    const chartHeight = 600; // Increase the chart height
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

  useEffect(() => {
    // Update balance whenever buyPoints or sellPoints change
    updateBalance();
  }, [buyPoints, sellPoints]);
  
  const closePosition = () => {
    const newBuyPoints = buyPoints.map((buyPoint) => {
      if (buyPoint[3] === 0) {
        const closePrice = pointToBuySell[1];
        const updatedBuyPoint = [...buyPoint];
        updatedBuyPoint[3] = closePrice === 0 ? pointToBuySell[1] : closePrice;
        return updatedBuyPoint;
      }
      return buyPoint;
    });
  
    const newSellPoints = sellPoints.map((sellPoint) => {
      if (sellPoint[3] === 0) {
        const closePrice = pointToBuySell[1];
        const updatedSellPoint = [...sellPoint];
        updatedSellPoint[3] = closePrice === 0 ? pointToBuySell[1] : closePrice;
        return updatedSellPoint;
      }
      return sellPoint;
    });
  
    setBuyPoints(newBuyPoints);
    setSellPoints(newSellPoints);
    updateBalance();
  
    // Update positions with profits
    const updatedPositions = positions.map((position) => {
      const [timestamp, price, amount, closePrice] = position;
      const profit = closePrice !== 0 ? ((closePrice / price) * amount) - amount : 0;
      return [...position, profit];
    });
  
    setPositions(updatedPositions);
  
    setCanTrade(true);
  };

  const handleBuyButtonClick = () => {
    if (pointToBuySell && amount > 0) {
      const position = [pointToBuySell[0], pointToBuySell[1], amount, 0];
      setPositions((prevPositions) => [...prevPositions, position]);
      setBuyPoints((prevPoints) => [...prevPoints, position]);
      setCanTrade(false);
      setGameBalance(gameBalance - amount);
    }
  };
  
  const handleSellButtonClick = () => {
    if (pointToBuySell && amount > 0) {
      const position = [pointToBuySell[0], pointToBuySell[1], amount, 0];
      setPositions((prevPositions) => [...prevPositions, position]);
      setSellPoints((prevPoints) => [...prevPoints, position]);
      setCanTrade(false);
      setGameBalance(gameBalance - amount);
    }
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    //aspectRatio: 1,
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
            minute: "HH:mm", // Show only hour and minutes
          },
        },
        ticks: {
          color: "rgba(255,255,255,0.7)",
          autoSkip: true,
          maxTicksLimit: 4,
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
        tension: 0.3,
        borderJoinStyle: "bevel",
        pointBorderWidth: 1,
        backgroundColor: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          if (
            value &&
            buyPoints.some((innerArray) => innerArray.includes(value["x"]))
          ) {
            return "rgba(0,200,0,0.4)";
          }
          if (
            value &&
            sellPoints.some((innerArray) => innerArray.includes(value["x"]))
          ) {
            return "rgba(200,0,0,0.4)";
          }
          return "rgba(75,192,192,0.4)";
        },
        pointRadius: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          if (
            value &&
            buyPoints.some((innerArray) => innerArray.includes(value["x"]))
          ) {
            const innerArray = buyPoints.find((innerArray) =>
              innerArray.includes(value["x"])
            );
            return innerArray[2];
          }
          if (
            value &&
            sellPoints.some((innerArray) => innerArray.includes(value["x"]))
          ) {
            const innerArray = sellPoints.find((innerArray) =>
              innerArray.includes(value["x"])
            );
            return innerArray[2];
          }
          return 0;
        },
      },
    ],
  };

  return (
    <div className="flex flex-col items-center">
      <div className="chart-container mx-auto w-full h-96 relative">
        <Line data={chartData} options={options} />
      </div>
      <div className="flex justify-center mt-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          placeholder="Amount"
        />
        <button
          className={`px-4 py-2 mr-2 bg-green-500 text-white rounded ${
            canTrade ? "" : "opacity-50 cursor-not-allowed"
          }`}
          onClick={handleBuyButtonClick}
          disabled={!canTrade}
        >
          Buy
        </button>
        <button
          className={`px-4 py-2 mr-2 bg-red-500 text-white rounded ${
            canTrade ? "" : "opacity-50 cursor-not-allowed"
          }`}
          onClick={handleSellButtonClick}
          disabled={!canTrade}
        >
          Sell
        </button>
        <button
          className="px-4 py-2 mr-2 bg-red-500 text-white rounded"
          onClick={closePosition}
        >
          Close Position
        </button>
      </div>
      <div>{gameBalance}</div>
  
      {/* Display positions */}
      <div className="mt-4">
        <h2>Positions</h2>
        <ul>
          {buyPoints.map((position, index) => (
            <li key={index}>
              {`Buy Position ${index + 1}: ${position[2]} at $${position[1].toFixed(3)}`}
              <br />
              {`Profit: $${((pointToBuySell[1]/position[1]) * position[2]).toFixed(3)}`}
            </li>
          ))}
          {sellPoints.map((position, index) => (
            <li key={index}>
              {`Sell Position ${index + 1}: ${position[2]} at $${position[1].toFixed(3)}`}
              <br />
              {`Profit: $${((position[1]/pointToBuySell[1]) * position[2]).toFixed(3)}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}  

export default CryptoChart;
