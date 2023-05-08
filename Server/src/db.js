import { MongoClient } from "mongodb";

let db;
async function connectToDb(callback) {
  // console.log(process.env.MONGO_USERNAME);
  // console.log(process.env.MONGO_PASSWORD);
  // console.log(process.env.MONGO_CLUSTER);
  const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.lem4zej.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("TradingTournamentDb");
  console.log(db.users);
  callback();
}

export { db, connectToDb };
