import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { w3cwebsocket as WebSocket } from "websocket";
import useUser from "../hooks/useUser";
import Chart from "chart.js/auto";
import "chartjs-adapter-moment";
import PositionTable from "../components/PositionTable";
import OpenPosition from "../components/OpenPosition";
import axios from "axios";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60";

const CryptoChart = () => {
  const initBalance = 1000;
  const initChartPulses = 800;
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    wins: 0,
    gamesPlayed: 0,
    gameTokens: 0,
    accountType: "Regular",
  });
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
  const [chartPulses, setChartPulses] = useState(initChartPulses);

  // poition=[Time,openPrice,Amount,closePrice,type]
  // const updateBalance = () => {
  //   let balance = initBalance;
  //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  //   console.log(buyPoints);
  //   console.log(sellPoints);
  //   console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

  //   for (const buyPoint of buyPoints) {
  //     const [timestamp, price, amount, closePrice] = buyPoint;
  //     if (closePrice !== 0) {
  //       balance -= amount;
  //       balance += (closePrice / price) * amount;
  //     } else {
  //       balance -= amount;
  //     }
  //   }

  //   for (const sellPoint of sellPoints) {
  //     const [timestamp, price, amount, closePrice] = sellPoint;
  //     if (closePrice !== 0) {
  //       balance -= amount;
  //       balance += (price / closePrice) * amount;
  //     } else {
  //       balance -= amount;
  //     }
  //   }

  //   setGameBalance(balance);
  // };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/users/${user.uid}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const sendPositions = async () => {
      try {
        const gid = 123;
        const response = await axios.put(`/api/games/${gid}`, { positions });
      } catch (error) {
        console.error("Error updating user data", error);
      }
    };
    sendPositions();
  }, [positions]);

  const updateBalance = () => {
    let balance = initBalance;
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(positions);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

    for (const position of positions) {
      const [timestamp, price, amount, closePrice, type, displayname] =
        position;
      if (displayname == userDetails.displayName) {
        balance -= amount;
        if (closePrice !== 0) {
          if (type == "long") {
            balance += (closePrice / price) * amount;
          } else {
            //Short
            balance += (price / closePrice) * amount;
          }
        }
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
        setChartPulses(initChartPulses);
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
  }, [positions]);

  const closePosition = () => {
    const updatedPositions = positions.map((position) => {
      if (position[3] === 0 && position[5] == userDetails.displayName) {
        const closePrice = pointToBuySell[1];
        const updatedPosition = [...position];
        updatedPosition[3] = closePrice === 0 ? pointToBuySell[1] : closePrice;
        return updatedPosition;
      }
      return position;
    });

    setPositions(updatedPositions);
    updateBalance();
    setCanTrade(true);
  };

  const handleBuyButtonClick = () => {
    if (pointToBuySell && amount > 0) {
      const position = [
        pointToBuySell[0],
        pointToBuySell[1],
        amount,
        0,
        "long",
        userDetails.displayName,
      ];
      setPositions((prevPositions) => [...prevPositions, position]);
      setBuyPoints((prevPoints) => [...prevPoints, position]);
      setCanTrade(false);
      setGameBalance(gameBalance - amount);
    }
  };

  const handleSellButtonClick = () => {
    if (pointToBuySell && amount > 0) {
      const position = [
        pointToBuySell[0],
        pointToBuySell[1],
        amount,
        0,
        "short",
        userDetails.displayName,
      ];
      setPositions((prevPositions) => [...prevPositions, position]);
      // setSellPoints((prevPoints) => [...prevPoints, position]);
      setCanTrade(false);
      setGameBalance(gameBalance - amount);
    }
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,

    animations: {
      tension: {
        duration: chartPulses,
        easing: "linear",
        from: 0.6,
        to: 0.2,
        loop: true,
      },
    },

    plugins: {
      legend: { display: false },

      title: {
        display: true,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          pinch: {
            enabled: true, // Enable pinch zooming
          },
          wheel: {
            enabled: true, // Enable wheel zooming
          },
          mode: "x",
        },
      },
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

        borderColor: "rgba(75,192,192,0.7)",
        backgroundColor: "rgba(75,192,192,0.7)",
        borderWidth: 2,
        tension: 0.5,
        borderJoinStyle: "bevel",
        pointBorderWidth: 7,
        fill: true,
        pointBackgroundColor: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];

          if (value) {
            const matchingPositions = positions.filter(
              ([timestamp]) => timestamp === value.x
            );

            if (matchingPositions.length > 0) {
              const longCount = matchingPositions.filter(
                ([, , , , type]) => type === "long"
              ).length;
              const shortCount = matchingPositions.filter(
                ([, , , , type]) => type === "short"
              ).length;
              const totalCount = matchingPositions.length;

              if (longCount === totalCount) {
                return "rgba(0, 255, 0, 0.4)"; // Total green if there are only longs
              } else if (shortCount === totalCount) {
                return "rgba(255, 0, 0, 0.4)"; // Total red if there are only shorts
              } else {
                const greenRatio = longCount / totalCount;
                const redRatio = shortCount / totalCount;

                const gradient = context.chart.ctx.createLinearGradient(
                  0,
                  0,
                  0,
                  context.chart.height
                );

                gradient.addColorStop(
                  0,
                  `rgba(255, 0, 0, ${1 - redRatio * 0.6})`
                ); // Adjust red color stop
                gradient.addColorStop(
                  1,
                  `rgba(0, 255, 0, ${1 - greenRatio * 0.6})`
                ); // Adjust green color stop

                return gradient;
              }
            }
          }

          return "rgba(75, 192, 192, 0.4)"; // Default color
        },

        pointRadius: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          let totAmount = 0;

          if (value) {
            const matchingPositions = positions.filter(
              ([timestamp]) => timestamp === value.x
            );

            if (matchingPositions.length > 0) {
              matchingPositions.forEach(([, , amount]) => {
                totAmount += amount;
              });
            }
          }

          return totAmount;
        },
        // backgroundColor: function (context) {
        //   const chart = context.chart;
        //   const ctx = chart.ctx;
        //   const chartArea = chart.chartArea;
        //   const gradient = ctx.createLinearGradient(
        //     chartArea.left,
        //     chartArea.bottom,
        //     chartArea.left,
        //     chartArea.top
        //   );
        //   gradient.addColorStop(0, "rgba(0, 255, 255, 0.2)"); // Aqua color at the bottom
        //   gradient.addColorStop(1, "rgba(0, 128, 0, 0.2)"); // Green color at the top
        //   return gradient;
        // },
      },
    ],
  };
  return (
    <div className="flex flex-col items-center">
      <div className="chart-container mx-auto w-5/6 h-96 relative">
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

      <div className="mt-4">
        {pointToBuySell ? (
          <OpenPosition
            positions={positions}
            currentPrice={pointToBuySell[1]}
          />
        ) : (
          ""
        )}
      </div>

      <div className="mt-4">
        {pointToBuySell ? (
          <PositionTable
            positions={positions}
            currentPrice={pointToBuySell[1]}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CryptoChart;
