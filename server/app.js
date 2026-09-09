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
  console.log("SOCKET CONNECTED:", socket.id);

  socket.on("join-room", (userid) => {
    console.log("JOIN ROOM:", userid);

    socket.join(userid);

    console.log("ROOMS:", socket.rooms);
  });

  socket.on("send-message", (message) => {
    console.log("MESSAGE RECEIVED FROM CLIENT:", message);

    console.log("SENDING TO:", message.members);

    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);

    console.log("MESSAGE EMITTED");
  });

  socket.on("disconnect", () => {
    console.log("SOCKET DISCONNECTED:", socket.id);
  });
});



module.exports = server;

