import moment from "moment";

const PositionTable = ({ positions, currentPrice }) => {
  const openPositions = positions.filter(([, , , closePrice]) => closePrice === 0);

  const renderPosition = (position, index) => {
    const [timestamp, openPrice, amount, closePrice, type] = position;
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
    const formattedClosePrice = closePrice === 0 ? "N/A" : `$${closePrice.toFixed(3)}`;
    const formattedProfit = `$${profit.toFixed(2)}`;
    const formattedPNL = `$${(profit - amount).toFixed(2)}`;
    const formattedROE = `${((profit / amount) * 100 - 100).toFixed(2)}%`;

    const profitColor = profit - amount >= 0 ? "text-green-600" : "text-red-600";

    return (
        <div>

<h2 className="text-xl font-bold mb-8 text-center text-gray-800">Open Position</h2>

      <div
        key={index}
        className="bg-transparent p-6 mb-6 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
      >
        <p className="text-sm text-gray-600 absolute top-2 right-2">{formattedTimestamp}</p>

        <div className="flex flex-col items-start">
          <div>
            <p className={`${profitColor} font-bold text-2xl text-center`}>{formattedPNL}</p>
          </div>
          <div className="flex items-start justify-between w-full">
            <div>
              <p className="text-gray-600 text-sm text-center">{`Entry Price`}</p>
              <p className="text-gray-600 text-center">{`${formattedOpenPrice}`}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm text-center">{`Position Size`}</p>
              <p className="text-gray-600 text-center">{`${formattedProfit}`}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm text-center">{`ROE`}</p>
              <p className="text-gray-600 text-center">{`${formattedROE}`}</p>
            </div>
          </div>
        </div>
      </div>
      </div>

    );
  };

  const renderedPositions = openPositions.map(renderPosition);

  return (
    <div className="min-h-screen flex items-start justify-center bg-transparent">
      <div className="w-full max-w-3xl">
        {renderedPositions}
      </div>
    </div>
  );
};

export default PositionTable;
