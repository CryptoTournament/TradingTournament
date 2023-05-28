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
import {
  addPosition,
  closePositionOnServer,
  updatePlayerTournamentBalance,
} from "../api/tournaments";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60";

const CryptoChart = ({ tournament, showChart }) => {
  const { game_name, number_of_players, max_players, players, tournament_id } =
    tournament;
  const initBalance = 1000000;
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
  const [amount, setAmount] = useState(0);
  const [canTrade, setCanTrade] = useState(true);
  const [gameBalance, setGameBalance] = useState(initBalance);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showChartFullWidth, setShowChartFullWidth] = useState(false);
  const [positions, setPositions] = useState([]);
  const [chartPulses, setChartPulses] = useState(initChartPulses);
  const [mainGameColor, setMainGameColor] = useState("rgba(0, 255, 255, 1)");
  const [sortedPlayers, setSortedPlayers] = useState([]);
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

  // useEffect(() => {
  //   const sendPositions = async () => {
  //     try {
  //       const gid = 123;
  //       const response = await axios.put(`/api/games/${gid}`, { positions });
  //     } catch (error) {
  //       console.error("Error updating user data", error);
  //     }
  //   };
  //   sendPositions();
  // }, [positions]);

  const updateBalance = (positionsArray) => {
    let balance = initBalance;
    console.log("calculating...");
    console.log(positionsArray);
    for (const position of positionsArray) {
      const [timestamp, price, amount, closePrice, type, uid] = position;

      if (user && uid === user.uid) {
        console.log("thats my position!");
        balance -= amount;
        if (closePrice !== 0) {
          if (type === "long") {
            balance += (closePrice / price) * amount;
          } else {
            //Short
            balance += (price / closePrice) * amount;
          }
        }
      }
    }
    console.log("http call");
    if (user) {
      updatePlayerTournamentBalance(
        tournament.tournament_id,
        user.uid,
        balance
      );
      setGameBalance(balance);
    }
  };

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
      const newData = JSON.parse(event.data);
      if (newData.k && shouldUpdate) {
        const timestamp = newData.k.t;
        const price = parseFloat(newData.k.c);
        setPointToBuySell([timestamp, price]);
        setData((prevData) => {
          const lastDataTimestamp = prevData[prevData.length - 1]?.timestamp; // Get the timestamp of the last element in the array

          // If the last data timestamp is not the same as the new data timestamp, add the new data.
          if (lastDataTimestamp !== timestamp) {
            return [...prevData, { timestamp, price }];
          }

          // If the last data timestamp is the same, just return the existing data without modification.
          return prevData;
        });
        setShouldUpdate(false);
        setChartPulses(initChartPulses);
        setTimeout(() => {
          setShouldUpdate(true);
          if (user) {
            const hasOpenPosition = positionsArray.some(
              (position) => position[3] === 0 && position[5] === user.uid
            );

            setCanTrade(!hasOpenPosition);
          }
        }, 60000); // 60 seconds
      }
    };
    return () => {
      socket.close();
    };
  }, [interval, shouldUpdate]);

  useEffect(() => {
    const chartHeight = 900; // Increase the chart height
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
    console.log(tournament);
    // Sort players by scores
    const sortedPlayersCalculation = [...players].sort(
      (a, b) => b.game_currency - a.game_currency
    );
    setSortedPlayers(sortedPlayersCalculation);
    const positionsArray = tournament.players.flatMap((player) => {
      return player.positions.map((position) => {
        const { type, open_price, status, start_time, amount, close_price } =
          position;
        let timestamp = start_time;
        let closePrice = close_price ? close_price : 0; // If close_price is not defined set it as null
        let userid = player.uid;
        return [timestamp, open_price, amount, closePrice, type, userid];
      });
    });
    console.log(positionsArray);
    setPositions(positionsArray);
    updateBalance(positionsArray);

    // Check if there is an open position for the user
    if (user) {
      const hasOpenPosition = positionsArray.some(
        (position) => position[3] === 0 && position[5] === user.uid
      );

      setCanTrade(!hasOpenPosition);
    }
  }, [tournament, user]);

  const closePosition = async () => {
    const updatedPositions = [];

    for (let position of positions) {
      if (position[3] === 0 && position[5] === user.uid) {
        const closePrice = pointToBuySell[1];
        const updatedPosition = [...position];
        updatedPosition[3] = closePrice === 0 ? pointToBuySell[1] : closePrice;

        // Close the position on the server
        try {
          await closePositionOnServer(tournament_id, updatedPosition);
          updatedPositions.push(updatedPosition);
        } catch (error) {
          console.error("Error closing position", error);
        }
      } else {
        updatedPositions.push(position);
      }
    }

    setPositions(updatedPositions);
    updateBalance(updatedPositions);
    setCanTrade(true);
  };

  const handleBuyButtonClick = async () => {
    if (pointToBuySell && amount > 0) {
      // Check if the user already has an open position
      const hasOpenPosition = positions.some(
        (position) => position[3] === 0 && position[5] === user.uid
      );

      if (!hasOpenPosition) {
        const position = [
          pointToBuySell[0],
          pointToBuySell[1],
          amount,
          0,
          "long",
          user.uid,
        ];

        try {
          await addPosition(tournament.tournament_id, position);
          setPositions((prevPositions) => [...prevPositions, position]);
          setGameBalance(gameBalance - amount);
          setCanTrade(false);
        } catch (error) {
          console.error("Error adding position", error);
          // here you can handle the error, for example show a message to the user
        }
      } else {
        // User already has an open position
        console.log("User already has an open position");
      }
    }
  };

  const handleSellButtonClick = async () => {
    if (pointToBuySell && amount > 0) {
      // Check if the user already has an open position
      const hasOpenPosition = positions.some(
        (position) => position[3] === 0 && position[5] === user.uid
      );

      if (!hasOpenPosition) {
        const position = [
          pointToBuySell[0],
          pointToBuySell[1],
          amount,
          0,
          "short",
          user.uid,
        ];

        try {
          await addPosition(tournament.tournament_id, position);
          setPositions((prevPositions) => [...prevPositions, position]);
          setGameBalance(gameBalance - amount);
          setCanTrade(false);
        } catch (error) {
          console.error("Error adding position", error);
          // here you can handle the error, for example show a message to the user
        }
      } else {
        // User already has an open position
        console.log("User already has an open position");
      }
    }
  };

  function normalizeRadius(value) {
    const minOldRange = 0;
    const maxOldRange = 1000000;
    const minNewRange = 5;
    const maxNewRange = 50;

    return (
      ((value - minOldRange) / (maxOldRange - minOldRange)) *
        (maxNewRange - minNewRange) +
      minNewRange
    );
  }

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
          enabled: false,
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
        backgroundColor: function (context) {
          const gradient = context.chart.ctx.createLinearGradient(
            0,
            0,
            0,
            context.chart.height
          );

          gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)"); // Faded black color
          gradient.addColorStop(0, mainGameColor); // Aqua color

          return gradient;
        },
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
          if (totAmount == 0) {
            return 0;
          }
          return normalizeRadius(totAmount);
        },
      },
    ],
  };

  const PriceDisplay = () => {
    if (pointToBuySell !== null) {
      return (
        <p className="text-2xl sm:text-4xl font-bold text-black">
          Bitcoin Price: {pointToBuySell[1]}
        </p>
      );
    } else {
      return null;
    }
  };
  console.log(sortedPlayers);

  const formatGameCurrency = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 100000) {
      return (value / 1000).toLocaleString() + "k";
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="flex flex-col items-start pl-8">
          {" "}
          {/* Change items-end to items-start */}
          <button
            className="absolute top-28 right-10 mt-2 mr-2 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={() => showChart(false)}
          >
            X
          </button>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-10 text-center text-black">
            {game_name}{" "}
            <span className="text-gray-500 text-lg">
              ({number_of_players} / {max_players})
            </span>
          </h1>
          <div className="text-black text-lg">
            {" "}
            {/* Add new div for gameBalance */}
            {formatGameCurrency(gameBalance)} $
          </div>
        </div>
      </div>
      <div className="flex">
        <PriceDisplay />
      </div>
      <div className="flex flex-col notComputer:flex-row w-full px-10">
        <div
          className={`transition-all duration-1000 w-full sm:w-${
            showChartFullWidth ? "" : "full"
          }`}
        >
          <div
            className={`chart-container bg-black  w-11/12 h-96 relative transition-all duration-500 ${
              showChartFullWidth ? "sm:w-11/12" : "sm:w-full"
            }`}
          >
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
        <div
          className={`w-full ml-4  mt-4 sm:mt-0 transition-all duration-1000 ${
            showLeaderboard ? "sm:w-1/4" : "sm:w-1/12 "
          }`}
        >
          <button
            className="mt-4  bg-gray-500 text-white px-4 py-2 rounded hidden 2xl:block"
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
              setShowChartFullWidth(!showLeaderboard);
            }}
          >
            {!showLeaderboard ? "< Show" : "> Hide"}
          </button>
          <div
            className={`transition-all ease-in-out duration-500 transform ${
              showLeaderboard ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Leaderboard
            </h2>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-100 border-b w-1/12">
                    Rank
                  </th>
                  <th className="px-4 py-2 bg-gray-100 border-b">Player</th>
                  <th className="px-4 py-2 bg-gray-100 border-b">Balance</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers &&
                  sortedPlayers.map((player, index) => (
                    <tr key={player.uid} className="h-11">
                      {user && (
                        <>
                          <td
                            className={`px-4 py-2 border-b text-center ${
                              player.uid === user.uid ? "text-black" : ""
                            }`}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={`px-4 py-2 border-b text-center ${
                              player.uid === user.uid ? "text-black" : ""
                            }`}
                          >
                            {player.displayName}
                          </td>
                          <td
                            className={`px-4 py-2 border-b text-center ${
                              player.uid === user.uid ? "text-black" : ""
                            }`}
                          >
                            {player.uid === user.uid
                              ? formatGameCurrency(gameBalance) + " $"
                              : formatGameCurrency(player.game_currency) + " $"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;
