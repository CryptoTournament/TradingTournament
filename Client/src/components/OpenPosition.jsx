import moment from "moment";
import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import axios from "axios";

const OpenPosition = ({ positions, currentPrice, players }) => {
  console.log(positions);
  const openPositions = positions.filter(
    ([, , , closePrice]) => closePrice === 0
  );

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
  const formatGameCurrency = (value) => {
    if (value >= 100000) {
      return (value / 1000).toLocaleString() + "k";
    } else {
      return value.toLocaleString();
    }
  };

  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

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

  const renderPosition = (position, index) => {
    console.log(position);
    const [timestamp, openPrice, amount, closePrice, type, uid] = position;

    // Find the user with the matching UID
    const user = players.find((user) => user.uid === uid);
    const userDisplayName = user ? user.displayName : "Unknown";

    let profit;
    if (type === "long") {
      closePrice === 0
        ? (profit = (currentPrice / openPrice) * amount.toFixed(2))
        : (profit = (closePrice / openPrice) * amount.toFixed(2));
    } else {
      closePrice === 0
        ? (profit = (openPrice / currentPrice) * amount.toFixed(2))
        : (profit = (openPrice / closePrice) * amount.toFixed(2));
    }

    const formattedTimestamp = moment(timestamp).format("YYYY-MM-DD HH:mm");
    const formattedOpenPrice = `$${openPrice.toFixed(2)}`;
    const formattedClosePrice =
      closePrice === 0 ? "N/A" : `$${closePrice.toFixed(3)}`;
    const formattedProfit = `$${profit.toFixed(2)}`;
    const tradeSize = `$${formatGameCurrency(amount.toFixed(1))}`;
    const formattedPNL = `$${(profit - amount).toFixed(2)}`;
    const formattedROE = `${((profit / amount) * 100 - 100).toFixed(2)}%`;

    const profitColor = profit - amount >= 0 ? "bg-green-100" : "bg-red-100";

    return (
      <tr
        className={`${profitColor} hover:bg-gray-200 transition-colors`}
        key={index}
      >
        <td className="py-2 px-4 w-1/6 text-center">{userDisplayName}</td>
        <td className="py-2 px-4 w-1/6 text-center">{formattedTimestamp}</td>
        <td className="py-2 px-4 w-1/6 text-center">{formattedOpenPrice}</td>
        <td className="py-2 px-4 w-1/6 text-center">{tradeSize}</td>
        <td className="py-2 px-4 w-1/6 text-center">{formattedPNL}</td>
        <td className="py-2 px-4 w-1/6 text-center">{formattedROE}</td>
      </tr>
    );
  };

  const filteredPositions = openPositions.filter((position) => {
    const [timestamp, openPrice, amount, closePrice, type, uid] = position;
    const user = players.find((user) => user.uid === uid);
    const userDisplayName = user ? user.displayName.toLowerCase() : "";
    return userDisplayName.includes(searchValue.toLowerCase());
  });

  const renderedPositions = filteredPositions.map(renderPosition);

  return (
    <div className="flex flex-col items-center my-8 w-full">
      <h2 className="text-xl font-bold mb-5">Open Positions</h2>
      <div className="flex items-center mb-4">
        <label htmlFor="search" className="mr-2">
          Search by Display Name:
        </label>
        <input
          type="text"
          id="search"
          value={searchValue}
          onChange={handleSearchChange}
          className="px-2 py-1 border border-gray-300 rounded"
        />
      </div>
      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-800 uppercase">
            <tr>
              <th className="py-2 px-4 w-1/6 text-center">Player</th>
              <th className="py-2 px-4 w-1/6 text-center">Timestamp</th>
              <th className="py-2 px-4 w-1/6 text-center">Open Price</th>
              <th className="py-2 px-4 w-1/6 text-center">Trade Size</th>
              <th className="py-2 px-4 w-1/6 text-center">PnL</th>
              <th className="py-2 px-4 w-1/6 text-center">ROE</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-80">
          <table className="min-w-full bg-white">
            <tbody className="text-gray-700">{renderedPositions}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpenPosition;
