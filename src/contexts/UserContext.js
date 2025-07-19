// src/contexts/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '');

  const login = (username, avatar) => {
    setUsername(username);
    setAvatar(avatar);
    localStorage.setItem('username', username);
    localStorage.setItem('avatar', avatar);
  };

  const logout = () => {
    setUsername('');
    setAvatar('');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
  };

  return (
    <UserContext.Provider value={{ username, avatar, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
