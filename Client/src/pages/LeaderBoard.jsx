import React, { useEffect, useState } from "react";
import { getUsers } from "../api/users";

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      let usersFromDB = await getUsers();
      setUsers(usersFromDB.sort((a, b) => b.wins - a.wins));
    };
    getItems();
  }, []);

  return (
    <div className="w-full py-8 mx-auto flex justify-center items-center flex-col">
      <h2 className="text-4xl sm:text-5xl font-semibold mb-10 text-center">
        Leaderboard
      </h2>
      <div className="w-full flex justify-center items-center">
        <table className=" w-2/3 text-center content-center ">
          <thead className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-black to-gray-900 text-white">
            <tr>
              <th>Ranking</th>
              <th>User</th>
              <th>Wins</th>
              <th className="hidden md:table-cell">Badges</th>
            </tr>
          </thead>
          <tbody className="text-white bg-gradient-to-r from-gray-900 to-gray-800 ">
            {users.map((user, index) => (
              <tr
                key={index}
                className="border-t border-gray-800 hover:bg-gray-700"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center justify-start">
                    <div className="w-12 mr-2">
                      <img
                        src={`/images/ranks/${user.rank}.png`}
                        alt={`Rank ${user.rank}`}
                        className="w-10 h-10 object-cover"
                      />
                    </div>
                    <div>{user.displayName}</div>
                  </div>
                </td>
                <td className="p-2">{user.wins}</td>
                <td className="hidden md:table-cell p-2">
                  {/* Render the badges here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;
