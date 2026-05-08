import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
    },
    unreadCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Chat = mongoose.model("chats", chatSchema);

export default Chat;