import moment from "moment";
import { useState } from "react";

const PositionTable = ({ positions, currentPrice, players }) => {
  const closedPositions = positions
    .filter(([, , , closePrice]) => closePrice !== 0)
    .reverse();

  const getRowClass = (profit) => {
    if (profit >= 0) {
      return "bg-green-200";
    } else {
      return "bg-red-200";
    }
  };

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

  const filteredPositions = closedPositions.filter((position) => {
    const [timestamp, openPrice, amount, closePrice, type, uid] = position;
    const user = players.find((user) => user.uid === uid);
    const userDisplayName = user ? user.displayName.toLowerCase() : "";
    return userDisplayName.includes(searchValue.toLowerCase());
  });

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg sm:text-xl font-bold mb-5">Closed Positions</h2>
      <div className="flex items-center mb-4">
        <label htmlFor="search" className="mr-2 text-black">
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
          <thead className="bg-gray-100 text-gray-800 uppercase text-xs sm:text-base">
            <tr>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Player</th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Timestamp</th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">
                Open Price
              </th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Amount</th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">
                Close Price
              </th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Profit</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-80">
          <table className="min-w-full bg-white">
            <tbody className="text-gray-700">
              {filteredPositions.slice(0, 10).map((position, index) => {
                const [timestamp, openPrice, amount, closePrice, type, uid] =
                  position;

                const user = players.find((user) => user.uid === uid);
                const userDisplayName = user ? user.displayName : "Unknown";

                let profit;
                if (type === "long") {
                  closePrice === 0
                    ? (profit = (currentPrice / openPrice) * amount - amount)
                    : (profit = (closePrice / openPrice) * amount - amount);
                } else {
                  closePrice === 0
                    ? (profit = (openPrice / currentPrice) * amount - amount)
                    : (profit = (openPrice / closePrice) * amount - amount);
                }
                const formattedTimestamp =
                  moment(timestamp).format("YYYY-MM-DD HH:mm");
                const formattedOpenPrice = `$${openPrice.toFixed(3)}`;
                const formattedAmount = formatGameCurrency(amount);
                const formattedClosePrice =
                  closePrice === 0 ? "N/A" : `$${closePrice.toFixed(3)}`;
                const formattedProfit = `$${profit.toFixed(3)}`;
                const rowClass = getRowClass(profit);

                return (
                  <tr
                    key={index}
                    className={`hover:bg-gray-200 transition-colors text-xs sm:text-base ${rowClass}`}
                  >
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {userDisplayName}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {formattedTimestamp}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {formattedOpenPrice}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {formattedAmount}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {formattedClosePrice}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center w-1/6">
                      {formattedProfit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionTable;
