import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";
import { MdOutlineDeliveryDining } from "react-icons/md";
import DropDown from "./DropDown";
import NavHeaders from "./NavHeaders";
import NotificationBell from "./NotificationBell";
import axios from "axios";
import UserContext from "../contexts/UserContext";
const NavBar = () => {
  const { navBarDisplayName, color } = useContext(UserContext);
  const { user } = useUser();
  const registeredUserNavLinks = [
    { name: "Shop", path: "/shop" },
    { name: "Chart", path: "/chart" },
  ];
  const unRegisteredUserNavLinks = [
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Shop", path: "/shop" },
  ];
  const registeredDropDownLinks = [
    { name: "My Profile", path: "/profile" },
    { name: "Basic Info", path: "/info" },
    { name: "Friends", path: "/friends" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Settings", path: "/settings" },
  ];
  const unRegisteredDropDownLinks = [{ name: "Settings", path: "/settings" }];
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    displayColor: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/users/${user.uid}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchData();
  }, [user]);

  return (
    <nav className="bg-gradient-to-r from-bg-navbar-gradient-from to-bg-navbar-gradient-to border-b-4 border-black fixed top-0 w-full">
      <div className="flex justify-between items-center px-4 py-3 md:px-10 md:py-5">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-gray-200 hover:animate-pulse hover:bg-gray-700 hover:text-white px-3 rounded-md text-sm font-medium "
          >
            <MdOutlineDeliveryDining size={48} />
          </Link>
          <h1 className="text-gray-200 hover:animate-pulse hover:bg-gray-700 hover:text-white px-3 rounded-md text-2xl font-medium">
            {"Balance: " + userDetails.balance}
          </h1>
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
