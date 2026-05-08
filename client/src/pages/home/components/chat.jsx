import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { newMessage } from "../../../api/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { useState, useEffect } from "react";
import { getMessages } from "../../../api/message";
import moment from "moment";
import { clearUnreadMessages } from "../../../api/chat";
import { toast } from "react-hot-toast";
import store from "../../../redux/store";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer,
  );
  const selectedChatUser = selectedChat?.participants?.find(
    (p) => p._id !== user._id,
  );
  const dispatch = useDispatch();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function getFullName(user) {
    let fname =
      user?.firstname?.at(0).toUpperCase() +
      user?.firstname?.slice(1).toLowerCase();
    let lname =
      user?.lastname?.at(0).toUpperCase() +
      user?.lastname?.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  }

  async function sendMessage(image) {
    try {
      const message = {
        chatId: selectedChat._id,
        senderId: user._id,
        text: messageText,
        image: image || null,
      };

      // Call the API to send the message first
      const response = await newMessage(message);
      if (response.success) {
        // Emit the message to the socket server AFTER it's saved to DB
        socket.emit("send-message", {
          ...response.data,
          participants: selectedChat.participants.map((p) => p._id),
          chatId: selectedChat._id,
          // read:false,
          // createdAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        });

        setMessageText("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function fetchMessages() {
    try {
      const response = await getMessages(selectedChat._id);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");
    if (diff === 0) {
      return `Today ${moment(timestamp).format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    } else {
      return moment(timestamp).format("MMM D, YYYY hh:mm A");
    }
  };

  const clearUnreadMessagesCount = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        participants: selectedChat.participants.map((p) => p._id),
      });

      const response = await clearUnreadMessages(selectedChat._id);

      if (response.success) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }
          return chat;
        });

        dispatch(setAllChats(updatedChats));
        dispatch(setSelectedChat(response.data));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      await sendMessage(reader.result);
    };
  };

  useEffect(() => {
    fetchMessages();
    if (
      selectedChat?.lastMessage?.senderId !== user._id &&
      selectedChat?.unreadCount > 0
    ) {
      clearUnreadMessagesCount();
    }

    const handleReceiveMessage = (message) => {
      const selectedChatId = store.getState().userReducer.selectedChat?._id;
      if (message.chatId === selectedChatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      if (message.chatId === selectedChatId && message.senderId !== user._id) {
        clearUnreadMessagesCount();
      }
    };

    const handleClearUnreadMessages = async (data) => {
      const selectedChatId = store.getState().userReducer.selectedChat?._id;
      const allChatsFromStore = store.getState().userReducer.allChats;

      if (data.chatId === selectedChatId) {
        const updatedChats = allChatsFromStore.map((chat) => {
          if (chat._id === data.chatId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        });

        dispatch(setAllChats(updatedChats));
        dispatch(
          setSelectedChat(
            updatedChats.find((chat) => chat._id === data.chatId) ||
              selectedChat,
          ),
        );

        // Refetch messages to show updated read status
        try {
          const response = await getMessages(data.chatId);
          if (response.success) {
            setMessages(response.data);
          }
        } catch (error) {
          console.error("Error refetching messages:", error);
        }
      }
    };

    const handleUserTyping = (data) => {
      const selectedChatId = store.getState().userReducer.selectedChat?._id;
      if (data.chatId === selectedChatId && data.senderId !== user._id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("clear-unread-messages", handleClearUnreadMessages);
    socket.on("started-typing", handleUserTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("clear-unread-messages", handleClearUnreadMessages);
      socket.off("started-typing", handleUserTyping);
    };
  }, [selectedChat, allChats, socket, user]);

  useEffect(() => {
    const msgContainer = document.querySelector(".main-chat-area");
    const msgInput = document.querySelector(".send-message-input");
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    if (msgInput) {
      msgInput.focus();
    }
  }, [messages, isTyping, selectedChat]);

  return (
    <div className="app-chat-area">
      <div className="app-chat-area-header">
        {" "}
        {selectedChatUser && getFullName(selectedChatUser)}
      </div>

      <div className="main-chat-area">
        {messages.map((message) => {
          return (
            <div
              key={message._id}
              className="message-container"
              style={
                message.senderId === user._id
                  ? { justifyContent: "flex-end" }
                  : { justifyContent: "flex-start" }
              }
            >
              <div
                className={
                  message.senderId === user._id
                    ? "send-message"
                    : "received-message"
                }
              >
                <div>{message.text}</div>
                <div>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Sent"
                      style={{ height: "120px", width: "120px" }}
                    />
                  )}
                </div>
                <div className="message-timestamp">
                  {formatTime(message.createdAt)}{" "}
                  {message.senderId === user._id && message.read && (
                    <i
                      className="fa fa-check-circle"
                      aria-hidden="true"
                      style={{ fontSize: "15px", color: "#00ff08" }}
                    ></i>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="typing-indicator">{isTyping && <i>typing...</i>}</div>
      </div>
      {showEmojiPicker && (
        <div
          className="emoji-picker"
          style={{
            width: "100%",
            display: "flex",
            padding: "0px 20px",
            justifyContent: "right",
          }}
        >
          <EmojiPicker
            style={{ height: "400px", width: "300px" }}
            onEmojiClick={(e) => setMessageText(messageText + e.emoji)}
          />
        </div>
      )}
      <div className="send-message-div">
        <input
          type="text"
          className="send-message-input"
          placeholder="Type a message"
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            socket.emit("user-typing", {
              chatId: selectedChat._id,
              participants: selectedChat.participants.map((p) => p._id),
              senderId: user._id,
            });
          }}
        />
        <label htmlFor="file">
          <i className="fa fa-picture-o send-image-btn"></i>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            accept="image/jpg,image/jpeg,image/png,image/gif"
            onChange={sendImage}
          />
        </label>
        <button
          className="fa fa-smile-o send-emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          aria-hidden="true"
        ></button>
        <button
          className="fa fa-paper-plane send-message-btn"
          onClick={() => sendMessage("")}
          aria-hidden="true"
        ></button>
      </div>
    </div>
  );
}

export default ChatArea;
