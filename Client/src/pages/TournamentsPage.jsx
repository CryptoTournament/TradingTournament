import React, { useState, useEffect, useContext } from "react";
import Chart from "./Chart";
import { getTournaments, joinTournament } from "../api/tournaments";
import useUser from "../hooks/useUser";
import { FaPlay, FaUserPlus } from "react-icons/fa";
import { BsPlusCircleDotted } from "react-icons/bs";
import moment from "moment";
import Swal from "sweetalert2";
import { GiTrophy } from "react-icons/gi";
import NewTournamentForm from "../components/NewTournamentForm";
import UserContext from "../contexts/UserContext";
const TournamentsPage = () => {
  const { userBalance, setUserBalance } = useContext(UserContext);

  const { user } = useUser();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // State to control showing the form

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const formatGameCurrency = (value) => {
    // return Math.floor(value).toLocaleString();
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 100000) {
      return (value / 1000).toLocaleString() + "k";
    } else {
      return value.toLocaleString();
    }
  };
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(false);
        const fetchedTournaments = await getTournaments();
        console.log(fetchedTournaments);
        setTournaments(fetchedTournaments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments", error);
      }
    };
    fetchTournaments();
  }, []);

  const handleJoin = async (tournament, uid) => {
    try {
      const newTournament = await joinTournament(tournament.tournament_id, uid);
      console.log(userBalance);
      console.log(tournament.buy_in_cost);
      setUserBalance(userBalance - tournament.buy_in_cost);
      const fetchedTournaments = await getTournaments();
      setTournaments(fetchedTournaments);
      setSelectedTournament(newTournament);
    } catch (error) {
      console.error("Error joining tournament", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data
      ) {
        const errorMessage = error.response.data;
        Swal.fire({
          title: "Notification",
          text: errorMessage,
          icon: "info",
          timer: 15000,
          timerProgressBar: true,
          toast: true,
          position: "center",
          showConfirmButton: true,
          confirmButtonColor: "#1E88E5", // Set the custom color for the OK button
        });
      }
    }
  };

  const handlePlay = (tournament) => {
    setSelectedTournament(tournament);
  };

  const handleNewTournament = () => {
    setShowForm(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter tournaments based on the search term
  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.game_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 min-h-screen min-w-screen flex flex-col items-center text-gray-400 font-sans bg-black ">
      {!selectedTournament && (
        <>
          <h1 className="pt-12 text-4xl sm:text-5xl font-semibold mb-10 text-center text-white">
            Tournaments Page
          </h1>

          <div className="flex  items-center text-center w-full md:w-2/3 2xl:w-1/3 mb-4 space-x-2 py-12 ">
            <button
              className="ml-2  py-2 text-white  mr-2 h-14  w-1/4 bg-teal-600 rounded 2xl:w-1/3"
              onClick={handleNewTournament} // Handle click event of the "New Tournament" button
            >
              <div className="ml-2 flex">
                <BsPlusCircleDotted size={24} className="" />
                <p className="my-auto ml-2 sm:ml-4  translate-x-1">New</p>
                <p className="hidden xl:block my-auto -translate-x-1  sm:ml-4 mr-2">
                  Tournament
                </p>
              </div>
            </button>
            {showForm && user && (
              <NewTournamentForm
                onClose={closeForm}
                uid={user.uid}
                setTournamentsProp={setTournaments}
              />
            )}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tournament name"
              className="px-4 h-14  py-2 rounded-md border border-gray-300  text-center w-3/4 "
            />
          </div>
        </>
      )}

      {selectedTournament ? (
        <div className="mx-4 mt-4 w-screen bg-black">
          <Chart
            tournament={selectedTournament}
            showChart={setSelectedTournament}
          />
        </div>
      ) : (
        <div className="w-full max-w-4xl grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          {filteredTournaments.map((tournament) => {
            const endDate = moment(tournament.end_date);
            const currentTime = moment();
            const timeDiff = endDate.diff(currentTime);
            const duration = moment.duration(timeDiff);

            const daysLeft = Math.floor(duration.asDays()); // total number of complete days
            const hoursLeft = duration.hours(); // the hour part of the duration (0-23)
            const minutesLeft = duration.minutes(); // the minute part of the duration (0-59)

            const totalHoursLeft = daysLeft * 24 + hoursLeft; // total number of hours

            const isUrgent = totalHoursLeft < 24;

            let timeLeftDisplay;
            if (isUrgent) {
              timeLeftDisplay = `${totalHoursLeft} hours ${minutesLeft} minutes`;
            } else {
              timeLeftDisplay = `${daysLeft} days ${hoursLeft} hours`;
            }
            const textColor = isUrgent ? "text-red-500" : "text-gray-500";
            const isJoinDisabled =
              tournament.number_of_players === tournament.max_players;

            return (
              <div
                key={tournament.tournament_id}
                className="p-6 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex items-start hover:to-gray-900 hover:text-gray-100"
              >
                <div className="mr-4 w-2/3">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-teal-500 w-full">
                    {tournament.game_name}
                  </h2>
                  <p className="text-gray-500 mb-2">
                    {`${tournament.number_of_players} / ${tournament.max_players} Players`}
                  </p>
                  <p className={`mb-2 text-gray-500`}>
                    Start Time:{" "}
                    {moment(tournament.start_date).format("YYYY-MM-DD HH:mm")}
                  </p>
                  <p className="text-gray-500 mb-2">
                    Join Price: {`${tournament.buy_in_cost}$`}
                  </p>
                  {isUrgent ? (
                    <p className={`mb-2 ${textColor}`}>
                      {timeLeftDisplay} remaining
                    </p>
                  ) : (
                    <p className={'mb-2 ${textColor}'} >{timeLeftDisplay} remaining</p>
                  )}
                  {tournament.players.some((p) => p.uid === user.uid) ? (
                    <button
                      onClick={() => handlePlay(tournament)}
                      className="px-4 mt-2 py-2 text-white bg-green-500 rounded"
                    >
                      <FaPlay className="inline mr-2" />
                      Play
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(tournament, user.uid)}
                      className={`px-4 mt-4 py-2 text-white rounded ${
                        isJoinDisabled
                          ? "bg-gray-400 cursor-not-allowed"
                          : " bg-indigo-600"
                      }`}
                      disabled={isJoinDisabled}
                    >
                      <FaUserPlus className="inline mr-2" />
                      {isJoinDisabled ? "FULL" : "Join"}
                    </button>
                  )}
                </div>
                <div className="flex flex-col text-center  sm:ml-9 w-1/3 mt-8">
                  <GiTrophy
                    size={50}
                    className="mr-7 mb-3 hover:text-amber-400 text-center w-full"
                  />
                  <ul className="text-gray-500 text-start translate-x-7">
                    <li className="text-amber-400">{`1st: ${formatGameCurrency(
                      tournament.first_place_prize
                    )}$`}</li>
                    <li className="text-white my-2">{`2nd:  ${formatGameCurrency(
                      tournament.second_place_prize
                    )}$`}</li>
                    <li className="text-orange-300">{`3rd:  ${formatGameCurrency(
                      tournament.third_place_prize
                    )}$`}</li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
