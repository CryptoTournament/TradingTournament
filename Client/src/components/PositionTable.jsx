import moment from "moment";
import { useState } from "react";
import { FcSearch } from "react-icons/fc";
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
    <div className="flex flex-col items-center w-full mt-8 xl:mt-0 px-4">
      <div className="flex xl:flex-col">
        <h2 className="text-xl font-bold mb-5 mr-8 xl:mr-0 xl:ml-6 text-gray-800">
          Closed Positions
        </h2>
        <div className="flex items-center mb-4">
          <label htmlFor="search" className="mr-2 text-black">
            <FcSearch />
          </label>
          <input
            type="text"
            id="search"
            value={searchValue}
            onChange={handleSearchChange}
            className="px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className=" rounded-lg shadow-lg  ">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-800 uppercase  text-xs sm:text-base">
            <tr>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Player</th>
              <th className="hidden sm:table-cell py-2 px-2 sm:px-4 w-1/6 text-center">
                Timestamp
              </th>
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
        <div className="overflow-x-auto overflow-y-auto max-h-80 ">
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
                    className={`hover:bg-gray-200 transition-colors text-xs sm:text-base `}
                  >
                    <td
                      className={
                        type == "long"
                          ? ` bg-green-300 py-2 px-2 sm:px-4 text-center w-1/6`
                          : "bg-red-300 py-2 px-2 sm:px-4 text-center w-1/6"
                      }
                    >
                      {`${userDisplayName} (${type})`}
                    </td>
                    <td
                      className={`hidden sm:table-cell py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
                      {formattedTimestamp}
                    </td>
                    <td
                      className={`py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
                      {formattedOpenPrice}
                    </td>
                    <td
                      className={`py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
                      {formattedAmount}
                    </td>
                    <td
                      className={`py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
                      {formattedClosePrice}
                    </td>
                    <td
                      className={`py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
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
