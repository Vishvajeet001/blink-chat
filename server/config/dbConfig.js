import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB");
});

db.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

export default db;
