import { useSelector } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("https://quick-chat-webapp.onrender.com");

function Home() {
  const { selectedChat, user } = useSelector(
    (state) => state.userReducer
  );

  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    if (!user?._id) return;



  
    socket.emit("join-room", user._id);

  
    socket.emit("user-login", user._id);

    const handleOnlineUsers = (users) => {

      setOnlineUser(users);
    };

    const handleOnlineUsersUpdated = (users) => {
   
      setOnlineUser(users);
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("online-users-updated", handleOnlineUsersUpdated);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off(
        "online-users-updated",
        handleOnlineUsersUpdated
      );
    };
  }, [user?._id]);

  return (
    <div className="home-page">
      <Header socket={socket} />

      <div className="main-content">
        <Sidebar
          socket={socket}
          onlineUser={onlineUser}
        />

        {selectedChat && (
          <ChatArea socket={socket} />
        )}
      </div>
    </div>
  );
}

export default Home;