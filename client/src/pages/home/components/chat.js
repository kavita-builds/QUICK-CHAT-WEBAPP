import { useDispatch, useSelector } from "react-redux";
import {
  createNewMessage,
  getAllMessages,
} from "../../../apiCalls/message";
import {
  hideLoader,
  showLoader,
} from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  clearUnreadMessageCount,
} from "../../../apiCalls/chat";
import store from "../../../redux/store";
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
  const dispatch = useDispatch();

  const {
    selectedChat,
    user,
    allChats,
  } = useSelector((state) => state.userReducer);

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  
  const selectedUser = selectedChat?.members?.find(
    (u) => u._id !== user?._id
  );

  

  const formatName = (user) => {
    if (!user) return "";

    const firstName = user.firstname || "";
    const lastName = user.lastname || "";

    return (
      firstName.charAt(0).toUpperCase() +
      lastName.charAt(0).toUpperCase()
    );
  };

 

  const formatTime = (timestamp) => {
    const now = moment();
    const messageTime = moment(timestamp);

    const diff = now.diff(messageTime, "days");

    if (diff < 1) {
      return `Today ${messageTime.format("hh:mm A")}`;
    }

    if (diff === 1) {
      return `Yesterday ${messageTime.format("hh:mm A")}`;
    }

    return messageTime.format("MMM D, hh:mm A");
  };

  

  const getMessages = async () => {
    if (!selectedChat?._id) return;

    try {
      dispatch(showLoader());

      const response = await getAllMessages(selectedChat._id);

      dispatch(hideLoader());

      if (response?.success) {
        setAllMessages(response.data || []);
      } else {
        toast.error(
          response?.message || "Failed to load messages"
        );
      }
    } catch (error) {
      dispatch(hideLoader());

      toast.error(
        error?.message || "Failed to load messages"
      );
    }
  };


  const clearUnreadMessage = async () => {
    if (!selectedChat?._id) return;

    try {
      const response = await clearUnreadMessageCount(
        selectedChat._id
      );

      if (!response?.success) {
        toast.error(
          response?.message ||
            "Failed to clear unread messages"
        );
        return;
      }

  
      const updatedChats = (allChats || []).map(
        (chat) => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              unreadMessageCount: 0,
            };
          }

          return chat;
        }
      );

      dispatch(setAllChats(updatedChats));

 
      socket?.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map(
          (member) => member._id
        ),
      });
    } catch (error) {
      toast.error(
        error?.message ||
          "Failed to clear unread messages"
      );
    }
  };

 
  useEffect(() => {
    if (!selectedChat?._id || !user?._id) {
      return;
    }

    getMessages();

    const senderId =
      typeof selectedChat.lastMessage?.sender ===
      "object"
        ? selectedChat.lastMessage.sender._id
        : selectedChat.lastMessage?.sender;

    if (
      senderId &&
      senderId !== user._id &&
      selectedChat.unreadMessageCount > 0
    ) {
      clearUnreadMessage();
    }
  }, [selectedChat?._id]);

 

  useEffect(() => {
    if (!socket) return;

   
    const handleReceiveMessage = (newMessage) => {
      if (!newMessage?.chatId) return;

      const currentSelectedChat =
        store.getState().userReducer.selectedChat;

      if (!currentSelectedChat) return;

     
      if (
        currentSelectedChat._id ===
        newMessage.chatId
      ) {
        setAllMessages((prevMessages) => [
          ...prevMessages,
          newMessage,
        ]);
      }
    };

   
    const handleMessageCountCleared = (data) => {
      if (!data?.chatId) return;

      const currentSelectedChat =
        store.getState().userReducer.selectedChat;

      if (
        currentSelectedChat?._id === data.chatId
      ) {
        setAllMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            read: true,
          }))
        );
      }
    };

   
    const handleStartedTyping = (data) => {
      if (!data) return;

      if (
        data.chatId === selectedChat?._id &&
        data.sender !== user?._id
      ) {
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    socket.on(
      "message-count-cleared",
      handleMessageCountCleared
    );

    socket.on(
      "started-typing",
      handleStartedTyping
    );

   
    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );

      socket.off(
        "message-count-cleared",
        handleMessageCountCleared
      );

      socket.off(
        "started-typing",
        handleStartedTyping
      );
    };
  }, [
    socket,
    selectedChat?._id,
    user?._id,
  ]);

 

  const sendMessage = async (image = "") => {
    if (!selectedChat?._id || !user?._id) {
      return;
    }

  
    if (!message.trim() && !image) {
      return;
    }

    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image,
      };

    
      const response =
        await createNewMessage(newMessage);

      if (!response?.success) {
        toast.error(
          response?.message ||
            "Failed to send message"
        );
        return;
      }

    
      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members.map(
          (member) => member._id
        ),
        read: false,
        createdAt: moment().format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      });

      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error(
        error?.message || "Failed to send message"
      );
    }
  };



  const sendImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      await sendMessage(reader.result);
    };

    
    e.target.value = "";
  };

  
  useEffect(() => {
    const msgContainer =
      document.getElementById(
        "main-chat-area"
      );

    if (!msgContainer) return;

    msgContainer.scrollTop =
      msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  

  return (
    <>
      {selectedChat && (
        <div className="app-chat-area">

        
          <div className="app-chat-area-header">
            {formatName(selectedUser)}
          </div>

         
          <div
            className="main-chat-area"
            id="main-chat-area"
          >
            {allMessages.map((msg, index) => {
              const senderId =
                typeof msg.sender === "object"
                  ? msg.sender?._id
                  : msg.sender;

              const isCurrentUserSender =
                senderId === user?._id;

              return (
                <div
                  key={msg._id || index}
                  className="message-container"
                  style={
                    isCurrentUserSender
                      ? {
                          justifyContent: "end",
                        }
                      : {
                          justifyContent: "start",
                        }
                  }
                >
                  <div>

                   
                    <div
                      className={
                        isCurrentUserSender
                          ? "send-message"
                          : "received-message"
                      }
                    >
                      
                      {msg.text && (
                        <div>{msg.text}</div>
                      )}

                    
                      {msg.image && (
                        <div>
                          <img
                            src={msg.image}
                            alt="sent"
                            height="120"
                            width="120"
                          />
                        </div>
                      )}
                    </div>

                   
                    <div
                      className="message-timestamp"
                      style={
                        isCurrentUserSender
                          ? {
                              float: "right",
                            }
                          : {
                              float: "left",
                            }
                      }
                    >
                      {formatTime(msg.createdAt)}

                      {isCurrentUserSender &&
                        msg.read && (
                          <i
                            className="fa fa-check-circle"
                            aria-hidden="true"
                            style={{
                              color: "red",
                            }}
                          ></i>
                        )}
                    </div>

                  </div>
                </div>
              );
            })}

            <div className="typing-indicator">
              {isTyping && <i>typing...</i>}
            </div>
          </div>


          {showEmojiPicker && (
            <div>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage(
                    (prev) =>
                      prev + emojiData.emoji
                  );
                }}
              />
            </div>
          )}

        
          <div className="send-message-div">

         
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);

                socket.emit("user-typing", {
                  chatId: selectedChat._id,
                  members:
                    selectedChat.members.map(
                      (member) => member._id
                    ),
                  sender: user._id,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <label htmlFor="file">
              <i className="fa fa-picture-o send-image-btn"></i>

              <input
                type="file"
                id="file"
                style={{
                  display: "none",
                }}
                accept="image/jpg,image/png,image/jpeg,image/gif"
                onChange={sendImage}
              />
            </label>

          
            <button
              type="button"
              className="fa fa-smile-o send-emoji-btn"
              aria-hidden="true"
              onClick={() =>
                setShowEmojiPicker(
                  (prev) => !prev
                )
              }
            ></button>

          
            <button
              type="button"
              className="fa fa-paper-plane send-message-btn"
              aria-hidden="true"
              onClick={() => sendMessage()}
            ></button>

          </div>
        </div>
      )}
    </>
  );
}

export default ChatArea;