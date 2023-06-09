import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getTournaments } from "../api/tournaments";
import UserContext from "../contexts/UserContext";
const NewTournamentForm = ({ onClose, uid, setTournamentsProp }) => {
  const { userBalance, setUserBalance } = useContext(UserContext);

  const [gameName, setGameName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [joinPrice, setJoinPrice] = useState("");
  const [firstPlacePrize, setFirstPlacePrize] = useState("");
  const [secondPlacePrize, setSecondPlacePrize] = useState("");
  const [thirdPlacePrize, setThirdPlacePrize] = useState("");
  const [cost, setCost] = useState(0);

  const [gameNameError, setGameNameError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [maxPlayersError, setMaxPlayersError] = useState("");
  const [joinPriceError, setJoinPriceError] = useState("");
  const [prizeErrors, setPrizeErrors] = useState([]);

  useEffect(() => {
    // Calculate the cost initially and whenever the prize values change
    let newCost;
    if (
      firstPlacePrize == "" ||
      secondPlacePrize == "" ||
      thirdPlacePrize == ""
    ) {
      newCost = 0;
    } else {
      newCost = firstPlacePrize + secondPlacePrize + thirdPlacePrize;
    }
    setCost(newCost);
  }, [firstPlacePrize, secondPlacePrize, thirdPlacePrize]);

  const handleConfirm = async () => {
    setGameNameError("");
    setEndDateError("");
    setMaxPlayersError("");
    setJoinPriceError("");
    setPrizeErrors([]);

    let isValid = true;

    // Validate game name
    if (gameName.trim() === "") {
      setGameNameError("Name is required");
      isValid = false;
    } else if (gameName.length < 3 || gameName.length > 15) {
      setGameNameError("Name must be 3-15 characters");
      isValid = false;
    }

    // Validate end date
    if (endDate.trim() === "") {
      setEndDateError("End date is required");
      isValid = false;
    } else {
      const today = new Date();
      const selectedDate = new Date(endDate);

      if (selectedDate <= today) {
        setEndDateError("End date must be greater than today");
        isValid = false;
      }
    }

    // Validate max players
    if (maxPlayers < 3 || maxPlayers > 50) {
      setMaxPlayersError("Players must be 3-50");
      isValid = false;
    }

    // Validate join price
    if (joinPrice <= 0) {
      setJoinPriceError("Price must be greater than 0");
      isValid = false;
    }

    // Validate prize amounts
    if (
      firstPlacePrize <= 0 ||
      secondPlacePrize <= 0 ||
      thirdPlacePrize <= 0 ||
      firstPlacePrize <= secondPlacePrize ||
      secondPlacePrize <= thirdPlacePrize
    ) {
      const errors = [];

      if (firstPlacePrize <= 0) {
        errors.push("First prize must be greater than 0");
      }

      if (secondPlacePrize <= 0) {
        errors.push("Second prize must be greater than 0");
      }

      if (thirdPlacePrize <= 0) {
        errors.push("Third prize must be greater than 0");
      }

      if (firstPlacePrize <= secondPlacePrize) {
        errors.push("First prize must be greater than second prize");
      }

      if (secondPlacePrize <= thirdPlacePrize) {
        errors.push("Second prize must be greater than third prize");
      }

      setPrizeErrors(errors);
      isValid = false;
    }

    if (isValid) {
      // Valid form, proceed with submission
      let random = Math.floor(Math.random() * 1000000);
      const response = await axios.get(`/api/users/${uid}`);
      // Calculate the cost
      const newCost = firstPlacePrize + secondPlacePrize + thirdPlacePrize;
      setCost(newCost);
      const responsePut = await axios.put(`/api/update_user_balance`, {
        uid: uid,
        cost: newCost,
      });
      // Prepare the data object with form values and uid
      const data = {
        tournament_id: `${random}`,
        game_name: gameName,
        start_date: startDate,
        end_date: endDate,
        max_players: maxPlayers,
        number_of_players: 1,
        buy_in_cost: joinPrice,
        first_place_prize: firstPlacePrize,
        second_place_prize: secondPlacePrize,
        third_place_prize: thirdPlacePrize,
        players: [
          {
            uid,
            game_currency: 1000000,
            displayName: response.data.displayName,
            positions: [],
          },
        ],
      };

      // Send a POST request to the server with the data
      const post = await axios
        .post("/api/newTournament", data)
        .then((response) => {
          // Handle the response from the server if needed

          // After form submission, close the pop-up
          onClose();
        })
        .catch((error) => {
          // Handle any errors that occurred during the request
          console.error(error);
        });
      setUserBalance(userBalance - newCost);

      const fetchTournaments = async () => {
        try {
          const fetchedTournaments = await getTournaments();
          setTournamentsProp(fetchedTournaments);
        } catch (error) {
          console.error("Error fetching tournaments", error);
        }
      };

      fetchTournaments();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 overflow-y-auto  ">
      <div className="max-w-6xl w-11/12 sm:w-1/2 mx-auto bg-white rounded-lg shadow-lg p-6  mt-20 sm:mt-0">
        <div className="flex justify-end">
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            New Tournament Form
          </h2>
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
              {gameNameError && (
                <p className="text-red-500 truncate">{gameNameError}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                End Date and Time
              </label>
              <input
                type="datetime-local" // Change input type to datetime-local
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {endDateError && (
                <p className="text-red-500 truncate">{endDateError}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Max Players
              </label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 0)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {maxPlayersError && (
                <p className="text-red-500 truncate">{maxPlayersError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Join Price
              </label>
              <input
                type="number"
                value={joinPrice}
                onChange={(e) => setJoinPrice(parseInt(e.target.value) || 0)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {joinPriceError && (
                <p className="text-red-500 truncate">{joinPriceError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                First Place Prize
              </label>
              <input
                type="number"
                value={firstPlacePrize}
                onChange={(e) => {
                  setFirstPlacePrize(parseInt(e.target.value) || 0);
                }}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {prizeErrors.includes("First prize must be greater than 0") && (
                <p className="text-red-500 truncate">
                  First prize must be greater than 0
                </p>
              )}
              {prizeErrors.includes(
                "First prize must be greater than second prize"
              ) && (
                <p className="text-red-500 truncate">
                  First prize must be greater than second prize
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Second Place Prize
              </label>
              <input
                type="number"
                value={secondPlacePrize}
                onChange={(e) =>
                  setSecondPlacePrize(parseInt(e.target.value) || 0)
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {prizeErrors.includes("Second prize must be greater than 0") && (
                <p className="text-red-500 truncate">
                  Second prize must be greater than 0
                </p>
              )}
              {prizeErrors.includes(
                "First prize must be greater than second prize"
              ) && (
                <p className="text-red-500 truncate">
                  First prize must be greater than second prize
                </p>
              )}
              {prizeErrors.includes(
                "Second prize must be greater than third prize"
              ) && (
                <p className="text-red-500 truncate">
                  Second prize must be greater than third prize
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Third Place Prize
              </label>
              <input
                type="number"
                value={thirdPlacePrize}
                onChange={(e) =>
                  setThirdPlacePrize(parseInt(e.target.value) || 0)
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {prizeErrors.includes("Third prize must be greater than 0") && (
                <p className="text-red-500 truncate">
                  Third prize must be greater than 0
                </p>
              )}
              {prizeErrors.includes(
                "Second prize must be greater than third prize"
              ) && (
                <p className="text-red-500 truncate">
                  Second prize must be greater than third prize
                </p>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <label className="block text-gray-700 text-xl font-bold mt-5">
                {`Cost: ${cost}$`}
              </label>
            </div>
          </div>
          <div className="mt-8">
            <button
              className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleConfirm}
            >
              Create Tournament
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 transition-colors ml-4"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTournamentForm;
