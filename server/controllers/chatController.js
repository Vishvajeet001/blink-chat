import router from "express";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const chatRouter = router.Router();

chatRouter.post("/create-chat", authMiddleware, async (req, res) => {
  try {
    const chat = new Chat(req.body);

    const savedChat = await chat.save();

    await savedChat.populate("participants", "-password");

    res.status(201).send({
      message: "Chat created successfully",
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

chatRouter.get("/get-all-chats", authMiddleware, async (req, res) => {
  try {
    const allChats = await Chat.find({ participants: { $in: req.userId } })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send({
      message: "All chats retrieved successfully",
      success: true,
      data: allChats,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

chatRouter.post("/clear-unread-messages", authMiddleware, async (req, res) => {
  try {
    const chatId  = req.body.chatId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.send({
        message: "Chat not found",
        success: false,
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { unreadCount: 0 },
      { new: true },
    ).populate("participants", "-password").populate("lastMessage");

    await Message.updateMany({ chatId: chatId, read: false }, { read: true });

    res.status(200).send({
      message: "Unread messages cleared successfully",
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});


export default chatRouter;
