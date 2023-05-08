import React from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import { GiTrophyCup } from "react-icons/gi";
import { FaChartLine } from "react-icons/fa";
import { BsLightningCharge } from "react-icons/bs";

const Homepage = () => {
  const { user } = useUser();

  return (
    <div className="w-full pt-10 md:pt-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 flex flex-col items-center justify-center overflow-hidden bg-fixed">
      <div className="text-center mb-12 md:mb-24">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-800 mb-8">
          Trading Tournament
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8">
          Outsmart your rivals and showcase your trading skills in Trading
          Tournament!
        </p>
        <Link
          to={user ? "/chart" : "/login"}
          className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-3 px-24 rounded-full text-lg sm:text-xl md:text-2xl"
        >
          Get Started
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="text-center">
          <GiTrophyCup className="text-6xl mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-semibold mb-4">Become a Champion</h2>
          <p className="text-gray-700">
            Conquer the leaderboard and claim your title as the ultimate trading
            champion.
          </p>
        </div>
        <div className="text-center">
          <FaChartLine className="text-6xl mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-semibold mb-4">Master the Market</h2>
          <p className="text-gray-700">
            Learn, practice, and refine your trading strategies in a fun and
            competitive environment.
          </p>
        </div>
        <div className="flex-col justify-center text-center">
          <BsLightningCharge className="text-6xl mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-semibold mb-4">Trade With Speed</h2>
          <p className="text-gray-700">
            Hone your trading instincts and react quickly to the ever-changing
            market conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
