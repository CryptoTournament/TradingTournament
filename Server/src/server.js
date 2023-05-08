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

app.post("/api/signUp", async (req, res) => {
  console.log("got something");
  const { uid } = req.body;
  const status = await db.collection("users").insertOne({
    id: uid,
    // username: username,
  });
});

app.get("/BTCUSDT", async (req, res) => {
  try {
    const response = fetchKlineData("BTCUSDT");
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// connecting to db and then connecting to express server.
connectToDb(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server(Express And Mongo) started on port 3000");
    runServerApp();
  });
});

const runServerApp = () => {
  //fetchKlineData('BTCUSDT');
  //fetchSymbolData('BTCUSDT');
};
