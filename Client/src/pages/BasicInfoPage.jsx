import React from "react";
import {
  FaTrophy,
  FaUserCircle,
  FaListOl,
  FaBitcoin,
  FaGift,
} from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";

const BasicInfoPage = () => {
  const ranks = [
    "BronzeOne",
    "BronzeTwo",
    "BronzeThree",
    "BronzeFour",
    "BronzeFive",
    "SilverOne",
    "SilverTwo",
    "SilverThree",
    "SilverFour",
    "SilverFive",
    "GoldOne",
    "GoldTwo",
    "GoldThree",
    "GoldFour",
    "GoldFive",
  ];
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 min-h-screen flex flex-col items-center  text-gray-400 font-sans">
      <h1 className="text-4xl sm:text-5xl font-semibold mb-10 text-center  text-black">
        <FaTrophy className="inline-block mb-2 text-yellow-400 " /> Trading
        Tournament Info
      </h1>

      <div className="w-full max-w-4xl grid gap-8 sm:grid-cols-1 md:grid-cols-2  ">
        <div className="p-6 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex items-start hover:to-gray-900 hover:text-gray-100">
          <FaBitcoin className="text-6xl mb-4 mr-6 text-indigo-600 " />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-indigo-500">
              How It Works
            </h2>
            <ul className="list-disc pl-5 text-sm sm:text-base">
              <li className="mb-2">
                <strong className="text-pink-700">Regular Competitions:</strong>{" "}
                Each focuses on a specific market (e.g., Bitcoin).
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Use Demo Money:</strong>{" "}
                Players use demo money to trade in the competition.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Goal:</strong> Finish the
                competition with the highest balance.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Trade Freely:</strong> Trade
                freely throughout the competition duration.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Winning:</strong> The player
                finishing on top is declared the winner!
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex items-start hover:to-gray-900 hover:text-gray-100">
          <FaListOl className="text-6xl mb-4 mr-6 text-indigo-600  " />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-indigo-600">
              Features
            </h2>
            <ul className="list-disc pl-5 text-sm sm:text-base">
              <li className="mb-2">
                <FaUserCircle className="inline-block mb-1 text-pink-700 mr-1" />
                <strong className="text-pink-700">Login/Register:</strong> Your
                gateway to start trading.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Balance & Ranks:</strong>{" "}
                Check your standing and progress anytime.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Competitions:</strong> Jump in
                and start competing.
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Leaderboard:</strong> See your
                competition. Are you in the lead?
              </li>
              <li className="mb-2">
                <strong className="text-pink-700">Profile Page:</strong> Your
                personal space, manage your details here.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex items-start sm:col-span-2 hover:to-gray-900 hover:text-gray-100">
          <FaGift className="text-6xl mb-4 mr-6 text-indigo-600 " />
          <div>
            <h2 className="text-2xl  font-semibold mb-2 text-indigo-600">
              Prizes
            </h2>
            <p className="text-sm sm:text-base">
              Winners aren't just names on a leaderboard. Top the competition,
              and win exciting prizes. The more skilled your trades, the bigger
              the reward!
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 mt-8 bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-md flex-col items-start sm:col-span-2 hover:to-gray-900 hover:text-gray-100">
        <div className="flex mb-4 mr-6 space-x-5 ">
          <AiFillStar className="text-6xl  text-indigo-600 " />
          <h2 className="text-xl mt-3 sm:text-2xl font-semibold text-indigo-600">
            Ranks
          </h2>
        </div>

        <div className="mt-9">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ranks.map((rank, index) => (
              <li key={index} className="mb-4 text-center">
                <img
                  src={`/images/ranks/${rank}.png`}
                  alt={`Rank ${rank}`}
                  className="w-12 h-12 object-cover mb-2 mx-auto"
                />
                <div>
                  <strong className="text-pink-700">{rank}:</strong>{" "}
                  {index * 10} wins.
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoPage;
