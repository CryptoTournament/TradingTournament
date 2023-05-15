import express from "express";
import dotenv from "dotenv";
import { db, connectToDb } from "./db.js";
import { fetchSymbolData, fetchKlineData } from "./market_data_handler.js";
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
  console.log("got something");
  const { uid } = req.body;
  const status = await db.collection("users").insertOne({
    id: uid,
    // username: username,
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
  console.log("got here");
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
    console.log("Server(Express And Mongo) started on port 3000");
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


app.get("/api/get_all_users", async (req, res) => {
  try {
    const users = await getUsersFromMongoDB();
    res.json(users);
  } catch (error) {
    console.error("Error fetching user collection", error);
    res.status(500).send("Server error");
  }
});

app.post("/api/add_friend", async (req, res) => {
  try {
    const { nickname, uid } = req.body;
    console.log(req.body);
    console.log("HERE1");
    // Find the user in the database based on uid
    const user = await db.collection("users").findOne({ nick_name :nickname });
    if (user) {
      console.log("HERE2");

      // Update the user's approve_waiting_list with the nickname
      await db
        .collection("users")
        .updateOne({ nick_name: nickname }, { $push: { approve_waiting_list: uid } });
        console.log("HERE3");

      res.json({ message: "Friend added successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
      
    }
  } catch (error) {
    console.error("Error adding friend", error);
    res.status(500).json({ message: "Server error" });
  }
});



app.get("/api/get_waiting_list", async (req, res) => {
  try {
    const { uid } = req.query;

    // Find all users that have the given UID in their waiting_approval_list
    const users = await db.collection("users").find({ approve_waiting_list: uid }).toArray();

    const nicknames = [];

    // Loop over the users and fetch the nicknames
    for (const user of users) {
      const userWithNickname = await db.collection("users").findOne({ uid: user.uid });

      if (userWithNickname && userWithNickname.nick_name) {
        nicknames.push(userWithNickname.nick_name);
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
    const user = await db.collection("users").findOne({ nick_name: nickname });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the given UID from the user's approve_waiting_list
    const updatedWaitingList = user.approve_waiting_list.filter((id) => id !== uid);

    // Add the given UID to the user's friends list
    user.friends.push(uid);

    // Find the user who requested to be a friend and add the user's UID to their friends list
    const friendUser = await db.collection("users").findOne({ uid });
    if (friendUser) {
      friendUser.friends.push(user.uid);
      await db.collection("users").updateOne({ uid: friendUser.uid }, { $set: { friends: friendUser.friends } });
    }

    // Update the user's approve_waiting_list and friends list in the database
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { approve_waiting_list: updatedWaitingList, friends: user.friends } }
    );

    // Fetch the nicknames of the updated approve_waiting_list
    const nicknames = [];

    for (const id of updatedWaitingList) {
      const userWithNickname = await db.collection("users").findOne({ uid: id });

      if (userWithNickname && userWithNickname.nick_name) {
        nicknames.push(userWithNickname.nick_name);
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
    const user = await db.collection("users").findOne({ nick_name: nickname });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the given UID from the user's approve_waiting_list
    const updatedWaitingList = user.approve_waiting_list.filter((id) => id !== uid);

    // Update the user's approve_waiting_list in the database
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { approve_waiting_list: updatedWaitingList } }
    );

    // Fetch the nicknames of the updated approve_waiting_list
    const nicknames = [];

    for (const id of updatedWaitingList) {
      const userWithNickname = await db.collection("users").findOne({ uid: id });

      if (userWithNickname && userWithNickname.nick_name) {
        nicknames.push(userWithNickname.nick_name);
      }
    }

    res.json({ nicknames });
  } catch (error) {
    console.error("Error updating user's waiting approval list", error);
    res.status(500).json({ message: "Server error" });
  }
});







const runServerApp = () => {
  //console.log(fetchUsersFromMongoDB());
  //fetchKlineData('BTCUSDT');
  //fetchSymbolData('BTCUSDT');
};
