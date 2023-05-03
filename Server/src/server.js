import express from "express";
import dotenv from "dotenv";
import { db, connectToDb } from "./db.js";
import { fetchSymbolData, fetchKlineData } from "./market_data_handler.js";
dotenv.config();

const app = express();

app.get('/BTCUSDT', async (req, res) => {
  try {
    const response = fetchKlineData('BTCUSDT');
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
}
