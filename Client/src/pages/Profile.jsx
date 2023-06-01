import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";
import { FiEdit } from "react-icons/fi";
import EditDisplayNameModal from "../components/EditDisplayNameModal ";

const Profile = () => {
  const { user } = useUser();

  console.log(user);
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    wins: 0,
    gamesPlayed: 0,
    accountType: "Regular",
  });
  const [editMode, setEditMode] = useState({
    displayName: false,
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSave = async (field) => {
    try {
      const response = await axios.put(`/api/users/${user.uid}`, {
        [field]: userDetails[field],
      });
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error updating user data", error);
    }
  };
  console.log("Rank:", userDetails.rank);
  // console.log("Image src:", `/images/ranks/${userDetails.rank}.png`);

  const currentRankIndex = ranks.findIndex((rank) => rank === userDetails.rank);
  const nextRankIndex = currentRankIndex + 1;
  const winsTowardsNextRank = userDetails.wins % 10;
  console.log(winsTowardsNextRank);

  return (
    <div className="container mx-auto mt-8 ">
      <div className="flex flex-col md:flex-row md:justify-between items-center md:space-x-4 mr-6">
        <div className="flex space-x-4">
          {userDetails && userDetails.rank && (
            <img
              src={`/images/ranks/${userDetails.rank}.png`}
              alt={`Rank ${userDetails.rank}`}
              className="hidden ml-6 md:block w-12 h-12 rounded-xl" // Adjust size as needed
            />
          )}
          <div className="flex items-center space-x-2 mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-white">
              {userDetails.displayName || "Profile"}
            </h1>
            <button
              onClick={() => setEditMode({ ...editMode, displayName: true })}
              className="text-white mt-1"
            >
              <FiEdit size={24} />
            </button>
          </div>
        </div>

        <div className="flex mb-4  space-x-4 items-center">
          {ranks && ranks[currentRankIndex] && (
            <img
              src={`/images/ranks/${ranks[currentRankIndex]}.png`}
              alt={`Rank ${ranks[currentRankIndex]}`}
              className="w-12 h-12 rounded-xl" // Adjust size as needed
            />
          )}

          <div className="w-full md:w-1/3 relative pt-1 ">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div
                style={{ width: `${(winsTowardsNextRank / 10) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
              />
            </div>
            <p className="text-center text-sm text-gray-300">
              {10 - winsTowardsNextRank} wins left
            </p>
          </div>
          {ranks && ranks[nextRankIndex] && (
            <img
              src={`/images/ranks/${ranks[nextRankIndex]}.png`}
              alt={`Rank ${ranks[nextRankIndex]}`}
              className="w-12 h-12 rounded-xl " // Adjust size as needed
            />
          )}
        </div>
      </div>

      {editMode.displayName && (
        <EditDisplayNameModal
          show={editMode.displayName}
          onClose={() => setEditMode({ ...editMode, displayName: false })}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          user={user}
        />
      )}
      {userDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-6">
          <div className="p-6 rounded-lg shadow-2xl bg-gradient-to-r from-black to-gray-800">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-white mt-2 mb-4 ">
                {userDetails.displayName || "Profile"}
              </h2>
              {userDetails && userDetails.rank && (
                <img
                  src={`/images/ranks/${userDetails.rank}.png`}
                  alt="Profile"
                  className="w-36 h-36 object-cover mb-4 rounded-full border-4 border-indigo-200 shadow-lg transition-transform duration-500 eas ease-in-out hover:animate-bounce"
                />
              )}
            </div>
          </div>
          <div className="p-6 rounded-lg shadow-2xl bg-gradient-to-r from-black to-gray-800 text-white">
            <div className="flex space-x-3 mb-4 items-center">
              <h2 className="text-3xl font-bold border-b-2 border-indigo-500 inline-block">
                Balance:{" "}
              </h2>
              <p className="text-3xl font-bold">{userDetails.balance || 0}</p>
            </div>
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 inline-block">
              Stats:
            </h2>
            <ul className="list-disc ml-4 text-lg mt-4">
              <li className="mb-2">
                <h2>
                  <span className="text-indigo-500">Account Type:</span>{" "}
                  {userDetails.accountType}
                </h2>
              </li>
              <li className="mb-2">
                <h2>
                  <span className="text-indigo-500">Rank:</span>{" "}
                  {userDetails.rank}
                </h2>
              </li>
              <li className="mb-2">
                <h2>
                  <span className="text-indigo-500">Games Won:</span>
                  {userDetails.wins}
                </h2>
              </li>
              <li className="mb-2">
                <h2>
                  <span className="text-indigo-500">Games Played:</span>{" "}
                  {userDetails.gamesPlayed}
                </h2>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
