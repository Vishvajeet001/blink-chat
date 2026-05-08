import axiosInstance from "./index";

export const getAllChats = async () => {
  try {
    const response = await axiosInstance.get("/api/chat/get-all-chats");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch chats",
    };
  }
};

export const createChat = async (participants) => {
  try {
    const response = await axiosInstance.post("/api/chat/create-chat", {
      participants,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create chat",
    };
  }
};

export const clearUnreadMessages = async (chatId) => {
  try {
    const response = await axiosInstance.post(
      "/api/chat/clear-unread-messages",
      { chatId },
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to clear unread messages",
    };
  }
};
