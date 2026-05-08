import axiosInstance from "./index";

export const getAllChats = async () => {
    try {
        const response = await axiosInstance.get("/api/chat/get-all-chats");
        return response.data;
    } catch (error) {
        return error;
    }
};

export const createChat = async (participants) => {
    try {
        const response = await axiosInstance.post("/api/chat/create-chat", { participants });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const clearUnreadMessages = async (chatId) => {
    try {
        const response = await axiosInstance.post("/api/chat/clear-unread-messages", { chatId });
        return response.data;
    } catch (error) {
        return error;
    }
};