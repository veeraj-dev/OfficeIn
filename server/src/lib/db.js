const mongoose = require("mongoose");

let hasConnected = false;

async function connectDb() {
  if (hasConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing (set it in server/.env)");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  hasConnected = true;
}

module.exports = { connectDb };

