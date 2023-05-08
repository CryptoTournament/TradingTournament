import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";

const Profile = () => {
  const { user } = useUser();

  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    bio: false,
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
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      {userDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(editMode).map((field) => (
            <div key={field} className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  name={field}
                  value={userDetails[field]}
                  onChange={handleChange}
                  className={`bg-gray-100 border-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:bg-white p-2 w-full ${
                    editMode[field] ? "text-black" : "text-gray-700"
                  }`}
                  readOnly={!editMode[field]}
                />
                {editMode[field] ? (
                  <button
                    onClick={() => handleSave(field)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode({ ...editMode, [field]: true })}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
