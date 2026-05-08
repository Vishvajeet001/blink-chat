import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const db = await import("./config/dbConfig.js");

import server from "./app.js";

const port = process.env.PORT || 3000;

server.listen(port, () => {});
