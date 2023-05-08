import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "./hooks/useUser";

const Profile = () => {
  const { loggedInUser } = useUser();
  const uid = loggedInUser.uid;
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    bio: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/user/${uid}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchData();
  }, [uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = async (field) => {
    try {
      await axios.put(`/api/user/${uid}/${field}`, { [field]: user[field] });
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error updating user data", error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(editMode).map((field) => (
          <div key={field}>
            <h2 className="text-xl font-semibold">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                name={field}
                value={user[field]}
                onChange={handleChange}
                className={`bg-transparent border-none focus:ring-0 ${
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
    </div>
  );
};

export default Profile;
