import React, { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Headset,
  Circle,
  MessageSquare,
} from "lucide-react";
import "../../pages/StaffDashboard.css"; // Sử dụng CSS chung

// --- MOCK DATA ---
const MOCK_USERS = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    lastMsg: "Cho mình hỏi về vé đi Đà Nẵng",
    time: "10:30",
    status: "online",
  },
  {
    id: 2,
    name: "Trần Thị B",
    lastMsg: "Mình muốn hoàn vé BK-192",
    time: "09:15",
    status: "offline",
  },
  {
    id: 3,
    name: "Lê Văn C",
    lastMsg: "Cảm ơn bạn nhé!",
    time: "Hôm qua",
    status: "online",
  },
  {
    id: 4,
    name: "Phạm Minh D",
    lastMsg: "Thủ tục check-in online thế nào?",
    time: "Hôm qua",
    status: "offline",
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "user",
    text: "Xin chào, cho mình hỏi về vé đi Đà Nẵng ngày mai còn không?",
    time: "10:28",
  },
  {
    id: 2,
    sender: "staff",
    text: "Chào bạn A, để mình kiểm tra giúp bạn nhé. Bạn muốn đi chuyến sáng hay chiều ạ?",
    time: "10:29",
  },
  { id: 3, sender: "user", text: "Mình muốn đi tầm 9h sáng.", time: "10:30" },
];

const CustomerSupport = () => {
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "staff",
      text: inputText,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div
      className="glass-panel fade-in"
      style={{ height: "650px", display: "flex", flexDirection: "column" }}
    >
      <h2 className="panel-title">Hỗ trợ trực tuyến</h2>

      <div className="chat-layout">
        {/* --- CỘT TRÁI: DANH SÁCH KHÁCH --- */}
        <div className="chat-sidebar">
          {/* Search Bar */}
          <div className="chat-search">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Tìm khách hàng..." />
          </div>

          {/* User List */}
          <div className="user-list custom-scrollbar">
            {MOCK_USERS.map((user) => (
              <div
                key={user.id}
                className={`user-item ${
                  selectedUser?.id === user.id ? "active" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-avatar">
                  <User size={20} />
                  <span className={`status-dot ${user.status}`}></span>
                </div>
                <div className="user-info">
                  <div className="user-name-row">
                    <span className="name">{user.name}</span>
                    <span className="time">{user.time}</span>
                  </div>
                  <div className="last-msg">{user.lastMsg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- CỘT PHẢI: CỬA SỔ CHAT --- */}
        <div className="chat-window">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="user-details">
                  <div className="avatar-circle">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="chat-username">{selectedUser.name}</h4>
                    <span className="chat-status">
                      {selectedUser.status === "online"
                        ? "Đang hoạt động"
                        : "Truy cập 1 giờ trước"}
                    </span>
                  </div>
                </div>
                <button className="icon-btn">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="messages-area custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-row ${
                      msg.sender === "staff" ? "sent" : "received"
                    }`}
                  >
                    {/* Avatar nhỏ bên cạnh tin nhắn */}
                    <div className="msg-avatar">
                      {msg.sender === "staff" ? (
                        <Headset size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>

                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="msg-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <button type="button" className="icon-btn">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="send-btn">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <MessageSquare size={48} color="#475569" />
              <p>Chọn một khách hàng để bắt đầu cuộc trò chuyện</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
