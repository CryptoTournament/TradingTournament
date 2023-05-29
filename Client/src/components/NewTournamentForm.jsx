import React, { useState } from "react";

const NewTournamentForm = ({ onClose }) => {
  const [gameName, setGameName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [joinPrice, setJoinPrice] = useState(0);
  const [firstPlacePrize, setFirstPlacePrize] = useState(0);
  const [secondPlacePrize, setSecondPlacePrize] = useState(0);
  const [thirdPlacePrize, setThirdPlacePrize] = useState(0);

  const handleConfirm = () => {
    // Handle the form submission here, e.g., send data to backend

    // After form submission, close the pop-up
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-end">
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">New Tournament Form</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-700 font-medium">
                Game Name
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Max Players
              </label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Join Price
              </label>
              <input
                type="number"
                value={joinPrice}
                onChange={(e) => setJoinPrice(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                First Place Prize
              </label>
              <input
                type="number"
                value={firstPlacePrize}
                onChange={(e) =>
                  setFirstPlacePrize(parseInt(e.target.value))
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Second Place Prize
              </label>
              <input
                type="number"
                value={secondPlacePrize}
                onChange={(e) =>
                  setSecondPlacePrize(parseInt(e.target.value))
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Third Place Prize
              </label>
              <input
                type="number"
                value={thirdPlacePrize}
                onChange={(e) => setThirdPlacePrize(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTournamentForm;
