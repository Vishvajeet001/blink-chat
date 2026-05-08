import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "chats", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    text: { type: String, required: false },
    image: { type: String, required: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("messages", messageSchema);

export default Message;
