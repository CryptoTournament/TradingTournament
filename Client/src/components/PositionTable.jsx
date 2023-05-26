import moment from "moment";

const PositionTable = ({ positions, currentPrice }) => {
  const closedPositions = positions.filter(
    ([, , , closePrice]) => closePrice !== 0
  );

  const renderCard = (position, index) => {
    const [timestamp, openPrice, amount, closePrice, type] = position;
    let profit;
    if (type == "long") {
      closePrice == 0
        ? (profit = (currentPrice / openPrice) * amount.toFixed(3))
        : (profit = (closePrice / openPrice) * amount.toFixed(3));
    } else {
      closePrice == 0
        ? (profit = (openPrice / currentPrice) * amount.toFixed(3))
        : (profit = (openPrice / closePrice) * amount.toFixed(3));
    }

    return (
      <div
        key={index}
        className="flex flex-col bg-white shadow-md rounded p-6 m-2 w-64"
      >
        <div className="mb-2">
          <div className="text-sm text-gray-600">Timestamp</div>
          <div>{moment(timestamp).format("YYYY-MM-DD HH:mm")}</div>
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600">Open Price</div>
          <div>${openPrice.toFixed(10)}</div>
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600">Amount</div>
          <div>{amount}</div>
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600">Close Price</div>
          <div>{closePrice === 0 ? "N/A" : `$${closePrice.toFixed(3)}`}</div>
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600">Profit</div>
          <div>{`$${profit.toFixed(10)}`}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center">
      <h2 className="text-xl font-bold mb-5 w-full text-center">
        Closed Positions
      </h2>
      {closedPositions.map(renderCard)}
    </div>
  );
};

export default PositionTable;
