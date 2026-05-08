import express from "express";
import cors from "cors";
import authRouter from "./controllers/authController.js";
import userRouter from "./controllers/userController.js";
import chatRouter from "./controllers/chatController.js";
import messageRouter from "./controllers/messageController.js";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

app.use(express.json({
  limit: "15mb",
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.use("/api/chat", chatRouter);

app.use("/api/message", messageRouter);

const onlineUsers = new Set();

io.on("connection", (socket) => {
  
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });

  socket.on("send-message", (message) => {
    io.to(message.participants).emit("receive-message", message);

    io.to(message.participants).emit("set-message-count", message);
  });

  socket.on("clear-unread-messages", (data) => {
    io.to(data.participants).emit("clear-unread-messages", data);
  });

  socket.on("user-typing", (data) => {
    io.to(data.participants).emit("started-typing", data);
  });

  socket.on("user-login", (userId) => {
    if(!onlineUsers.has(userId)){
      onlineUsers.add(userId);
    }
    io.emit("online-users", Array.from(onlineUsers));
  });

  socket.on("user-offline", (userId) => {
    if(onlineUsers.has(userId)){
      onlineUsers.delete(userId);
    }
    io.emit("online-users-updated", Array.from(onlineUsers));
  });

});

export default server;
