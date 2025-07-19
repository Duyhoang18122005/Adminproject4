// src/contexts/ChatContext.js
import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const addUser = (name, avatar) => {
    setChats((prev) => ({
      ...prev,
      [name]: prev[name] || { avatar, messages: [] },
    }));
    setCurrentUser(name);
  };

  const sendMessage = (name, text) => {
    if (!name) return;
    setChats((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        messages: [...(prev[name]?.messages || []), { from: "me", text }],
      },
    }));
  };

  const selectUser = (name) => setCurrentUser(name);

  return (
    <ChatContext.Provider value={{ chats, currentUser, addUser, sendMessage, selectUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
