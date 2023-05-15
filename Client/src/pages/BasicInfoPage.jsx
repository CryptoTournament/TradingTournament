import React from "react";
import {
  FaTrophy,
  FaUserCircle,
  FaListOl,
  FaBitcoin,
  FaGift,
} from "react-icons/fa";

const BasicInfoPage = () => {
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 min-h-screen flex flex-col items-center bg-gray-50 text-gray-700 font-sans">
      <h1 className="text-4xl sm:text-5xl font-semibold mb-10 text-center text-indigo-600">
        <FaTrophy className="inline-block mb-2" /> Trading Tournament Info
      </h1>

      <div className="w-full max-w-4xl grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaBitcoin className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              How It Works
            </h2>
            <ul className="list-disc pl-5 text-sm sm:text-base">
              <li className="mb-2">
                <strong>Regular Competitions:</strong> Each focuses on a
                specific market (e.g., Bitcoin).
              </li>
              <li className="mb-2">
                <strong>Use Demo Money:</strong> Players use demo money to trade
                in the competition.
              </li>
              <li className="mb-2">
                <strong>Goal:</strong> Finish the competition with the highest
                balance.
              </li>
              <li className="mb-2">
                <strong>Trade Freely:</strong> Trade freely throughout the
                competition duration.
              </li>
              <li className="mb-2">
                <strong>Winning:</strong> The player finishing on top is
                declared the winner!
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaListOl className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Features</h2>
            <ul className="list-disc pl-5 text-sm sm:text-base">
              <li className="mb-2">
                <FaUserCircle className="inline-block mb-1" />
                <strong>Login/Register:</strong> Your gateway to start trading.
              </li>
              <li className="mb-2">
                <strong>Balance & Ranks:</strong> Check your standing and
                progress anytime.
              </li>
              <li className="mb-2">
                <strong>Competitions:</strong> Jump in and start competing.
              </li>
              <li className="mb-2">
                <strong>Leaderboard:</strong> See your competition. Are you in
                the lead?
              </li>
              <li className="mb-2">
                <strong>Profile Page:</strong> Your personal space, manage your
                details here.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md flex items-start sm:col-span-2">
          <FaGift className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Prizes</h2>
            <p className="text-sm sm:text-base">
              Winners aren't just names on a leaderboard. Top the competition,
              and win exciting prizes. The more skilled your trades, the bigger
              the reward!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoPage;
