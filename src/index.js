// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import { UserProvider } from "./contexts/UserContext"; // ✅ import
import { ChatProvider } from "./contexts/ChatContext"; // nếu bạn có ChatContext
import "./index.css"; // Thêm CSS toàn cục nếu cần

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <UserProvider> {/* ✅ Thêm dòng này */}
      <ChatProvider> {/* nếu bạn có chatbox */}
        <App />
      </ChatProvider>
    </UserProvider>
  </BrowserRouter>
);
