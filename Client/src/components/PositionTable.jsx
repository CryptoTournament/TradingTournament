import moment from "moment";
import { useState } from "react";
import { FcSearch } from "react-icons/fc";
const PositionTable = ({ positions, currentPrice, players }) => {
  const closedPositions = positions
    .filter(([, , , closePrice]) => closePrice !== 0)
    .reverse();

  const getRowClass = (profit) => {
    if (profit >= 0) {
      return "text-green-500 ";
    } else {
      return "text-red-500";
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
    return (
      closePrice !== 0 && userDisplayName.includes(searchValue.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col items-center w-full mt-8 xl:mt-0 ">
      <div className="flex xl:flex-col">
        <h2 className="text-xl font-bold mb-5 mr-8 xl:mr-0 xl:ml-8 text-teal-200 text-opacity-60">
          Closed Positions
        </h2>
        <div className="flex items-center mb-4">
          <label htmlFor="search" className="mr-2 text-black">
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

      <div className=" rounded-lg shadow-lg  bg-black border-2 border-teal-600 p-2  ">
        <table className="min-w-full bg-opacity-0 ">
          <thead className=" text-teal-600 uppercase bg-black  ">
            <tr>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">Player</th>
              <th className="hidden sm:table-cell py-2 px-2 sm:px-4 w-1/6 text-center">
                Timestamp
              </th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">
                Open Price
              </th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">
                TRADE SIZE
              </th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">ROE</th>
              <th className="py-2 px-2 sm:px-4 w-1/6 text-center">PNL</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-x-auto overflow-y-auto max-h-80 ">
          <table className="min-w-full bg-opacity-0">
            <tbody className="text-gray-700">
              {filteredPositions.slice(0, 10).map((position, index) => {
                const [timestamp, openPrice, amount, closePrice, type, uid] =
                  position;

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

                const formattedTimestamp =
                  moment(timestamp).format("YYYY-MM-DD HH:mm");
                const formattedOpenPrice = `$${openPrice.toFixed(2)}`;

                const formattedProfit = `$${profit.toFixed(2)}`;
                const tradeSize = `$${formatGameCurrency(amount.toFixed(1))}`;
                const formattedPNL = `$${(profit - amount).toFixed(2)}`;
                const formattedROE = `${((profit / amount) * 100 - 100).toFixed(
                  2
                )}%`;
                console.log(formattedPNL);
                const rowClass = getRowClass((profit - amount).toFixed(2));

                return (
                  <tr
                    key={index}
                    className={`hover:bg-teal-900 transition-colors text-xs sm:text-base `}
                  >
                    <td
                      className={
                        type == "long"
                          ? ` bg-green-300 bg-opacity-30 text-gray-100 py-2 px-2 sm:px-4 text-center w-1/6`
                          : "bg-red-300 bg-opacity-30 text-gray-100 py-2 px-2 sm:px-4 text-center w-1/6"
                      }
                    >
                      {`${userDisplayName} (${type})`}
                    </td>
                    <td
                      className={`py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
                    >
                      {formattedTimestamp}
                    </td>
                    <td
                      className={`py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
                    >
                      {formattedOpenPrice}
                    </td>
                    <td
                      className={`py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
                    >
                      {tradeSize}
                    </td>
                    <td
                      className={`py-2 px-4 w-1/6 text-center bg-opacity-40 text-gray-100`}
                    >
                      {formattedROE}
                    </td>
                    <td
                      className={`py-2 px-2 sm:px-4 text-center w-1/6 ${rowClass}`}
                    >
                      {formattedPNL}
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
