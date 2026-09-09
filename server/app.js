const express = require('express');
const app = express()
const authRouter = require('./controllers/authController')
const userRouter = require('./controllers/userController')
const chatRouter = require('./controllers/chatController')
const messageRouter = require('./controllers/messageController')
const cors = require("cors");
const onlineUser = []




app.use(cors());

app.get("/hello", (req, res) => {
    res.send("Hello from my backend");
});


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const server = require('http').createServer(app)
const io = require('socket.io')(server,{cors:{
    origin:'https://quick-chat-webapp.netlify.app',
    methods:['GET','POST']
}})






//use auth controllers routers
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/message',messageRouter)

io.on("connection", (socket) => {


  socket.on("join-room", (userid) => {
    

    socket.join(userid);

   
  });

  socket.on("send-message", (message) => {
   

    

    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);

   
  });

  socket.on("disconnect", () => {
   
  });
});



module.exports = server;

