import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("connected", () => {});

db.on("error", (err) => {});

export default db;
