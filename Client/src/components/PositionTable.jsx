import moment from "moment";

const PositionTable = ({ positions, currentPrice }) => {
  const closedPositions = positions
    .filter(([, , , closePrice]) => closePrice !== 0)
    .reverse(); // Reverse the array to display newest positions at the top

  const getRowClass = (profit) => {
    if (profit >= 0) {
      return "bg-green-200";
    } else {
      return "bg-red-200";
    }
  };

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
      <h2 className="text-xl font-bold mb-5">Closed Positions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-100 text-gray-800 uppercase">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Open Price</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Close Price</th>
              <th className="py-3 px-4">Profit</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {closedPositions.map((position, index) => {
              const [timestamp, openPrice, amount, closePrice, type] = position;
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
                  className={`hover:bg-gray-200 transition-colors ${rowClass}`}
                >
                  <td className="py-3 px-4">{formattedTimestamp}</td>
                  <td className="py-3 px-4">{formattedOpenPrice}</td>
                  <td className="py-3 px-4">{formattedAmount}</td>
                  <td className="py-3 px-4">{formattedClosePrice}</td>
                  <td className="py-3 px-4">{formattedProfit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionTable;
