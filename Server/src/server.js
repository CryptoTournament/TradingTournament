import express from "express";
import dotenv from "dotenv";
import { db, connectToDb } from "./db.js";
import { fetchSymbolData, fetchKlineData } from "./market_data_handler.js";
import { ObjectId } from "mongodb";

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

  const status = await db.collection("users").insertOne({
    uid: uid,
    approve_waiting_list: [],
    friends: [],
    displayName: "",
    rank: "BronzeOne",
    balance: 0,
    wins: 0,
    gamesPlayed: 0,
    gameTokens: 200,
    accountType: "Regular",
  });
});

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
    runServerApp();
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
    // console.log(users, "users");
    for (const user of users) {
      if (user.approve_waiting_list.includes(uid)) {
        display_names.push(user.displayName);
      }
    }
    // console.log(display_names);
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
    console.log("To -> nickName:" + nickname);
    console.log("From -> uid of me:" + uid);
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

    friend_user.friends.push(uid);
    console.log(friend_user.friends);

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
    // console.log(updatedWaitingListForMyUser);

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

    const result = await db
      .collection("users")
      .updateOne({ uid }, { $set: { displayName } });

    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).send("Server error");
  }
});

const runServerApp = () => {
  //fetchKlineData('BTCUSDT');
  //fetchSymbolData('BTCUSDT');
};
