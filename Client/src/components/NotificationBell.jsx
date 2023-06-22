import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiOutlineBell } from "react-icons/ai";
import { markNotificationAsSeen } from "../api/notifications";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ uid }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    async function fetchNotifications() {
      const res = await axios.get(`/api/notifications/${uid}`);
      setNotifications(res.data.slice(-5)); // Show only the last 5 notifications
    }
    fetchNotifications();

    // Add the event listener when the component is mounted
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [uid]);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  const unseenNotifications = notifications.filter(
    (notification) => !notification.seen
  );

  const handleNotificationClick = async (notification) => {
    if (await markNotificationAsSeen(notification)) {
      setNotifications((prevNotifications) =>
        prevNotifications.map((prevNotification) =>
          prevNotification._id === notification._id
            ? { ...prevNotification, seen: true }
            : prevNotification
        )
      );
    }
    switch (notification.type) {
      case "welcome":
        navigate("/");
        setDropdownVisible(false);
        break;
      case "friends":
        navigate("/friends");
        setDropdownVisible(false);
        break;
      case "tournaments":
        navigate("/chart");
        setDropdownVisible(false);
        break;
      default:
        // Do nothing
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block mt-2">
      <button
        onClick={() => setDropdownVisible(!dropdownVisible)}
        className="focus:outline-none"
      >
        <AiOutlineBell size={34} className="mr-2 sm:mr-0 text-white" />
        {unseenNotifications.length > 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-center text-xs leading-5">
            {unseenNotifications.length}
          </div>
        )}
      </button>

      {dropdownVisible && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg text-black z-10">
          <div className="py-2 px-4 bg-gray-200 font-semibold">
            Notifications
          </div>
          {[...notifications].reverse().map((notification) => (
            <div
              key={notification._id}
              className={`border-b border-gray-200 py-2 px-4 cursor-pointer ${
                notification.seen ? "bg-blue-100" : "bg-blue-200 font-bold"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
