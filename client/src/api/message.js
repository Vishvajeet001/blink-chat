import axiosInstance from "./index";

export const newMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/message/new-message",
      message,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send message",
    };
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(
      `/api/message/get-messages/${chatId}`,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch messages",
    };
  }
};
