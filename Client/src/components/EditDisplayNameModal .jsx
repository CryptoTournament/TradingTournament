import React, { useState, useContext } from "react";
import axios from "axios";
import UserContext from "../contexts/UserContext";
const EditDisplayNameModal = ({
  show,
  onClose,
  userDetails,
  setUserDetails,
  user,
}) => {
  const { setNavBarDisplayName } = useContext(UserContext);

  const [displayName, setDisplayName] = useState(userDetails.displayName);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleSave = async () => {
    // try {
    //   const response = await axios.put(`/api/users/${user.uid}`, {
    //     displayName,
    //   });
    //   setUserDetails({ ...userDetails, displayName });
    //   onClose();
    // } catch (error) {
    //   console.error("Error updating user data", error);
    // }
    if (displayName.length < 4) {
      setErrorMessage("Display name must be at least 4 characters long.");
      return;
    }
    if (displayName.length > 12) {
      setErrorMessage("Display name must be shorter than 12 characters long.");
      return;
    }
    try {
      const response = await axios.get(`/api/displaynames/${displayName}`);
      if (response.data.valid) {
        await axios.put(`/api/displaynames/${user.uid}`, { displayName });
        setUserDetails({ ...userDetails, displayName });
        setNavBarDisplayName(displayName);
        onClose();
      } else {
        setErrorMessage("Display name is already in use.");
      }
    } catch (error) {
      console.error("Error validating display name", error);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white z-20 p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Edit Display Name:</h2>
          <input
            type="text"
            name="displayName"
            value={displayName}
            onChange={handleChange}
            className="bg-gray-100 border-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:bg-white p-2 w-full text-black"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
          {errorMessage && (
            <p className="mt-2 bg-red-100 border border-red-400 text-red-700 mb-4 px-4 py-3 rounded relative select-none hover:bg-red-200 text-center">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
      <div className="fixed inset-0 bg-gray-900 opacity-50" />
    </div>
  );
};

export default EditDisplayNameModal;
