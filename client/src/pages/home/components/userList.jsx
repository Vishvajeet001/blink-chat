import { useSelector, useDispatch } from "react-redux";
import { createChat } from "../../../api/chat";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";
import { toast } from "react-hot-toast";

function UserList({ searchTerm, socket, onlineUsers }) {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function getInitials(user) {
    let fname = user?.firstname.toUpperCase()[0];
    let lname = user?.lastname.toUpperCase()[0];
    return `${fname}${lname}`;
  }

  function getFullName(user) {
    let fname =
      user?.firstname[0].toUpperCase() + user?.firstname.slice(1).toLowerCase();
    let lname =
      user?.lastname[0].toUpperCase() + user?.lastname.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  }

  const createNewChat = async (searchedUserId) => {
    let response = null;

    try {
      response = await createChat([currentUser._id, searchedUserId]);
      if (!response.success) {
        navigate("/login");
      } else {
        const newChat = response.data;
        const updatedChats = [...allChats, newChat];
        dispatch(setAllChats(updatedChats));
        dispatch(setSelectedChat(newChat));
        
      }
    } catch (error) {
      toast.error(error.message);
      navigate("/login");
    }
  };

  const openChat = (selectedUserId) => {
    const chat = allChats.find(
      (c) =>
        c.participants.map((p) => p._id).includes(selectedUserId) &&
        c.participants.map((p) => p._id).includes(currentUser._id),
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const isSelectedChat = (userId) => {
    return selectedChat?.participants?.some((p) => p._id === userId);
  };

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

  const getLastMessage = (userId) => {
    const chat = allChats.find(
      (c) =>
        c.participants.map((p) => p._id).includes(userId) &&
        c.participants.map((p) => p._id).includes(currentUser?._id),
    );
    if (currentUser) {
      const msgPrefix =
        chat?.lastMessage?.senderId === currentUser?._id ? "You: " : "";
      return msgPrefix + (chat?.lastMessage?.text?.substring(0, 30) || "");
    }
  };

  const getUnreadCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.participants.map((p) => p._id).includes(userId),
    );

    if (
      chat &&
      chat.unreadCount &&
      chat.lastMessage?.senderId !== currentUser._id
    ) {
      return <div className="unread-message-counter"> {chat.unreadCount} </div>;
    } else {
      return "";
    }
  };

  const getUserList = () => {
    if (searchTerm === "") {
      return allChats;
    } else {
      return allUsers.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) && searchTerm;
      });
    }
  };

  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.participants.map((p) => p._id).includes(userId),
    );

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      return formatTime(chat?.lastMessage?.createdAt);
    }
  };

  useEffect(() => {
    const handleSetMsgCount = (message) => {
      const selectedChatFromStore = store.getState().userReducer.selectedChat;
      let allChatsFromStore = store.getState().userReducer.allChats;

        const updatedChats = allChatsFromStore.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              unreadCount:
                selectedChatFromStore?._id !== message.chatId
                  ? (chat?.unreadCount || 0) + 1
                  : chat.unreadCount,
            };
          }
          return chat;
        });

      const latestChat = updatedChats.find(
        (chat) => chat._id === message.chatId,
      );
      const otherChats = updatedChats.filter(
        (chat) => chat._id !== message.chatId,
      );
      const nextChats = latestChat ? [latestChat, ...otherChats] : updatedChats;

      dispatch(setAllChats(nextChats));
    };

    const handleClearUnreadMessages = (data) => {
      const allChatsFromStore = store.getState().userReducer.allChats;

      const updatedChats = allChatsFromStore.map((chat) => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        return chat;
      });

      dispatch(setAllChats(updatedChats));
    };

    socket.on("set-message-count", handleSetMsgCount);
    socket.on("clear-unread-messages", handleClearUnreadMessages);
    return () => {
      socket.off("set-message-count", handleSetMsgCount);
      socket.off("clear-unread-messages", handleClearUnreadMessages);
    };
  }, [socket]);

  return getUserList().map((obj) => {
    let user = obj;
    if (obj.participants) {
      user = obj.participants.find((p) => p._id !== currentUser?._id) || {};
    }
    return (
      <div
        className="user-search-filter"
        key={user._id}
        onClick={() => openChat(user._id)}
      >
        <div
          className={
            isSelectedChat(user._id) ? "selected-user" : "filtered-user"
          }
        >
          <div className="filter-user-display">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={
                  onlineUsers?.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              />
            ) : (
              <div
                className={
                  isSelectedChat(user._id)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={
                  onlineUsers?.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              >
                {getInitials(user)}
              </div>
            )}
            <div className="filter-user-details">
              <div className="user-display-name">{getFullName(user)}</div>
              <div className="user-display-email">
                {getLastMessage(user._id) || user.email}
              </div>
            </div>

            <div>
              <div className="user-display-time">
                {getLastMessageTimeStamp(user._id)}
              </div>
              {getUnreadCount(user._id)}
            </div>

            {allChats.some((chat) =>
              chat.participants.map((p) => p._id).includes(user._id),
            ) ? null : (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={() => createNewChat(user._id)}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default UserList;
