import { React, useState } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import { GiTrophyCup } from "react-icons/gi";
import { FaChartLine } from "react-icons/fa";
import { BsLightningCharge, BsArrowRightShort } from "react-icons/bs";
import MonkeyWatcher from "../components/MonkeyWatcher";
import _ from "lodash";

const Homepage = () => {
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const updateMouseLocationOnMouseMove = _.debounce((event) => {
    setMouseCoords({
      x: event.clientX,
      y: event.clientY,
    });
  }, 1); // debounce the function to be called not more than once per second
  //homepage
  return (
    <div
      onMouseMove={updateMouseLocationOnMouseMove}
      className=" h-full    bg-bg-main-custom  flex flex-col  bg-fixed"
    >
      <div className="text-center">
        <div className="bg-gradient-to-r from-bg-navbar-gradient-from to-bg-navbar-gradient-to  pt-10 md:pt-32 pb-8 ">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-8">
            Trading Tournament
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 mx-4">
            Outsmart your rivals and showcase your trading skills in Trading
            Tournament!
          </p>
          <MonkeyWatcher mouseCoords={mouseCoords} className="" />
        </div>

        <Link
          to={user ? "/chart" : "/login"}
          className={`bg-teal-600 mt-10 relative z-50 hover:bg-teal-800 w-1/4 text-white font-bold py-3 px-24 rounded-full text-lg sm:text-xl md:text-2xl transition-all duration-300 inline-flex justify-center items-center ${
            isHovered ? "space-x-2" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span
            className={`inline-block mr-1 lg:translate-x-4 transition-transform duration-500 ease-in-out ${
              isHovered ? "transform lg:translate-x-6" : ""
            }`}
          >
            Get Started
          </span>
          <BsArrowRightShort
            size={40}
            className={`hidden lg:inline-block ml-2 mt-1  transition-transform duration-500 ease-in-out ${
              isHovered ? "opacity-100 transform translate-x-2" : "opacity-0"
            }`}
          />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-24">
        <div className="text-center">
          <GiTrophyCup className="text-6xl mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Become a Champion
          </h2>
          <p className="text-white mx-4">
            Conquer the leaderboard and claim your title as the ultimate trading
            champion.
          </p>
        </div>
        <div className="text-center">
          <FaChartLine className="text-6xl mx-auto mb-4 text-teal-400" />
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Master the Market
          </h2>
          <p className="text-white mx-4">
            Learn, practice, and refine your trading strategies in a fun and
            competitive environment.
          </p>
        </div>
        <div className="flex-col justify-center text-center">
          <BsLightningCharge className="text-6xl mx-auto mb-4 text-indigo-300" />
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Trade With Speed
          </h2>
          <p className="text-white mx-4">
            Hone your trading instincts and react quickly to the ever-changing
            market conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
