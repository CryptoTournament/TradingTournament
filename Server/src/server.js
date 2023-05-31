import express from "express";
import dotenv from "dotenv";
import { db, connectToDb } from "./db.js";
import { fetchSymbolData, fetchKlineData } from "./market_data_handler.js";
import { ObjectId } from "mongodb";
import { server as WebSocketServer } from "websocket";
import http from "http";
import cron from "node-cron";
import moment from "moment";
dotenv.config();

const app = express();

app.use(express.json()); // Enable JSON parsing for request bodies

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.post("/api/users/signUp", async (req, res) => {
  const { uid } = req.body;
  let random = Math.floor(Math.random() * 1000000);
  const status = await db.collection("users").insertOne({
    uid: uid,
    approve_waiting_list: [],
    friends: [],
    displayName: `Player ${random}`,
    rank: "BronzeOne",
    balance: 1000,
    wins: 0,
    gamesPlayed: 0,
    gameTokens: 200,
    accountType: "Regular",
    displayColor: "gray-50",
  });
});

const getUsersFromMongoDB = async () => {
  try {
    const users = await db.collection("users").find().toArray();
    return users;
  } catch (error) {
    console.error("Error fetching user collection", error);
    throw error;
  }
};

//get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsersFromMongoDB();
    if (users.length === 0) {
      res.status(404).send("No users found");
    } else {
      res.json(users);
    }
  } catch (error) {
    console.error("Error fetching users data", error);
    res.status(500).send("Server error");
  }
});

//get a user by his id
app.get("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await db.collection("users").findOne({ uid });
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    const result = await db
      .collection("users")
      .updateOne({ uid }, { $set: updateData }, { upsert: true });
    res.json({ message: "User data updated", result });
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).send("Server error");
  }
});

// connecting to db and then connecting to express server.
connectToDb(() => {
  app.listen(process.env.PORT || 3000, () => {
    runWebSocket();
    console.log("Server is listening on Port 3000");
    console.log("MongoDB is Online");
  });
});

// app.get("/api/getNonFriends", async (req, res) => {
//   try {
//     const users = await getUsersFromMongoDB();
//     res.json(users);
//   } catch (error) {
//     console.error("Error fetching user collection", error);
//     res.status(500).send("Server error");
//   }
// });

