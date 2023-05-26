import moment from "moment";

const PositionTable = ({ positions, currentPrice }) => {
  const openPositions = positions.filter(
    ([, , , closePrice]) => closePrice === 0
  );
  const closedPositions = positions.filter(
    ([, , , closePrice]) => closePrice !== 0
  );

  const renderTableRow = (position, index) => {
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
      <tr key={index} className="border-b border-gray-200  hover:bg-gray-100">
        <td className="px-4 py-3">
          {moment(timestamp).format("YYYY-MM-DD HH:mm")}
        </td>
        <td className="px-4 py-3">${openPrice.toFixed(10)}</td>
        <td className="px-4 py-3">{amount}</td>
        <td className="px-4 py-3">
          {closePrice === 0 ? "N/A" : `$${closePrice.toFixed(3)}`}
        </td>
        <td className="px-4 py-3">{`$${profit.toFixed(10)}`}</td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-screen  flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full">
          <h2 className="text-xl font-bold mb-5">Closed Positions</h2>
          <div className="shadow-md rounded my-6">
            <table className="min-w-max w-full table-auto">
              <thead>
                <tr className=" text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Timestamp</th>
                  <th className="py-3 px-6 text-left">Open Price</th>
                  <th className="py-3 px-6 text-center">Amount</th>
                  <th className="py-3 px-6 text-center">Close Price</th>
                  <th className="py-3 px-6 text-center">Profit</th>
                </tr>
              </thead>
              <tbody>{closedPositions.map(renderTableRow)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionTable;
