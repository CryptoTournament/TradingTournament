import express from "express";
import dotenv from "dotenv";
import { db, connectToDb } from "./db.js";

dotenv.config();

const app = express();

// connecting to db and then connecting to express server.
connectToDb(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server(Express And Mongo) started on port 3000");
  });
});
