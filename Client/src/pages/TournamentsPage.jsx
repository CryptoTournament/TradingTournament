import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Chart from "./Chart";
import { getTournaments, joinTournament } from "../api/tournaments";
import useUser from "../hooks/useUser";
import { FaPlay, FaUserPlus } from "react-icons/fa";
import moment from "moment";

const TournamentsPage = () => {
  const { user } = useUser();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);






  useEffect(() => {
    const fetchTournaments = async () => {
      try {
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
      const fetchedTournaments = await getTournaments();
      setTournaments(fetchedTournaments);
      setSelectedTournament(newTournament);
    } catch (error) {
      console.error("Error joining tournament", error);
    }
  };

  const handlePlay = (tournament) => {
    setSelectedTournament(tournament);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 min-h-screen min-w-screen flex flex-col items-center text-gray-400 font-sans">
      {!selectedTournament && (
        <h1 className="text-4xl sm:text-5xl font-semibold mb-10 text-center text-black">
          Tournaments Page
        </h1>
      )}
      {selectedTournament ? (
        <div className="mx-4 mt-4 w-screen ">
          <Chart
            tournament={selectedTournament}
            showChart={setSelectedTournament}
          />
        </div>
      ) : (
        <div className="w-full max-w-4xl grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          {tournaments.map((tournament) => {
            const timeLeft = moment(tournament.end_date).diff(
              moment(),
              "hours"
            );
            const isUrgent = timeLeft < 24;
            const timeLeftDisplay = isUrgent
              ? `${timeLeft} hours`
              : moment.duration(timeLeft, "hours").humanize();
            const textColor = isUrgent ? "text-red-500" : "text-gray-500";

            return (
              <div
                key={tournament.tournament_id}
                className="p-6 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex items-start hover:to-gray-900 hover:text-gray-100"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-indigo-500">
                    {tournament.game_name}
                  </h2>
                  <p className="text-gray-500 mb-2">
                    {tournament.number_of_players} / {tournament.max_players}
                  </p>
                  <p className={`mb-2 text-gray-500`}>
                    Start Time:{" "}
                    {moment(tournament.start_date).format("YYYY-MM-DD HH:mm")}
                  </p>
                  {isUrgent ? (
                    <p className={`mb-2 ${textColor}`}>
                      {timeLeftDisplay} remaining
                    </p>
                  ) : (
                    <p className={textColor}>{timeLeftDisplay} remaining</p>
                  )}
                  {tournament.players.some((p) => p.uid === user.uid) ? (
                    <button
                      onClick={() => handlePlay(tournament)}
                      className="px-4 py-2 text-white bg-green-600 rounded"
                    >
                      <FaPlay className="inline mr-2" />
                      Play
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(tournament, user.uid)}
                      className="px-4 py-2 text-white bg-blue-600 rounded"
                    >
                      <FaUserPlus className="inline mr-2" />
                      Join
                    </button>
                  )}
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
