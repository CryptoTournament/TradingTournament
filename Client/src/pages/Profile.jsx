import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";

const Profile = () => {
  const { user } = useUser();

  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
  });
  const [editMode, setEditMode] = useState({
    displayName: false,
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

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-8">PUBG Profile</h1>
      {userDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Display Name:</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                name="displayName"
                value={userDetails.displayName}
                onChange={handleChange}
                className={`bg-gray-100 border-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:bg-white p-2 w-full ${
                  editMode.displayName ? "text-black" : "text-gray-700"
                }`}
                readOnly={!editMode.displayName}
              />
              {editMode.displayName ? (
                <button
                  onClick={() => handleSave("displayName")}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() =>
                    setEditMode({ ...editMode, displayName: true })
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
              )}
            </div>
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="w-full h-48 object-cover mb-4 rounded"
            />
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Balance:</h2>
            <p className="text-lg font-semibold mb-8">{userDetails.balance}</p>
            <h2 className="text-xl font-semibold mb-4">Stats:</h2>
            <ul>
              <li>
                <h2>Level:</h2> {userDetails.level}
              </li>
              <li>
                <h2>Rank:</h2> {userDetails.rank}
              </li>
              <li>
                <h2>Win/Lose Ratio:</h2> {userDetails.winLoseRatio}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
