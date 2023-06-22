import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import { MdOutlineDeliveryDining } from "react-icons/md";
import DropDown from "./DropDown";
import NavHeaders from "./NavHeaders";
import NotificationBell from "./NotificationBell";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { GiMonkey } from "react-icons/gi";

const NavBar = () => {
  const { navBarDisplayName, color, userBalance, setUserBalance } =
    useContext(UserContext);
  const { user } = useUser();
  const registeredUserNavLinks = [
    { name: "Shop", path: "/shop" },
    { name: "Tournaments", path: "/chart" },
  ];
  const unRegisteredUserNavLinks = [
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Info", path: "/info" },
  ];
  const registeredDropDownLinks = [
    { name: "My Profile", path: "/profile" },
    { name: "Basic Info", path: "/info" },
    { name: "Friends", path: "/friends" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];
  const unRegisteredDropDownLinks = [];
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    displayColor: "",
  });
  let userColor = color ? color : userDetails ? userDetails.displayColor : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/users/${user.uid}`);
        setUserDetails(response.data);
        setUserBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchData();
  }, [user]);
  let navBarBalance =
    userBalance && userBalance != 0
      ? userBalance
      : userDetails
      ? userDetails.balance
      : "";

  let userDisplay = navBarDisplayName
    ? navBarDisplayName
    : userDetails
    ? userDetails.displayName
    : user
    ? user.displayName || user.email
    : "";
  return (
    <nav className="bg-gradient-to-r from-bg-navbar-gradient-from to-bg-navbar-gradient-to  fixed top-0 w-full">
      <div className="flex justify-between items-center sm:px-4 py-3 md:px-10 md:py-5">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-gray-200 hover:animate-pulse hover:bg-gray-700 hover:text-white sm:px-3 rounded-md text-sm font-medium scale-50 sm:scale-100"
          >
            {/* <img src="Client/public/logo.ico" alt="ICO Image" /> */}
            <GiMonkey size={48} />
          </Link>
          {user && (
            <>
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <h1 className="text-gray-200 hidden xl:block text-xs hover:animate-pulse hover:bg-gray-700 hover:text-white px-1 rounded-md md:text-2xl font-medium">
                    {"Wallet Balance: "}
                  </h1>
                  <h4 className="text-teal-500 px-2 text-s sm:text-2xl">
                    {navBarBalance}
                  </h4>
                  <h4 className=" text-yellow-500 text-s sm:text-2xl">₿</h4>
                  <h4 className="hidden sm:block text-gray-200 text-s  sm:text-2xl">
                    ananas
                  </h4>
                </div>

                <h5
                  className={`sm:hidden text-s sm:text-base text-${userColor} px-3`}
                >
                  {userDisplay}
                </h5>
              </div>
            </>
          )}
        </div>
        <div className="flex">
          {user ? (
            <NavHeaders navBarLinks={registeredUserNavLinks} />
          ) : (
            <NavHeaders navBarLinks={unRegisteredUserNavLinks} />
          )}
          {user ? (
            <>
              <NotificationBell uid={user.uid} />
              <DropDown
                dropDownLinks={registeredDropDownLinks}
                navBarLinks={registeredUserNavLinks}
                user={user}
                userDetails={userDetails}
                userDisplayName={navBarDisplayName}
                color={color}
              />
            </>
          ) : (
            <DropDown
              dropDownLinks={unRegisteredDropDownLinks}
              navBarLinks={unRegisteredUserNavLinks}
              user={user}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
