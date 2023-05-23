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
      <div className="flex space-x-4">
        <h1 className="text-3xl font-bold mb-8">
          {userDetails.rank || "Rank"}
        </h1>
        <div className="flex items-center space-x-2 mb-8">
          <h1 className="text-3xl font-bold ">
            {userDetails.displayName || "PUBG Profile"}
          </h1>
          <button
            onClick={() => setEditMode({ ...editMode, displayName: true })}
            className="text-black mt-1"
          >
            <FiEdit size={24} />
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded shadow-md">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="w-full h-48 object-cover mb-4 rounded"
            />
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <div className="flex space-x-3 mb-4">
              <h2 className="text-2xl font-bold">Balance: </h2>
              <p className="text-2xl font-bold">{userDetails.balance || 0}</p>
            </div>
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
