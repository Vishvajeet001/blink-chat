import router from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import Message from '../models/message.js';
import Chat from '../models/chat.js';

const messageRouter = router.Router();

messageRouter.post("/new-message", authMiddleware, async (req, res) => {
    try {
        const newMessage = new Message(req.body);

        const savedMessage = await newMessage.save();

        const currentChat = await Chat.findOneAndUpdate({
            _id: req.body.chatId
        }, {
            lastMessage: savedMessage._id,
            $inc: { unreadCount: 1 }
        });

        res.status(201).send({
            message: "Message sent successfully",
            success: true,
            data: savedMessage
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        });
    }
});

messageRouter.get("/get-messages/:chatId", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });  

        res.status(200).send({
            message: "Messages retrieved successfully",
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        });
    }
});


export default messageRouter;