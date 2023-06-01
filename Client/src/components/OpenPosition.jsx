import moment from "moment";
import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import axios from "axios";
import { FcSearch } from "react-icons/fc";

const OpenPosition = ({ positions, currentPrice, players }) => {
  console.log(positions);
  const openPositions = positions
    .filter(([, , , closePrice]) => closePrice === 0)
    .reverse();

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

    const profitColor =
      profit - amount >= 0 ? "text-green-500" : "text-red-500";

    return (
      <tr
        className={` hover:bg-teal-900 transition-colors text-xs sm:text-base`}
        key={index}
      >
        <td
          className={
            type == "long"
              ? ` bg-green-300 bg-opacity-40 text-gray-100 py-2 px-2 sm:px-4 text-center w-1/6`
              : " bg-red-300 bg-opacity-40 text-gray-100 py-2 px-2 sm:px-4 text-center w-1/6"
          }
        >
          {`${userDisplayName} (${type})`}
        </td>
        <td
          className={` hidden sm:table-cell py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
        >
          {formattedTimestamp}
        </td>
        <td
          className={` py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
        >
          {formattedOpenPrice}
        </td>
        <td
          className={` py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
        >
          {tradeSize}
        </td>
        <td
          className={`py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
        >
          {formattedROE}
        </td>
        <td
          className={`${profitColor}  py-2 px-4 w-1/6 text-center bg-opacity-40`}
        >
          {formattedPNL}
        </td>
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
    <div className="flex flex-col items-center  w-full px-4">
      <div className="flex xl:flex-col">
        <h2 className="text-xl font-bold mb-5 mr-8 xl:mr-0 xl:ml-8 text-teal-200 text-opacity-60">
          Open Positions
        </h2>
        <div className="flex items-center mb-4">
          <label htmlFor="search" className="mr-2">
            <FcSearch size={24} />
          </label>
          <input
            type="text"
            id="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="search by name"
            className="px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div className="overflow-hidden  shadow-lg border-2 border-teal-600 p-2 rounded-lg">
        <table className="min-w-full bg-opacity-0">
          <thead className="bg-black text-teal-600 uppercase">
            <tr className="text-xs sm:text-base">
              <th className="py-2 px-4 w-1/6 text-center">Player</th>
              <th className="hidden sm:table-cell py-2 px-4 w-1/6 text-center">
                Timestamp
              </th>
              <th className="py-2 px-4 w-1/6 text-center">Open Price</th>
              <th className="py-2 px-4 w-1/6 text-center">Trade Size</th>
              <th className="py-2 px-4 w-1/6 text-center">ROE</th>
              <th className="py-2 px-4 w-1/6 text-center">PnL</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-80">
          <table className="min-w-full bg-opacity-0">
            <tbody className="text-gray-700">{renderedPositions}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpenPosition;
