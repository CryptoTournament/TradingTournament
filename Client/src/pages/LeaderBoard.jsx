import React, { useEffect, useState } from "react";
import { getUsers } from "../api/users";

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getItems = async () => {
      let usersFromDB = await getUsers();
      setUsers(usersFromDB.sort((a, b) => b.wins - a.wins));
    };
    getItems();
  }, []);

  return (
    <div className="w-full py-8 mx-auto flex justify-center items-center flex-col">
      <h2 className="text-4xl sm:text-5xl font-semibold mb-10 text-center text-white">
        Leaderboard
      </h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name"
        className="my-4 p-2 rounded-md text-black text-center"
      />
      <div className="w-full flex justify-center items-center">
        <div className="h-1/2 overflow-y-auto w-2/3">
          <table className=" text-center content-center w-full">
            <thead className="text-lg  sm:text-xl font-semibold bg-gradient-to-r  from-black to-gray-900 text-white">
              <tr className="">
                <th className="py-4 w-1/3">Ranking</th>
                <th className="py-4 w-1/3">User</th>
                <th className="py-4 w-1/3">Wins</th>
              </tr>
            </thead>{" "}
            <tbody className="text-white bg-gradient-to-r from-gray-900 to-gray-800 ">
              {users
                .filter((user) =>
                  user.displayName.toLowerCase().includes(search.toLowerCase())
                )
                .map((user, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-800 hover:bg-gray-700 "
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <div className="flex text-center  items-center justify-start">
                        <div className="w-12 mr-2">
                          <img
                            src={`/images/ranks/${user.rank}.png`}
                            alt={`Rank ${user.rank}`}
                            className="w-10 h-10 object-cover"
                          />
                        </div>
                        <div
                          className={user ? ` text-${user.displayColor}` : ""}
                        >
                          {user.displayName}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{user.wins}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
