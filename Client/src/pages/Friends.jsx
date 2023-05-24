import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";
import { addNotification } from "../api/notifications";

const Friends = () => {
  const { user } = useUser();
  const [userAuth, setUserAuth] = useState("");
  const [nonFriendsUserList, setNonFriendsUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userWaitingList, setUserWaitingList] = useState([]);
  const [userFriendsList, setUserFriendsList] = useState([]);
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    wins: 0,
    gamesPlayed: 0,
    gameTokens: 0,
    accountType: "Regular",
  });

  useEffect(() => {
    fetchUserWaitingList();
    fetchFriends();
    if (user && user.uid) {
      getNonFriendsList(user.uid);
    }
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

  const getUserByDisplayName = async (displayName) => {
    try {
      if (displayName) {
        const response = await axios.get(
          `/api/getUserByDisplayName?displayName=${displayName}`
        );
        const data = response.data;
        console.log("fetch user1");
        console.log(data);
        console.log(data.uid);
        console.log("fetch user2");

        return data;
      }
    } catch (error) {
      console.error("Error fetching user waiting list", error);
    }
  };

  const addFriendClicked = async (username) => {
    try {
      const response = await axios.post("/api/add_friend", {
        nickname: username,
        uid: user.uid,
      });
      console.log(response.data);
      fetchUserWaitingList();
      getNonFriendsList(user.uid);
      let userToNotify = await getUserByDisplayName(username);
      console.log(userToNotify);
      addNotification(
        userToNotify.uid,
        `${userDetails.displayName} sent you a friend request!`,
        "friends"
      );
    } catch (error) {
      console.error("Error adding friend", error);
    }
  };

  useEffect(() => {
    if (user) {
      setUserAuth(user);
    }
  }, [user]);

  const handleDenyButton = async (username) => {
    try {
      const response = await axios.post("/api/deny_friend", {
        nickname: username,
        uid: user.uid,
      });
      fetchUserWaitingList();
    } catch (error) {
      console.error("Error denying friend", error);
    }
  };

  const handleApproveButton = async (username) => {
    try {
      const response = await axios.post("/api/approve_friend", {
        nickname: username,
        uid: user.uid,
      });
      fetchUserWaitingList();
      let userToNotify = await getUserByDisplayName(username);
      setUserFriendsList((userFriendsList) => [
        ...userFriendsList,
        userToNotify,
      ]);
      setNonFriendsUserList(
        nonFriendsUserList.filter(
          (item) => item.displayName !== userToNotify.displayName
        )
      );
      addNotification(
        userToNotify.uid,
        `${userDetails.displayName} Approved your friend request!`,
        "friends"
      );
    } catch (error) {
      console.error("Error approving friend", error);
    }
  };

  const fetchFriends = async () => {
    console.log("fetching friends");
    try {
      if (user && user.uid) {
        const response = await axios.get(`/api/getFriends?uid=${user.uid}`);
        const data = response.data;
        console.log(data);
        setUserFriendsList(data.friends);
      }
    } catch (error) {
      console.error("Error fetching user waiting list", error);
    }
  };
  const fetchUserWaitingList = async () => {
    try {
      if (user && user.uid) {
        const response = await axios.get(
          `/api/get_waiting_list?uid=${user.uid}`
        );
        const data = response.data;
        setUserWaitingList(data.nicknames);
        // const updatedNonFriendsList = nonFriendsUserList.filter(
        //   (nonFriend) => !data.nicknames.includes(nonFriend.displayName)
        // );

        // setNonFriendsUserList(updatedNonFriendsList);
      }
    } catch (error) {
      console.error("Error fetching user waiting list", error);
    }
  };

  const getNonFriendsList = async (uid) => {
    //getting a list of all users that arent friend of the given user with uid.
    try {
      const response = await axios.get("/api/getNonFriends", {
        params: { uid },
      });
      const data = response.data;
      setNonFriendsUserList(data);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      getNonFriendsList(user.uid);
    }
    fetchUserWaitingList();
  }, []);

  const filteredNonFriendsUserList = nonFriendsUserList.filter(
    (user) =>
      userAuth.uid !== user.uid &&
      user &&
      user.displayName &&
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center mt-8 mx-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-7xl">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-4">Friends</h2>

          <div className="bg-gradient-to-r from-black to-gray-800 shadow-lg rounded-lg p-6">
            <table className="table-fixed w-full">
              <thead className="text-white">
                <tr className="border-b-4 border-gray-500">
                  <th className="w-1/4 py-2 text-center">Rank</th>
                  <th className="w-1/4 text-center">Username</th>
                  <th className="w-1/4 text-center">Win Ratio</th>
                  <th className="w-1/4 text-center">Balance</th>
                </tr>
              </thead>
              <tbody>
                {userFriendsList &&
                  userFriendsList.map((user, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-500 text-white "
                    >
                      <td className="py-2 text-center">
                        {
                          <img
                            src={`/images/ranks/${user.rank}.png`}
                            alt="Profile"
                            className="w-10 h-10 object-cover mb-4 rounded-full mx-auto mt-4 shadow-lg "
                          />
                        }
                      </td>
                      <td className="text-center">{user.displayName}</td>
                      <td className="text-center">
                        {user.gamesPlayed === 0
                          ? 0
                          : (user.wins / user.gamesPlayed).toFixed(2)}
                      </td>
                      <td className="text-center">{user.balance}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-4">Add new friend</h2>
            <input
              type="text"
              placeholder="Search by name"
              className="px-4 py-2 mb-6 rounded border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full max-w-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="bg-gradient-to-r from-black to-gray-800 shadow-lg rounded-lg p-6">
              {filteredNonFriendsUserList.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-500 py-4 text-white"
                >
                  <p>{user.displayName}</p>
                  <button
                    onClick={() => addFriendClicked(user.displayName)}
                    className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Friend requests</h2>
            <div className="bg-gradient-to-r from-black to-gray-800 shadow-lg rounded-lg p-6">
              {userWaitingList.map((displayName, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-500 py-4 text-white"
                >
                  <p>{displayName}</p>
                  <div>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                      onClick={() => handleApproveButton(displayName)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleDenyButton(displayName)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
//

export default Friends;
