import React from "react";
import { Link } from "react-router-dom";
import Chart from "./Chart";
import { useState } from "react";
const TournamentsPage = () => {
  const [showTournaments, setShowTournament] = useState(false);
  const handleShowTournament = () => {
    setShowTournament(true);
  };
  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center ">
      Tournaments Page
      <button onClick={handleShowTournament} className="bg-pink-600">
        Tournament One
      </button>
      <button onClick={handleShowTournament} className="bg-pink-600">
        Tournament Two
      </button>
      <button onClick={handleShowTournament} className="bg-pink-600">
        Tournament Three
      </button>
      <div className="w-1/2">{showTournaments ? <Chart /> : ""}</div>{" "}
      {/* Modify the width here */}
    </div>
  );
};

export default TournamentsPage;