app.get("/api/getUserByDisplayName", async (req, res) => {
  try {
    const { displayName } = req.query;
    const my_user = await db
      .collection("users")
      .findOne({ displayName: displayName });
    res.json(my_user);
  } catch (error) {
    console.error("Error fetching user collection", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/getNonFriends", async (req, res) => {
  try {
    const { uid } = req.query;
    const my_user = await db.collection("users").findOne({ uid: uid });

    const users = await getUsersFromMongoDB();
    // Filter out users who are in the given UID's friends list
    const filteredUsers = users.filter((user) => {
      return (
        !user.friends.includes(uid) &&
        user.uid !== uid &&
        !user.approve_waiting_list.includes(uid) &&
        !my_user.friends.includes(user.uid) &&
        !my_user.approve_waiting_list.includes(user.uid)
      );
    });
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching user collection", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/getPendingFriends", async (req, res) => {
  try {
    const { uid } = req.query;
    const my_user = await db.collection("users").findOne({ uid: uid });

    const users = await getUsersFromMongoDB();
    let display_names = [];
    for (const user of users) {
      if (user.approve_waiting_list.includes(uid)) {
        display_names.push(user.displayName);
      }
    }
    res.json(display_names);
  } catch (error) {
    console.error("Error fetching user collection", error);
    res.status(500).send("Server error");
  }
});

app.post("/api/add_friend", async (req, res) => {
  try {
    const { nickname, uid } = req.body;
    // Find the user in the database based on uid
    const user = await db
      .collection("users")
      .findOne({ displayName: nickname });
    if (user) {
      // Update the user's approve_waiting_list with the nickname
      await db
        .collection("users")
        .updateOne(
          { displayName: nickname },
          { $push: { approve_waiting_list: uid } }
        );

      res.json({ message: "Friend added successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error adding friend", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/getFriends", async (req, res) => {
  try {
    const { uid } = req.query;

    // Find the user with the given UID
    const user = await db.collection("users").findOne({ uid });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const friendsList = user.friends || [];
    const friends = [];
    // Fetch the names for the UIDs of my friends
    for (const user_id of friendsList) {
      const friendData = await db.collection("users").findOne({ uid: user_id });

      if (friendData) {
        friends.push(friendData);
      }
    }
    res.json({ friends });
  } catch (error) {
    console.error(
      "Error fetching friendNames from waiting approval list",
      error
    );
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/get_waiting_list", async (req, res) => {
  try {
    const { uid } = req.query;

    // Find the user with the given UID
    const user = await db.collection("users").findOne({ uid });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const approveWaitingList = user.approve_waiting_list || [];
    const nicknames = [];
    // Fetch the nicknames for the UIDs in the approve_waiting_list
    for (const user_id of approveWaitingList) {
      const userWithNickname = await db
        .collection("users")
        .findOne({ uid: user_id });

      if (userWithNickname && userWithNickname.displayName) {
        nicknames.push(userWithNickname.displayName);
      }
    }
    res.json({ nicknames });
  } catch (error) {
    console.error("Error fetching nicknames from waiting approval list", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/approve_friend", async (req, res) => {
  try {
    const { nickname, uid } = req.body;

    // Find the user with the given nickname
    const user = await db.collection("users").findOne({ uid });
    const friend_user = await db
      .collection("users")
      .findOne({ displayName: nickname });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the given UID from the user's approve_waiting_list
    const updatedWaitingList = user.approve_waiting_list.filter(
      (id) => id !== friend_user.uid
    );

    // Add the given UID to the user's friends list
    user.friends.push(friend_user.uid);
    const friendUpdatedWaitingList = friend_user.approve_waiting_list.filter(
      (id) => id !== user.uid
    );

    friend_user.friends.push(user.uid);
    // Update the user's approve_waiting_list and friends list in the database
    await db.collection("users").updateOne(
      { uid: friend_user.uid },
      {
        $set: {
          approve_waiting_list: friendUpdatedWaitingList,
          friends: friend_user.friends,
        },
      }
    );

    // Update the user's approve_waiting_list and friends list in the database
    await db.collection("users").updateOne(
      { uid: user.uid },
      {
        $set: {
          approve_waiting_list: updatedWaitingList,
          friends: user.friends,
        },
      }
    );

    // Fetch the nicknames of the updated approve_waiting_list
    const nicknames = [];

    for (const id of updatedWaitingList) {
      const userWithNickname = await db
        .collection("users")
        .findOne({ uid: id });

      if (userWithNickname && userWithNickname.displayName) {
        nicknames.push(userWithNickname.displayName);
      }
    }

    res.json({ nicknames });
  } catch (error) {
    console.error("Error updating user's waiting approval list", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/deny_friend", async (req, res) => {
  try {
    const { nickname, uid } = req.body;

    // Find the user with the given nickname
    const user = await db
      .collection("users")
      .findOne({ displayName: nickname });

    const my_user = await db.collection("users").findOne({ uid: uid });

    if (!user || !my_user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the given UID from the user's approve_waiting_list
    const updatedWaitingList = user.approve_waiting_list.filter(
      (id) => id === uid
    );

    // Update the user's approve_waiting_list in the database
    await db
      .collection("users")
      .updateOne(
        { uid: user.uid },
        { $set: { approve_waiting_list: updatedWaitingList } }
      );

    const updatedWaitingListForMyUser = my_user.approve_waiting_list.filter(
      (id) => id === user.id
    );

    // Update the user's approve_waiting_list in the database
    await db
      .collection("users")
      .updateOne(
        { uid: my_user.uid },
        { $set: { approve_waiting_list: updatedWaitingListForMyUser } }
      );
    // Fetch the nicknames of the updated approve_waiting_list
    const nicknames = [];

    for (const id of updatedWaitingList) {
      const userWithNickname = await db
        .collection("users")
        .findOne({ uid: id });

      if (userWithNickname && userWithNickname.displayName) {
        nicknames.push(userWithNickname.displayName);
      }
    }

    res.json({ nicknames });
  } catch (error) {
    console.error("Error updating user's waiting approval list", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/update_user_balance", async (req, res) => {
  try {
    const { uid, cost } = req.body;

    // Find the user with the given UID
    const user = await db.collection("users").findOne({ uid });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.balance < cost) {
      res.status(404).json({
        message: `Not enough money, you missing ${cost - user.balance}$`,
      });
      return;
    }
    await db
      .collection("users")
      .updateOne({ uid: user.uid }, { $set: { balance: user.balance - cost } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error update user balance", error);
    res.status(500).json({ message: "Server error" });
  }
});

// // Create a new notification
app.post("/api/notifications", async (req, res) => {
  const { uid, message, type } = req.body;
  const status = await db.collection("notifications").insertOne({
    uid: uid,
    message: message,
    type: type,
    seen: false,
    date: new Date(),
  });
  res.status(201).send(status);
});

// Get notifications for a user
app.get("/api/notifications/:uid", async (req, res) => {
  const notifications = await db
    .collection("notifications")
    .find({ uid: req.params.uid })
    .toArray();
  res.send(notifications);
});

// Delete a notification
app.delete("/api/notifications/:id", async (req, res) => {
  const status = await db
    .collection("notifications")
    .deleteOne({ _id: req.params.id });
  res.status(204).send(status);
});

// Mark a notification as read
app.patch("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = new ObjectId(id);

    const status = await db
      .collection("notifications")
      .updateOne({ _id: notificationId }, { $set: { seen: true } });

    res.send(status);
  } catch (error) {
    // Handle the error appropriately
    console.error("Error marking notification as read:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/displaynames/:displayName", async (req, res) => {
  try {
    const { displayName } = req.params;

    const user = await db.collection("users").findOne({ displayName });

    if (user) {
      res.json({ valid: false });
    } else {
      res.json({ valid: true });
    }
  } catch (error) {
    console.error("Error validating display name", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/displaynames/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName } = req.body;

    // Update the displayName in the users collection
    await db.collection("users").updateOne({ uid }, { $set: { displayName } });

    // Update the displayName in all tournaments where the user is a player
    const tournaments = await db
      .collection("tournaments")
      .find({ "players.uid": uid })
      .toArray();

    for (const tournament of tournaments) {
      const playerIndex = tournament.players.findIndex(
        (player) => player.uid === uid
      );

      tournament.players[playerIndex].displayName = displayName;

      await db
        .collection("tournaments")
        .updateOne(
          { _id: tournament._id },
          { $set: { players: tournament.players } }
        );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/displaynames/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await db.collection("users").findOne({ uid: uid });

    if (user) {
      res.status(200).send(user.displayName);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/games/:gid", async (req, res) => {
  try {
  } catch (error) {
    console.error("Error validating display name", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/tournaments", async (req, res) => {
  try {
    const tournaments = await db.collection("tournaments").find().toArray();
    res.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments data", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/tournaments/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const tournament = await db
      .collection("tournaments")
      .findOne({ tournament_id: id });
    if (!tournament) {
      res.status(404).send("Tournament not found");
    } else {
      res.json(tournament);
    }
  } catch (error) {
    console.error("Error fetching tournament data", error);
    res.status(500).send("Server error");
  }
});

app.post("/api/newTournament", async (req, res) => {
  try {
    // Assuming you have a MongoDB connection

    // Get the tournament data from the request body
    const tournamentData = req.body;
    console.log(tournamentData);
    // Add the tournament to the database
    const result = await db.collection("tournaments").insertOne(tournamentData);
    const endDate = moment(tournamentData.end_date);
    const cronPattern = `${endDate.minutes()} ${endDate.hours()} ${endDate.date()} ${
      endDate.month() + 1
    } *`;
    cron.schedule(cronPattern, async () => {
      // Perform the desired action at the specified end date and time
      console.log("Scheduled time reached!");
      winners_uid = await findTopPlayers(tournamentData);
      console.log("x", winners_uid);

      // prizes to winners.
      // close tournament
      // fetch all new tournament
      // get out of all investors
    });
    // Return the inserted tournament data
    res.json(result);
  } catch (error) {
    console.error("Error creating new tournament", error);
    res.status(500).send("Server error");
  }
});

async function findTopPlayers(tournamentData) {
  try {
    const tournaments = await db
      .collection("tournaments")
      .find({ tournament_id: tournamentData.tournament_id })
      .toArray();

    let topPlayers = {
      firstPlace: { uid: "", gameCurrency: 0 },
      secondPlace: { uid: "", gameCurrency: 0 },
      thirdPlace: { uid: "", gameCurrency: 0 },
    };

    for (const tournament of tournaments) {
      for (const player of tournament.players) {
        if (player.game_currency > topPlayers.firstPlace.gameCurrency) {
          topPlayers.thirdPlace = topPlayers.secondPlace;
          topPlayers.secondPlace = topPlayers.firstPlace;
          topPlayers.firstPlace = {
            uid: player.uid,
            gameCurrency: player.game_currency,
          };
        } else if (player.game_currency > topPlayers.secondPlace.gameCurrency) {
          topPlayers.thirdPlace = topPlayers.secondPlace;
          topPlayers.secondPlace = {
            uid: player.uid,
            gameCurrency: player.game_currency,
          };
        } else if (player.game_currency > topPlayers.thirdPlace.gameCurrency) {
          topPlayers.thirdPlace = {
            uid: player.uid,
            gameCurrency: player.game_currency,
          };
        }
      }
    }

    if (topPlayers.secondPlace.uid === topPlayers.firstPlace.uid) {
      topPlayers.secondPlace.uid = "";
    }

    if (
      topPlayers.thirdPlace.uid === topPlayers.firstPlace.uid ||
      topPlayers.thirdPlace.uid === topPlayers.secondPlace.uid
    ) {
      topPlayers.thirdPlace.uid = "";
    }
    console.log("top", topPlayers);
    updatePlayerBalances(tournamentData, topPlayers);
    return topPlayers;
  } catch (error) {
    console.error("Error finding top players", error);
    throw error;
  }
}

async function updatePlayerBalances(tournamentData, topPlayers) {
  const firstPlacePrize = tournamentData.first_place_prize;
  const secondPlacePrize = tournamentData.second_place_prize;
  const thirdPlacePrize = tournamentData.third_place_prize;

  const { firstPlace, secondPlace, thirdPlace } = topPlayers;

  const playersToUpdate = [firstPlace, secondPlace, thirdPlace].filter(Boolean);

  try {
    await db
      .collection("users")
      .updateMany(
        { uid: { $in: playersToUpdate.map((player) => player.uid) } },
        [
          {
            $set: {
              balance: {
                $cond: [
                  { $eq: ["$uid", firstPlace.uid] },
                  { $add: ["$balance", firstPlacePrize] },
                  {
                    $cond: [
                      { $eq: ["$uid", secondPlace?.uid] },
                      { $add: ["$balance", secondPlacePrize] },
                      { $add: ["$balance", thirdPlacePrize] },
                    ],
                  },
                ],
              },
            },
          },
        ]
      );

    console.log("Player balances updated successfully");
    deleteTournament(tournamentData.tournament_id);
    addNotification(
      firstPlace.uid,
      `Congratulaions! You've finished 1st in ${tournamentData.game_name}. you earned ${firstPlacePrize}$`,
      "tournaments"
    );
    secondPlace &&
      addNotification(
        secondPlace.uid,
        `Congratulaions! You've finished 2nd in ${tournamentData.game_name}. you earned ${secondPlacePrize}$`,
        "tournaments"
      );
    thirdPlace &&
      addNotification(
        thirdPlace.uid,
        `Congratulaions! You've finished 3rs in ${tournamentData.game_name}. you earned ${thirdPlacePrize}$`,
        "tournaments"
      );
  } catch (error) {
    console.error("Error updating player balances", error);
    throw error;
  }
}

async function deleteTournament(tournament_id) {
  try {
    const result = await db
      .collection("tournaments")
      .deleteOne({ tournament_id });

    if (result.deletedCount === 1) {
      console.log(
        `Tournament with tournament_id ${tournament_id} deleted successfully`
      );
    } else {
      console.log(`No tournament found with tournament_id ${tournament_id}`);
    }
  } catch (error) {
    console.error("Error deleting tournament", error);
    throw error;
  }
}
//sharon
const addNotification = async (uid, message, type) => {
  try {
    const status = await db.collection("notifications").insertOne({
      uid: uid,
      message: message,
      type: type,
      seen: false,
      date: new Date(),
    });
    // return res.data; // Optionally, you can return the response data
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

app.put("/api/tournaments/:tournament_id/join", async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const { uid } = req.body;

    const user = await db.collection("users").findOne({ uid });
    const user_money = user.balance;
    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log(tournament_id);
    const tournament = await db
      .collection("tournaments")
      .findOne({ tournament_id });
    if (!tournament) {
      return res.status(404).send("Tournament not found");
    }
    const tournament_cost = tournament.buy_in_cost;
    if (tournament.number_of_players >= tournament.max_players) {
      return res.status(400).send("Tournament is already full");
    }
    if (tournament.buy_in_cost > user_money) {
      return res
        .status(400)
        .send(
          `You are missing ${
            tournament.buy_in_cost - user_money
          }$ money to join this tournament.`
        );
    }

    // Convert the user data to the format used in the tournament
    const player = {
      uid: user.uid,
      displayName: user.displayName,
      game_currency: 1000000,
      positions: [],
    };
    const new_balance = user_money - tournament.buy_in_cost;
    // Add the player to the tournament and increment the number of players
    await db.collection("tournaments").updateOne(
      { tournament_id },
      {
        $push: { players: player },
        $inc: { number_of_players: 1 },
      }
    );

    // Add the player to the tournament and increment the number of players
    await db.collection("users").updateOne(
      { uid },
      {
        $set: {
          balance: new_balance,
        },
      }
    );

    const newTournament = await db
      .collection("tournaments")
      .findOne({ tournament_id });
    res.json(newTournament); // Return the updated tournament object
  } catch (error) {
    console.error("Error joining the tournament", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/tournaments/:tournament_id/addPosition", async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const { uid, position } = req.body;

    const user = await db.collection("users").findOne({ uid });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const tournament = await db
      .collection("tournaments")
      .findOne({ tournament_id });
    if (!tournament) {
      return res.status(404).send("Tournament not found");
    }

    // Check if user is part of the tournament
    const playerIndex = tournament.players.findIndex(
      (player) => player.uid === uid
    );
    if (playerIndex === -1) {
      return res.status(400).send("User is not part of the tournament");
    }

    // Add the position to the player's positions
    await db.collection("tournaments").updateOne(
      { tournament_id, "players.uid": uid },
      {
        $push: { "players.$.positions": position },
      }
    );

    res.status(200).send("Position successfully added");
  } catch (error) {
    console.error("Error adding position", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/tournaments/:tournament_id/closePosition", async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const { uid, position } = req.body;

    const tournament = await db
      .collection("tournaments")
      .findOne({ tournament_id });
    if (!tournament) {
      return res.status(404).send("Tournament not found");
    }

    // Check if user is part of the tournament
    const playerIndex = tournament.players.findIndex(
      (player) => player.uid === uid
    );
    if (playerIndex === -1) {
      return res.status(400).send("User is not part of the tournament");
    }

    // Close the position in the player's positions
    await db.collection("tournaments").updateOne(
      {
        tournament_id,
      },
      {
        $set: {
          "players.$[player].positions.$[position].status": "closed",
          "players.$[player].positions.$[position].close_price":
            position.close_price,
        },
      },
      {
        arrayFilters: [
          { "player.uid": uid },
          { "position.start_time": position.start_time },
        ],
      }
    );

    res.status(200).send("Position successfully closed");
  } catch (error) {
    console.error("Error closing position", error);
    res.status(500).send("Server error");
  }
});

app.put(
  "/api/tournaments/:tournament_id/players/:uid/updateBalance",
  async (req, res) => {
    try {
      const { tournament_id, uid } = req.params;
      const { newBalance } = req.body;

      const tournament = await db
        .collection("tournaments")
        .findOne({ tournament_id });
      if (!tournament) {
        return res.status(404).send("Tournament not found");
      }

      const playerIndex = tournament.players.findIndex(
        (player) => player.uid === uid
      );
      if (playerIndex === -1) {
        return res.status(404).send("Player not found");
      }

      tournament.players[playerIndex].game_currency = newBalance;

      await db
        .collection("tournaments")
        .updateOne(
          { tournament_id },
          { $set: { players: tournament.players } }
        );

      res.status(200).send("Player balance updated successfully");
    } catch (error) {
      console.error("Error updating player balance", error);
      res.status(500).send("Server error");
    }
  }
);
app.put("/api/users/:uid/color", async (req, res) => {
  try {
    const { uid } = req.params;
    const { color } = req.body;

    // Fetch the product with the name "Player Name Color Change"
    const product = await db
      .collection("products")
      .findOne({ name: "Player Name Color Change" });

    if (!product) {
      res.status(404).send("Product not found");
      return;
    }

    const price = product.price;

    // Deduct the price from the user's balance
    await db
      .collection("users")
      .updateOne(
        { uid: uid },
        { $inc: { balance: -price }, $set: { displayColor: color } }
      );

    res.json({ message: "Color updated successfully" });
  } catch (error) {
    console.error("Error updating color", error);
    res.status(500).send("Server error");
  }
});

// Assuming you are using Express
app.get("/api/products/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Query the database to find the product by name
    const product = await db.collection("products").findOne({ name });

    if (!product) {
      res.status(404).send("Product not found");
    } else {
      res.json(product);
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/products", async (req, res) => {
  try {
    // Find all products
    const products = await db.collection("products").find().toArray();

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error");
  }
});
app.put("/api/users/:uid/upgradeToVip", async (req, res) => {
  try {
    const { uid } = req.params;

    // Check if the user is already VIP
    const user = await db.collection("users").findOne({ uid });
    if (user && user.accountType === "VIP") {
      return res.status(400).send("User is already a VIP");
    }
    console.log("got here");
    // Get the cost of the VIP upgrade from the products collection
    const product = await db
      .collection("products")
      .findOne({ name: "VIP Upgrade" });
    if (!product || !product.price) {
      return res.status(404).send("VIP Upgrade product not found");
    }
    const vipUpgradeCost = product.price;
    console.log(vipUpgradeCost);

    // Deduct the cost from the user's balance
    const result = await db
      .collection("users")
      .updateOne(
        { uid },
        { $set: { accountType: "VIP" }, $inc: { balance: -vipUpgradeCost } }
      );

    if (result.modifiedCount === 0) {
      res.status(404).send("User not found");
    } else {
      res.json({ message: "Account upgraded to VIP" });
    }
  } catch (error) {
    console.error("Error upgrading to VIP:", error);
    res.status(500).send("Server error");
  }
});

function extractTournamentId(inputString) {
  const regex = /TID(\d+)/;
  const match = regex.exec(inputString);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return null;
}

const runWebSocket = () => {
  let wsServer = null;
  const connectionsByTournamentId = {}; // Store connections by tournament ID

  var server = http.createServer(function (request, response) {
    console.log(new Date() + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
  });

  server.listen(8080, function () {
    console.log(new Date() + " Server is listening on port 8080");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  });

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  wsServer.on("request", function (request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log(
        new Date() + " Connection from origin " + request.origin + " rejected."
      );
      return;
    }

    var connection = request.accept(null, request.origin);
    console.log(new Date() + " Connection accepted.");

    connection.on("message", function (message) {
      if (message.type === "utf8") {
        //  console.log('Received Message: ' + message.utf8Data);
        const tournamentId = extractTournamentId(message.utf8Data);
        if (
          message.utf8Data.includes("TID") &&
          message.utf8Data.includes("/NewConnection")
        ) {
          connectionsByTournamentId[tournamentId] =
            connectionsByTournamentId[tournamentId] || [];
          connectionsByTournamentId[tournamentId].push(connection);
        } else if (
          message.utf8Data.includes("TID") &&
          message.utf8Data.includes("/NewPositionsChanges")
        ) {
          const connections = connectionsByTournamentId[tournamentId];
          // console.log(connections);
          if (connections) {
            connections.forEach(function (receiverConnection) {
              if (receiverConnection !== connection) {
                receiverConnection.sendUTF(message.utf8Data);
              }
            });
          }
        }
      } else if (message.type === "binary") {
        console.log(
          "Received Binary Message of " + message.binaryData.length + " bytes"
        );
        connection.sendBytes(message.binaryData);
      }
    });

    connection.on("close", function (reasonCode, description) {
      console.log(
        new Date() + " Peer " + connection.remoteAddress + " disconnected."
      );

      // Remove connection from the associated tournament ID
      for (const tournamentId in connectionsByTournamentId) {
        if (connectionsByTournamentId.hasOwnProperty(tournamentId)) {
          const connections = connectionsByTournamentId[tournamentId];
          const index = connections.indexOf(connection);
          if (index !== -1) {
            connections.splice(index, 1);
            break; // Exit the loop after removing the connection
          }
        }
      }
    });
  });
};
