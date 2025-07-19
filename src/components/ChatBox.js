import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext'; // Import hook từ context
import './Profiles/ChatBox.css'; // Import CSS cho ChatBox

const ChatBox = () => {
  const { chats = {}, currentUser, selectUser, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll tự động khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentUser, chats]);

  const currentMessages = currentUser && chats[currentUser]?.messages ? chats[currentUser].messages : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentUser) return;
    sendMessage(currentUser, text);
    setInput('');
  };

  return (
    <div id="chatBox" className="chatbox-fixed">
      {/* Danh sách người dùng */}
      <div className="chatbox-sidebar">
        {Object.keys(chats).length > 0 ? (
          Object.keys(chats).map((name) => (
            <div
              key={name}
              className={`chatbox-user ${currentUser === name ? 'active' : ''}`}
              onClick={() => selectUser(name)}
            >
              <img src={chats[name].avatar} alt={name} />
              <div className="chatbox-user-name">{name}</div>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500">Chưa có cuộc trò chuyện nào</div>
        )}
      </div>

      {/* Nội dung chat */}
      <div className="chatbox-main">
        {currentUser ? (
          <>
            <div className="chatbox-messages">
              {currentMessages.map((msg, i) => (
                <div key={i} className={`bubble ${msg.from}`}>{msg.text}</div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chatbox-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button type="submit">Gửi</button>
            </form>
          </>
        ) : (
          <div className="chatbox-placeholder">Chọn người để bắt đầu trò chuyện</div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;