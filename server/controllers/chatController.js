const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Chat = require('./../models/chat');
const Message = require('./../models/message')


router.post('/create-new-chat',authMiddleware,async(req,res)=>{
    try{
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        res.status(201).send({
            message:'chat created successfully',
            success:true,
            data:savedChat
        })

    }catch(error){
        res.status(400).send({
            message:error.message,
            success:false
        })
    }
})


router.get('/get-all-chats',authMiddleware,async(req,res)=>{
    try{
        const allChats = await Chat.find({members:req.userId})
        .populate('members')
        .populate('lastMessage')
        .sort({updatedAt:-1})

        res.status(200).send({
            message:'chat fetched successfully',
            success:true,
            data:allChats
        })

    }catch(error){
        res.status(400).send({
            message:error.message,
            success:false
        })
    }
})


router.post(
  "/clear-unread-message",
  authMiddleware,
  async (req, res) => {
    try {
      const chatId = req.body.chatId;

      // Find chat
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.send({
          message: "No chat found with given chat ID.",
          success: false,
        });
      }

      // Update unread message count
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          unreadMessageCount: 0,
        },
        {
          new: true,
        }
      )
        .populate("members")
        .populate("lastMessage");

      // Mark messages as read
      await Message.updateMany(
        {
          chatId: chatId,
          read: false,
        },
        {
          read: true,
        }
      );

      return res.send({
        message: "Unread message cleared successfully",
        success: true,
        data: updatedChat,
      });
    } catch (error) {
      return res.status(400).send({
        message: error.message,
        success: false,
      });
    }
  }
);

module.exports = router;