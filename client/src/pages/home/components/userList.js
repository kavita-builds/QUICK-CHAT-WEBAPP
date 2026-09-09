import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import {setAllChats,setSelectedChat} from "../../../redux/userSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";



function UsersList({ searchKey ,socket,onlineUser}) {
  const {allUsers,allChats,user: currentUser,selectedChat,} = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  // Start a new chat
  const startNewChat = async (searchUserId) => {
    try {
      dispatch(showLoader());

      const response = await createNewChat([
        currentUser._id,
        searchUserId,
      ]);

      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);

        const newChat = response.data;

        const updatedChat = [...allChats, newChat];

        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const openChat = (searchUserId) => {
  const chat = allChats.find(
    (chat) =>
      chat.members?.some(
        (m) => m._id === currentUser._id
      ) &&
      chat.members?.some(
        (m) => m._id === searchUserId
      )
  );

  if (!chat) return;

  // Open chat
  dispatch(
    setSelectedChat({
      ...chat,
      unreadMessageCount: 0,
    })
  );

  // Clear unread count in Redux
  const updatedChats = allChats.map((c) => {
    if (c._id === chat._id) {
      return {
        ...c,
        unreadMessageCount: 0,
      };
    }

    return c;
  });

  dispatch(setAllChats(updatedChats));
};




const getlastMessage=(userId)=>{
  const chat = allChats.find(chat=>chat.members.map(m=>m._id).includes(userId))
  if(!chat || !chat.lastMessage){
    return ""
  }else{
    const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You : " : ""
    return msgPrefix+chat.lastMessage?.text?.substring(0,25)
  }
}


  // Check whether this user belongs to currently selected chat
  const isSelectedChat = (user) => {
    if (!selectedChat) {
      return false;
    }

    return selectedChat.members.some(
      (m) => m._id === user._id
    );
  };


const getLastMessageTimeStamp = (userId)=>{
  const chat = allChats.find(chat=>chat.members.map(m=>m._id).includes(userId))
  if(!chat || !chat?.lastMessage){
    return ""
  }else{
    return moment(chat?.lastMessage?.createdAt).format('hh:mm A')
  }
}

function formatName(user) {
  if (!user) return "";

  const firstname = user.firstname || "";
  const lastname = user.lastname || "";

  const fname =
    firstname.charAt(0).toUpperCase() +
    firstname.slice(1).toLowerCase();

  const lname =
    lastname.charAt(0).toUpperCase() +
    lastname.slice(1).toLowerCase();

  return `${fname} ${lname}`.trim();
}


useEffect(() => {

  const receiveMessage = (message) => {
    console.log("RECEIVED:", message);

    const { selectedChat, allChats } =
      store.getState().userReducer;

    if (selectedChat?._id === message.chatId) {
      return;
    }

    const chat = allChats.find(
      chat => chat._id === message.chatId
    );

    if (!chat) {
      console.log("Chat not found:", message.chatId);
      return;
    }

    const updatedChat = {
      ...chat,
      unreadMessageCount:
        (chat.unreadMessageCount || 0) + 1,
      lastMessage: message
    };

    const updatedChats = [
      updatedChat,
      ...allChats.filter(
        chat => chat._id !== message.chatId
      )
    ];

    dispatch(setAllChats(updatedChats));
  };

  socket.on("receive-message", receiveMessage);

  return () => {
    socket.off("receive-message", receiveMessage);
  };

}, [socket, dispatch]);

const getUnreadMessageCount = (userId)=>{
  const chat = allChats.find(chat => chat.members.map(m=>m._id).includes(userId))
  if (chat && chat.unreadMessageCount && chat.lastMessage.sender!==currentUser._id){
    return <div className="unread-message-counter" > {chat.unreadMessageCount}</div>
  }else{
    return ""
  }
}


function getData() {
  if (!searchKey) {
    return allChats || [];
  }

  return (allUsers || []).filter((user) => {
    const firstname = user?.firstname || "";
    const lastname = user?.lastname || "";

    return (
      firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
      lastname.toLowerCase().includes(searchKey.toLowerCase())
    );
  });
}
  return getData()
    
    .map((obj) => {
      let user = obj
     if (obj.members) {
  user = obj.members.find(
    (mem) => mem._id !== currentUser._id
  );
}

if (!user) {
  return null;
}
      
      return (
        <div
          className="user-search-filter"
          onClick={() => openChat(user._id)}
          key={user._id}
        >
          <div
            className={
              isSelectedChat(user)
                ? "selected-user"
                : "filtered-user"
            }
          >
            <div className="filter-user-display">

              {user.profilePic && (
                <img
                  src={user.profilePic}
                  alt="Profile Pic"
                  className="user-profile-image"
                  style={onlineUser.includes(user._id) ? {border:'green 3px solid'} : {}}
                />
              )}

              {!user.profilePic && (
  <div className="user-default-profile-pic" 
  style={onlineUser.includes(user._id) ? {border:'green 3px solid'} : {}}>
    {(user.firstname?.charAt(0) || "").toUpperCase() +
      (user.lastname?.charAt(0) || "").toUpperCase()}
  </div>
)}

              <div className="filter-user-details">
                <div className="user-display-name">
                  {formatName(user)}
                  {getUnreadMessageCount(user._id)}
                </div>

                <div className="user-display-email">
                 <div className="last-message-timestamp">  { getlastMessage(user._id) || user.email}
                  </div>
                </div>
              </div>
              <div>
              
              {getLastMessageTimeStamp(user._id)}</div>
              </div>
              {!allChats.find((chat) =>
                chat.members.some((m) => m._id === user._id)
              ) && (
                <div className="user-start-chat">
                  <button
                    className="user-start-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startNewChat(user._id);
                    }}
                  >
                    Start Chat
                  </button>
                </div>
              )}

            </div>
          </div>
     
      );
    });
}

export default UsersList;