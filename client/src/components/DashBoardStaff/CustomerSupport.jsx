import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Headset,
  Circle,
  Smile,
  MessageSquare,
  FileText,
  Download,
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";

import io from "socket.io-client";
import axios from "axios";
import "./CustomerSupport.css";
import "../../pages/StaffDashboard.css";

const API_URL = "http://localhost:3001";

const socket = io.connect(API_URL);

const CustomerSupport = () => {
  const [currentStaff, setCurrentStaff] = useState(null);
  useEffect(() => {
    const staffStr = localStorage.getItem("userData");
    console.log("🛠️ Checking localStorage 'userData':", staffStr); // DEBUG LOG
    if (staffStr) {
      try {
        const staff = JSON.parse(staffStr);
        setCurrentStaff(staff);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu Staff:", e);
      }
    } else {
      console.warn("⚠️ Không tìm thấy userData trong localStorage");
    }
  }, []);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Khách đang chọn
  const [messages, setMessages] = useState([]); // Tin nhắn hiện tại
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentStaff) {
      console.log("⏳ Chờ thông tin Staff...");
      return;
    }
    const fetchConversations = async () => {
      console.log("🚀 Bắt đầu gọi API lấy danh sách hội thoại...");
      try {
        const res = await axios.get(`${API_URL}/api/messages/conversations`);
        console.log("✅ API Conversations Data:", res.data); // DEBUG LOG
        if (Array.isArray(res.data)) {
          const formattedUsers = res.data.map((conv) => ({
            id: conv.passengerID,
            name: conv.passengerName || conv.passengerID,
            avatar: conv.passengerImage,
            lastMsg: conv.lastMsg || "Hình ảnh/File",
            time: conv.lastTime
              ? new Date(conv.lastTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            status: "online",
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Lỗi load conversations:", error);
      }
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [currentStaff]);

  // --- 2. KHI CHỌN KHÁCH HÀNG -> JOIN ROOM & LOAD HISTORY ---
  useEffect(() => {
    if (selectedUser && currentStaff) {
      // A. Join Room của khách (ID phòng = ID Khách)
      socket.emit("join_room", { passengerID: selectedUser.id });

      // B. Load History
      const loadHistory = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/api/messages/history/${selectedUser.id}`
          );
          const dbMessages = res.data.map((msg) => ({
            id: msg.messageID,
            sender: msg.senderType === "staff" ? "staff" : "user",
            text: msg.messageType === "text" ? msg.contentMessage : "",
            fileUrl: msg.messageType !== "text" ? msg.contentMessage : "",
            type: msg.messageType,
            time: new Date(msg.messageTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(dbMessages);
        } catch (error) {
          console.error("Lỗi load history:", error);
        }
      };
      loadHistory();
    }
  }, [selectedUser, currentStaff]);

  // --- 3. LẮNG NGHE TIN NHẮN MỚI ---
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (data) => {
      if (selectedUser && data.passengerID === selectedUser.id) {
        if (data.senderType === "staff") return;
        const newMsg = {
          id: data.messageID || Date.now(),
          sender: data.senderType === "staff" ? "staff" : "user",
          text: data.messageType === "text" ? data.contentMessage : "",
          fileUrl: data.messageType !== "text" ? data.contentMessage : "",
          type: data.messageType,
          time: new Date(data.messageTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    return () => {
      // 3. Kiểm tra socket trước khi off (đề phòng socket bị mất kết nối giữa chừng)
      if (socket) {
        socket.off("receive_message", handleReceiveMessage);
      }
    };
  }, [selectedUser]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // --- 4. GỬI TIN NHẮN (STAFF GỬI) ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUser) return;

    const newMsg = {
      id: Date.now(), // ID tạm
      sender: "staff",
      text: inputValue,
      fileUrl: "",
      type: "text",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // 2. Cập nhật State ngay lập tức -> Tin nhắn hiện lên luôn
    setMessages((prev) => [...prev, newMsg]);

    const msgData = {
      passengerID: selectedUser.id,
      staffID: currentStaff.id,
      content: inputValue,
      senderType: "staff",
      type: "text",
    };

    await socket.emit("send_message", msgData);
    setInputValue("");
  };

  // Upload File (Tương tự PassengerChat)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // A. Upload file lên Server qua API
      const res = await axios.post(`${API_URL}/api/messages/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url } = res.data;
      const fileType = file.type.startsWith("image/") ? "image" : "file";

      const newMsg = {
        id: Date.now(),
        sender: "staff",
        text: "",
        fileUrl: url,
        fileName: file.name, // Hiển thị tên file thật
        type: fileType,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMsg]);

      const msgData = {
        passengerID: selectedUser.id,
        staffID: currentStaff.id,
        content: url,
        senderType: "staff",
        type: fileType,
      };

      await socket.emit("send_message", msgData);
    } catch (error) {
      console.error("Lỗi upload file:", error);
      alert("Không thể gửi file. Vui lòng thử lại.");
    }
    e.target.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  if (!currentStaff) {
    return (
      <div
        className="glass-panel fade-in"
        style={{
          height: "650px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h3>Đang tải dữ liệu...</h3>
        <p style={{ color: "#aaa", fontSize: 12 }}>
          Vui lòng đảm bảo bạn đã đăng nhập Staff
        </p>
      </div>
    );
  }
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
            {users.map((user) => (
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
                    <span className="chat-status">Đang kết nối</span>
                  </div>
                </div>
                <button className="icon-btn">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="messages-area custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-row ${
                      msg.sender === "staff" ? "sent" : "received"
                    }`}
                  >
                    <div className="msg-avatar">
                      {msg.sender === "staff" ? (
                        <Headset size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div
                      className={`message-bubble ${
                        msg.type !== "text" ? "bubble-file" : ""
                      }`}
                    >
                      {msg.type === "text" && <p>{msg.text}</p>}
                      {msg.type === "image" && (
                        <img
                          src={msg.fileUrl}
                          alt="Sent"
                          className="chat-sent-image"
                          onClick={() => window.open(msg.fileUrl, "_blank")}
                        />
                      )}
                      {msg.type === "file" && (
                        <div className="file-attachment-card">
                          <div className="file-icon">
                            <FileText size={24} />
                          </div>
                          <div className="file-info">
                            <span className="file-name">{msg.fileName}</span>
                            <span className="file-size">{msg.fileSize}</span>
                          </div>
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-download"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                      <span className="msg-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="chat-input-zone" onSubmit={handleSend}>
                {/* INPUT FILE: Thêm accept cho PDF, DOC */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*, .pdf, .doc, .docx, .xls, .xlsx"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="icon-tool"
                  onClick={triggerFileInput}
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="button" className="icon-tool">
                  <Smile size={20} />
                </button>
                <button type="submit" className="btn-send">
                  <Send size={20} />
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
