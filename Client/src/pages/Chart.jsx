import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { w3cwebsocket as WebSocket } from "websocket";
import useUser from "../hooks/useUser";
import Chart from "chart.js/auto";
import "chartjs-adapter-moment";
import PositionTable from "../components/PositionTable";
import OpenPosition from "../components/OpenPosition";
import axios from "axios";
import { w3cwebsocket as WebSocketClient } from "websocket";
import http from "http";
import { getUser } from "../api/users";

import {
  addPosition,
  closePositionOnServer,
  updatePlayerTournamentBalance,
} from "../api/tournaments";

const API_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";
const HISTORY_API_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1440";

const CryptoChart = ({ tournament, showChart }) => {
  const { game_name, number_of_players, max_players, players, tournament_id } =
    tournament;
  const initBalance = 1000000;
  const initChartPulses = 800;
  const { user } = useUser();

  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("1m");
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [pointToBuySell, setPointToBuySell] = useState(null);
  const [amount, setAmount] = useState("");
  const [canTrade, setCanTrade] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showChartFullWidth, setShowChartFullWidth] = useState(false);
  const [positions, setPositions] = useState([]);
  const [chartPulses, setChartPulses] = useState(initChartPulses);
  const [mainGameColor, setMainGameColor] = useState("rgba(0, 255, 255, 1)");
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [client, setClient] = useState(null);
  const [webSocketReady, setWebSocketReady] = useState(false);
  const [refreshChart, setRefreshChart] = useState(0);
  const [coinSymbol, setCoinSymbol] = useState("BTC");
  const [intervalToPresent, setIntervalToPresent] = useState(60);
  const [lastClickedButton, setLastClickedButton] = useState("1h");

  const handle1dClick = () => {
    setIntervalToPresent(1440);
    setLastClickedButton("1d");
  };

  const handle1hClick = () => {
    setIntervalToPresent(60);
    setLastClickedButton("1h");
  };

  const handle4hClick = () => {
    setIntervalToPresent(240);
    setLastClickedButton("4h");
  };

  // function parseDataString(dataString) {
  //   const cleanedString = dataString.replace(
  //     /^TID1\/NewPositionsChanges\//,
  //     ""
  //   );
  //   const dataPoints = cleanedString.split(",");
  //   const numFields = 6; // Number of fields per data point
  //   const result = [];

  //   for (let i = 0; i < dataPoints.length; i += numFields) {
  //     const dataArr = [
  //       parseInt(dataPoints[i]),
  //       parseFloat(dataPoints[i + 1]),
  //       parseFloat(dataPoints[i + 2]),
  //       parseFloat(dataPoints[i + 3]),
  //       dataPoints[i + 4],
  //       dataPoints[i + 5],
  //     ];
  //     result.push(dataArr);
  //   }

  //   return result;
  // }

  // useEffect(() => {
  //   if (webSocketReady && client) {
  //     // Send the message only when the WebSocket is ready

  //     client.send(
  //       "TID" + tournament.tournament_id + "/NewPositionsChanges/" + positions
  //     );
  //   }
  // }, [refreshChart]);

  // useEffect(() => {
  //   const hostname = window.location.hostname;
  //   const port = 443; // Port 443 for HTTPS
  //   const path = "/chart"; // Update the path to "/chart"

  //   const newClient = new WebSocket(`wss://${hostname}:${port}`);
  //   // const newClient = new WebSocketClient("ws://localhost:8080"); // Replace the URL with your WebSocket server URL

  //   newClient.onopen = () => {
  //     // console.log("WebSocket Client Connected");
  //     if (tournament != null) {
  //       newClient.send("TID" + tournament.tournament_id + "/NewConnection"); // Send "hey" message to the server
  //       setWebSocketReady(true); // Set WebSocket readiness to true
  //     }
  //   };

  //   newClient.onclose = () => {
  //     setWebSocketReady(false); // Set WebSocket readiness to false
  //     // console.log("WebSocket Connection Closed");
  //   };

  //   newClient.onmessage = (message) => {
  //     // console.log("Received: '" + message.data + "'");
  //     if (message.data.includes("/NewPositionsChanges")) {
  //       setPositions(parseDataString(message.data));
  //     }
  //   };
  //   setClient(newClient); // Update the client variable

  //   // Cleanup the WebSocket connection
  //   return () => {
  //     newClient.close();
  //   };
  // }, [tournament]);

  const getBalance = (userId) => {
    let balance = initBalance;
    for (const position of positions) {
      const [timestamp, price, amount, closePrice, type, uid] = position;

      if (uid === userId) {
        balance -= amount;
        if (closePrice !== 0) {
          if (type === "long") {
            balance += (closePrice / price) * amount;
          } else {
            //Short
            balance += (price / closePrice) * amount;
          }
        } //if open position
        else {
          if (pointToBuySell) {
            // console.log(pointToBuySell[1]);
            if (type === "long") {
              balance += (pointToBuySell[1] / price) * amount;
            } else {
              //Short
              balance += (price / pointToBuySell[1]) * amount;
            }
          }
        }
      }
    }

    return balance;
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
        const sortedPlayersCalculation = [...players].sort(
          (a, b) => getBalance(b.uid) - getBalance(a.uid)
        );
        setSortedPlayers(sortedPlayersCalculation);
        const positionsArray = tournament.players.flatMap((player) => {
          return player.positions.map((position) => {
            const {
              type,
              open_price,
              status,
              start_time,
              amount,
              close_price,
            } = position;
            let timestamp = start_time;
            let closePrice = close_price ? close_price : 0; // If close_price is not defined set it as null
            let userid = player.uid;
            return [timestamp, open_price, amount, closePrice, type, userid];
          });
        });

        setTimeout(() => {
          setShouldUpdate(true);
        }, 60000); // 60 seconds
      }
    };
    return () => {
      socket.close();
    };
  }, [interval, shouldUpdate]);

  //sort leaderboard @ the beginning
  useEffect(() => {
    console.log(
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
    );
    // if (!players) {
    //   return;
    // }
    // console.log(players);
    // console.log(pointToBuySell[1]);

    const sortedPlayersCalculation = [...players].sort(
      (a, b) => getBalance(b.uid) - getBalance(a.uid)
    );
    setSortedPlayers(sortedPlayersCalculation);
    console.log(sortedPlayersCalculation);
  }, [players, pointToBuySell]);

  useEffect(() => {
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
    setPositions(positionsArray);

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
    let totalBalanceChange = 0; // to keep track of how much the balance has changed

    for (let position of positions) {
      if (position[3] === 0 && position[5] === user.uid) {
        const closePrice = pointToBuySell[1];
        const updatedPosition = [...position];
        updatedPosition[3] = closePrice === 0 ? pointToBuySell[1] : closePrice;

        // calculate the balance change due to this position
        if (position[4] === "long") {
          totalBalanceChange += (closePrice - position[1]) * position[2];
        } else if (position[4] === "short") {
          totalBalanceChange += (position[1] - closePrice) * position[2];
        }

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
    // updateBalance(updatedPositions);
    setCanTrade(true);
    setRefreshChart(refreshChart + 1);
  };

  const handleBuyButtonClick = async () => {
    if (user && amount > getBalance(user.uid)) {
      setAmount("");

      return;
    }
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
          // console.log((prevPositions) => [...prevPositions, position]);
          setCanTrade(false);
          setRefreshChart(refreshChart + 1);
          setAmount(0);
        } catch (error) {
          console.error("Error adding position", error);
          // here you can handle the error, for example show a message to the user
        }
      } else {
        // User already has an open position
      }
    }
  };
  useEffect(() => {
    console.log("tournament state updated");
  }, [tournament]);
  const handleSellButtonClick = async () => {
    if (user && amount > getBalance(user.uid)) {
      setAmount("");
      return;
    }
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
          setCanTrade(false);
          setRefreshChart(refreshChart + 1);
          setAmount(0);
        } catch (error) {
          console.error("Error adding position", error);
          // here you can handle the error, for example show a message to the user
        }
      } else {
        // User already has an open position
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

      tooltip: {
        mode: "nearest",
        cornerRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderColor: "rgba(75, 192, 192, 0.4)",
        borderWidth: 3,
        padding: 12,
        bodySpacing: 4,
        titleColor: "rgba(75, 192, 192, 0.8)",
        bodyFont: {
          family: "Arial",
          size: 18,
        },
        displayColors: false,
        callbacks: {
          title(tooltipItems) {
            if (tooltipItems.length > 0) {
              const item = tooltipItems[0];
              const labels = item.chart.data.labels;
              const labelCount = labels ? labels.length : 0;
              const price = item.formattedValue.toString();
              if (this && this.options && this.options.mode === "dataset") {
                return [
                  item.dataset.label || "",
                  coinSymbol + " Price " + price,
                ];
              } else if (item.label) {
                return [item.label, coinSymbol + " Price " + price];
              } else if (labelCount > 0 && item.dataIndex < labelCount) {
                return [labels[item.dataIndex], coinSymbol + " Price " + price];
              }
            }
            return "";
          },
          label: function (context) {
            const index = context.dataIndex;
            const value = context.dataset.data[index];
            const price = value.y.toString();
            let label = [];
            let lineToAdd = "";

            if (value) {
              const matchingPositions = positions.filter(
                ([timestamp]) => timestamp === value.x
              );

              matchingPositions.forEach(([, , amount, , , uid]) => {
                sortedPlayers.forEach((player) => {
                  if (player.uid === uid) {
                    lineToAdd += player.displayName;
                  }
                });
                lineToAdd += " (" + amount.toString() + ")";
                label.push(lineToAdd);
                lineToAdd = "";
              });
            }

            return label;
          },
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
        data: data.slice(-intervalToPresent).map((d) => ({
          x: d.timestamp,
          y: d.price,
        })),
        type: "line",

        borderColor: "rgba(75, 192, 192, 0.4)",
        pointBorderColor: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];

          if (value) {
            const matchingPositions = positions.filter(
              ([timestamp]) => timestamp === value.x
            );

            matchingPositions.forEach(([, , , , , uid]) => {
              sortedPlayers.forEach((player) => {
                if (player.uid === uid) {
                  //find the user color here
                }
              });
            });
          }
          return "rgba(75, 192, 192, 0.4)"; // Default color
        },

        backgroundColor: function (context) {
          const gradient = context.chart.ctx.createLinearGradient(
            24,
            24,
            27,
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
        <p className="text-lg sm:text-4xl font-bold text-white">
          Bitcoin Price: {pointToBuySell[1]}
        </p>
      );
    } else {
      return null;
    }
  };

  const formatGameCurrency = (value) => {
    return Math.floor(value).toLocaleString();
  };

  return (
    <div className="flex flex-col items-center ml-2">
      <div className="flex justify-start w-full">
        <div className="flex flex-col items-start pl-8">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4 text-left text-white">
            {game_name}
            <span className="text-white text-lg ml-4">
              ({number_of_players} / {max_players})
            </span>
          </h1>
          <div className="text-2xl  sm:text-3xl font-semibold mb-4 text-left text-white">
            {user &&
              "Your Balance:" +
                `${Math.floor(getBalance(user.uid)).toLocaleString()}$`}
          </div>
          <div className="text-white font-semibold">
            {moment(tournament.end_date).diff(moment(), "hours") +
              " Hours Left"}
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row w-full ml-36 sm:ml-48  translate-y-14 z-50">
        <PriceDisplay />
        <div className="mt-2 lg:ml-96 ">
          <button
            className={`text-end btn-outline-primary mx-2 border rounded-lg px-3${
              lastClickedButton === "1h"
                ? " text-teal-600 border-teal-600"
                : " border-bg-main-custom"
            }`}
            onClick={handle1hClick}
          >
            1h
          </button>
          <button
            className={`btn btn-outline-primary mx-2 border rounded-lg px-3${
              lastClickedButton === "4h"
                ? " text-teal-600 border-teal-600"
                : " border-bg-main-custom"
            }`}
            onClick={handle4hClick}
          >
            4h
          </button>
          <button
            className={`btn  btn-outline-primary mx-2 border rounded-lg px-3${
              lastClickedButton === "1d"
                ? " text-teal-600 border-teal-600"
                : " border-bg-main-custom"
            }`}
            onClick={handle1dClick}
          >
            1d
          </button>
        </div>
      </div>
      <div className="flex flex-col 2xl:flex-row w-full pr-10">
        <div className={`transition-all duration-1000 w-full`}>
          <div
            className={`chart-container mr-0  rounded-lg p-4 bg-black   h-96 relative transition-all duration-500 ${
              showChartFullWidth ? "md:w-11/12" : "md:w-11/12"
            }`}
          >
            <Line data={chartData} options={options} />
          </div>
          <div className="flex justify-center mt-4 mb-20 ">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setAmount(isNaN(value) || value < 0 ? "" : value);
              }}
              placeholder="Amount"
              className="mr-2 text-center text-black"
            />
            <button
              className={`px-4 mx-1 py-2 bg-green-500 text-white rounded ${
                canTrade ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleBuyButtonClick}
              disabled={!canTrade}
            >
              Buy
            </button>
            <button
              className={`px-4  py-2 bg-red-500 text-white rounded ${
                canTrade ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleSellButtonClick}
              disabled={!canTrade}
            >
              Sell
            </button>
            {!canTrade && (
              <button
                className="px-4 ml-2 py-2 bg-red-500 text-white rounded"
                onClick={closePosition}
              >
                Close Position
              </button>
            )}
          </div>
        </div>
        <div
          className={`w-full -translate-y-20 mx-auto mt-4 md:mt-0 transition-all duration-1000 ${
            showLeaderboard ? "md:w-1/4" : "md:w-28 "
          }`}
        >
          <button
            className="hidden mt-4 bg-gray-500 text-white px-4 py-2 rounded 2xl:block"
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
              setShowChartFullWidth(!showLeaderboard);
            }}
          >
            {!showLeaderboard ? "< Show" : "> Hide"}
          </button>
          <div
            className={`transition-all ml-8 mt-14 2xl:mt-5 ease-in-out duration-500 transform  xl:mx-0 xl:w-auto ${
              showLeaderboard ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h2 className="text-xl  font-bold mb-4 text-teal-200 text-opacity-60 text-center text">
              Leaderboard
            </h2>
            <table className="min-w-full bg-teal-300 bg-opacity-40 border-collapse">
              <thead>
                <tr className="">
                  <th className="px-4 py-2 border-b w-1/12  border-black text-teal-200">
                    Rank
                  </th>
                  <th className="px-4 py-2 border-b  border-black  text-teal-200">
                    Player
                  </th>
                  <th className="px-4 py-2 border-b border-black  text-teal-200">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers &&
                  sortedPlayers.map((player, index) => (
                    <tr key={player.uid} className="h-11">
                      {user && (
                        <>
                          <td
                            className={`px-4 py-2 border-b  border-black text-center  ${
                              player.uid === user.uid
                                ? "text-teal-900  bg-teal-500"
                                : "text-teal-300"
                            }`}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={`px-4 py-2 border-b border-black  text-center ${
                              player.uid === user.uid
                                ? "text-teal-900  bg-teal-500"
                                : "text-gray-100"
                            }`}
                          >
                            {player.displayName}
                          </td>
                          <td
                            className={`px-4 py-2 border-b  border-black text-center ${
                              player.uid === user.uid
                                ? "text-teal-900 bg-teal-500"
                                : "text-gray-100"
                            }`}
                          >
                            {/* {getBalance(player.uid) + " $"} */}
                            {player.uid === user.uid
                              ? formatGameCurrency(getBalance(player.uid)) +
                                " $"
                              : formatGameCurrency(getBalance(player.uid)) +
                                " $"}
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
      <div className="flex flex-col scale-90 sm:scale-100 xl:flex-row xl:space-x-16 mt-8  ">
        <div className="xl:mx-auto  sm:px-0">
          {pointToBuySell ? (
            <OpenPosition
              positions={positions}
              currentPrice={pointToBuySell[1]}
              players={players}
            />
          ) : null}
        </div>
        <div className="xl:mx-auto ">
          {pointToBuySell ? (
            <PositionTable
              positions={positions}
              currentPrice={pointToBuySell[1]}
              players={players}
            />
          ) : null}
        </div>
      </div>
      <button
        className="mt-2 absolute right-16 top-28 mr-2 text-gray-400 hover:text-gray-700 text-2xl"
        onClick={() => showChart(false)}
      >
        X
      </button>
    </div>
  );
};

export default CryptoChart;
