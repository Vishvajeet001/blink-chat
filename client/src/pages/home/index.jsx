import { useEffect, useState } from 'react'
import Header from './components/header'
import Sidebar from './components/sidebar'
import ChatArea from './components/chat'
import { useSelector } from 'react-redux';
import { io } from "socket.io-client";
const socket = io("https://blink-chat-server.onrender.com");

function Home() {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    if(user){
      socket.emit("join-room", user?._id);
      socket.emit("user-login", user?._id);
      socket.on("online-users", (users) => {
        setOnlineUsers(users);
      });
      socket.on("online-users-updated", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [user]);

  return (
    <div className="home-page">
    <Header socket={socket} />
    <div className="main-content">
      <Sidebar socket={socket} onlineUsers={onlineUsers} />
      {selectedChat && <ChatArea socket={socket} />}
    </div>
</div>
  )
}

export default Home