import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";

const Friends = () => {









  const { user } = useUser();
  const [userAuth, setUserAuth] = useState(""); // Initialize with null instead of undefined
  console.log("userAuthId", user && userAuth.uid);
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userWaitingList, setUserWaitingList] = useState([]);

  useEffect(() => {
    // Perform any code that relies on the updated `user` value here
    // For example, you can fetch user data or update the user list
    fetchUserWaitingList();
    if(user && user.uid){
    fetchUserData(user.uid)
    }
  }, [user]);


  const handleButtonClick = async (username) => {
    try {
      // Send a POST request to the server with the username/nickname
      console.log("userAuthId", userAuth.uid);
      const response = await axios.post("/api/add_friend", { nickname: username, uid: user.uid });

      // Handle the response from the server
      console.log(response.data); // You can handle the response data as needed
      fetchUserWaitingList();
      fetchUserData(user.uid)
    } catch (error) {
      console.error("Error adding friend", error);
    }
  };
  useEffect(() => {
    if (user) {
      setUserAuth(user); // Update userAuth once user is available
    }
  }, [user]);

  const handleDenyButton = async (username) => {
    try {
      console.log(username, user.uid); // You can handle the response data as needed

      const response = await axios.post("/api/deny_friend", { nickname: username, uid: user.uid })
      fetchUserWaitingList();
    } catch (error) {
      console.error("Error deny friend", error);
    }
  };



  const handleApproveButton = async (username) => {
    try {
      console.log(username, user.uid); // You can handle the response data as needed

      const response = await axios.post("/api/approve_friend", { nickname: username, uid: user.uid })
      fetchUserWaitingList();
    } catch (error) {
      console.error("Error approving friend", error);
    }
  };




  const fetchUserWaitingList = async () => {
    try {
      if (user && user.uid){
        console.log("H!")
      const response = await axios.get(`/api/get_waiting_list?uid=${user.uid}`);
      const data = response.data;
      setUserWaitingList(data.nicknames);
      //console.log(userWaitingList)
      }
    } catch (error) {
      console.error("Error fetching user waiting list", error);
    }
  };



  const fetchUserData = async (uid) => {
    try {
      const response = await axios.get("/api/get_all_users", {
        params: { uid }
      });
      const data = response.data;
  
      setUserList(data);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };
  
  useEffect(() => {
    if(user && user.uid){

      fetchUserData(user.uid);
    }
    fetchUserWaitingList();

  }, []);

  const filteredUserList = userList.filter(
    (user) =>
      userAuth.uid !== user.uid &&
      user &&
      user.nick_name &&
      user.nick_name.toLowerCase().includes(searchQuery.toLowerCase())
      
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">User List</h1>
      <input
        type="text"
        placeholder="Search by name"
        className="px-4 py-2 mb-6 rounded border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <table className="w-full max-w-md bg-white border border-gray-300 rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center">Username</th>
              <th className="py-2 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserList.map((user, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b text-center">{user.nick_name}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleButtonClick(user.nick_name)}
                    className="bg-orange-600 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded-full">
                    Add Friend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full max-w-md bg-white border border-gray-300 rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center">Username</th>
              <th className="py-2 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Fake data for the new table */}
            {/* Fake data for the new table */}
            {userWaitingList.map((nick_name, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b text-center">{nick_name}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick = {() => handleApproveButton(nick_name)}>
                    Approve
                  </button>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick = {() => handleDenyButton(nick_name)}>
                    Deny
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Friends;
