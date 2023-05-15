import React, { useState } from "react";
import { auth } from "../components/FireBaseAuth";
import { updatePassword } from "firebase/auth";
import { changePassword } from "../components/Authenticator";
import useUser from "../hooks/useUser";
import { login } from "../components/Authenticator";
import {
  FaKey,
  FaBell,
  FaUserCircle,
  FaCreditCard,
  FaUserLock,
  FaUserTimes,
  FaLink,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const SettingsPage = () => {
  const { user } = useUser();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const firebaseUser = auth.currentUser;
    if (firebaseUser && user && user.email) {
      try {
        let response = await login(user.email, currentPassword);
        if (response) {
          if (newPassword.length < 6) {
            setError(true);
            alert("Password should be at least 6 characters long");
          } else if (newPassword !== confirmPassword) {
            setError(true);
            alert("Passwords do not match");
          } else {
            try {
              await changePassword(user, newPassword);
              alert("Password updated successfully");
              setShowPasswordChange(false);
              setNewPassword("");
              setCurrentPassword("");
              setConfirmPassword("");
              setError(false);
            } catch (error) {
              alert(`Failed to update password: ${error.message}`);
            }
          }
        }
      } catch (error) {
        alert(`Failed to authenticate user: ${error.message}`);
      }
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 min-h-screen flex flex-col items-center bg-gray-50 text-gray-700 font-sans">
      <h1 className="text-4xl sm:text-5xl font-semibold mb-10 text-center text-indigo-600">
        <FaUserCircle className="inline-block mb-2" /> User Settings
      </h1>

      <div className="w-full max-w-4xl grid gap-8 sm:grid-cols-1">
        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaKey className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2
              className="text-xl sm:text-2xl font-semibold mb-2 cursor-pointer"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              Change Password for {user && user.email}
            </h2>
            {showPasswordChange && (
              <form onSubmit={handlePasswordChange}>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className={`mt-2 mb-4 px-4 py-2 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-indigo-500`}
                  />
                  <div
                    className="absolute right-4 top-4 cursor-pointer"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className={`mt-2 mb-4 px-4 py-2 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-indigo-500`}
                  />
                  <div
                    className="absolute right-4 top-4 cursor-pointer"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`mt-2 mb-4 px-4 py-2 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:border-indigo-500`}
                  />
                  <div
                    className="absolute right-4 top-4 cursor-pointer"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-400" />
                    )}
                  </div>
                  {/* here */}
                </div>
                <button
                  type="submit"
                  className={`bg-blue-500 text-white rounded px-4 py-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <p className="text-sm sm:text-base">
              Update your password for security reasons.
            </p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaBell className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Notification Preferences
            </h2>
            <p className="text-sm sm:text-base">
              Customize your notification settings for competition updates,
              leaderboard changes, and new competition announcements.
            </p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaLink className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Linked Accounts
            </h2>
            <p className="text-sm sm:text-base">
              Manage your linked accounts (like Google, Facebook, or trading
              accounts).
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaCreditCard className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Payment Methods
            </h2>
            <p className="text-sm sm:text-base">
              Manage your payment methods for any transactions, like competition
              entry fees or prize withdrawals.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaUserTimes className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Delete Account
            </h2>
            <p className="text-sm sm:text-base">Per </p>
            <p className="text-sm sm:text-base">
              Permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md flex items-start">
          <FaUserLock className="text-6xl mb-4 mr-6 text-indigo-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Security Settings
            </h2>
            <p className="text-sm sm:text-base">
              Manage your two-factor authentication settings and view active
              sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
