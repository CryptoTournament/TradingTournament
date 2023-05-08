import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "./Authenticator";
import useUser from "../hooks/useUser";
import { MdOutlineDeliveryDining } from "react-icons/md";

const handleLogOut = async (navigate) => {
  await logout();
  navigate("/login");
};

const NavBar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const navLinks = [
    { name: "ערים", path: "/cities" },
    { name: "אקסל", path: "/excel" },
    { name: "Chart", path: "/chart" }
    ,
  ];

  return (
    <nav className="bg-gray-800 border-b-4 border-black fixed top-0 w-full">
      <div className="flex justify-between items-center px-4 py-3 md:px-10 md:py-5">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-gray-200 hover:animate-pulse hover:bg-gray-700 hover:text-white px-3 rounded-md text-sm font-medium"
          >
            <MdOutlineDeliveryDining size={48} />
          </Link>
          {user ? (
            <h1 className="text-white font-semibold ml-4">{user.email}</h1>
          ) : (
            ""
          )}
        </div>
        <div className={`md:flex`}>
          {user
            ? navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-200 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
                >
                  {link.name}
                </Link>
              ))
            : ""}

          {user ? (
            <button
              className="text-white pb-4 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
              onClick={() => {
                handleLogOut(navigate);
              }}
            >
              התנתקות
            </button>
          ) : (
            <button
              className="text-white hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
              onClick={() => {
                navigate("/login");
              }}
            >
              התחברות
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
