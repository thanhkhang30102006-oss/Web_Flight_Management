import React, { useState, useRef, useEffect } from "react";
import {
  Headphones,
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  ChevronRight,
  Bot,
  Image as ImageIcon,
  X,
  FileText,
  Download,
} from "lucide-react";
import axios from "axios";
import "./PassengerChat.css"; // CSS riêng cho chat
import { useSocket } from "../../context/SocketContext";
const API_URL = "http://localhost:3001";

// Lấy tên người dùng thôi
const getCurrentUser = () => {
  const userStr = localStorage.getItem("userData");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id && (user.id.includes("STF") || user.id.includes("AD"))) {
        console.warn(
          "⚠️ Đang dùng tài khoản Staff ở giao diện Passenger. Vui lòng đăng xuất."
        );
        return null;
      }
      return {
        id: user.id || user.passengerID,
        name: user.name || user.passengerName,
      };
    } catch (e) {
      console.error("Lỗi parse userData:", e);
    }
  }
  return null;
};

const TOPICS = [
  { id: "booking", label: "Vấn đề Đặt vé / Đổi vé" },
  { id: "payment", label: "Thanh toán & Hoàn tiền" },
  { id: "baggage", label: "Hành lý & Thủ tục" },
  { id: "other", label: "Vấn đề khác" },
];

const PassengerChat = () => {
  const currentUser = getCurrentUser();
  const { socket } = useSocket();
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].id);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const fileInputRef = useRef(null);

  if (!currentUser) {
    return (
      <div className="passenger-chat-wrapper fade-in">
        <div className="pre-chat-container glass-panel">
          <h3>Vui lòng đăng nhập để sử dụng Chat Hỗ Trợ</h3>
        </div>
      </div>
    );
  }
  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (chatStarted && socket) {
      // A. Join phòng chat (Room = UserID)

      socket.emit("join_room", { passengerID: currentUser.id });

      // B. Gọi API lấy lịch sử tin nhắn cũ
      const loadHistory = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/api/messages/history/${currentUser.id}`
          );

          // Map dữ liệu từ DB sang format của UI
          const dbMessages = res.data.map((msg) => ({
            id: msg.messageID,
            sender: msg.senderType === "passenger" ? "user" : "staff", // Quan trọng: Map sender
            text: msg.messageType === "text" ? msg.contentMessage : "",
            fileUrl: msg.messageType !== "text" ? msg.contentMessage : "",
            fileName: msg.messageType !== "text" ? "Tệp đính kèm" : "", // Tạm thời
            fileSize: "",
            type: msg.messageType,
            time: new Date(msg.messageTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(dbMessages);
        } catch (error) {
          console.error("Lỗi tải lịch sử chat:", error);
        }
      };
      loadHistory();

      // Cập nhật tin nhắn mới tới
      const handleReceiveMessage = (data) => {
        console.log(" Passenger nhận tin nhắn Socket:", data);
        if (data.passengerID !== currentUser.id) return;
        const newMsg = {
          id: data.messageID || Date.now(),
          sender: data.senderType === "passenger" ? "user" : "staff",
          text: data.messageType === "text" ? data.contentMessage : "",
          fileUrl: data.messageType !== "text" ? data.contentMessage : "",
          fileName: "File mới",
          fileSize: "",
          type: data.messageType,
          time: new Date(data.messageTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      };

      socket.on("receive_message", handleReceiveMessage);

      // Cleanup khi unmount
      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [chatStarted, currentUser.id, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    // Dữ liệu gửi lên Server
    const msgData = {
      passengerID: currentUser.id,
      staffID: null,
      content: inputValue,
      senderType: "passenger",
      type: "text",
    };

    // Emit socket (Server sẽ lưu DB và trả về lại cho client qua 'receive_message')
    await socket.emit("send_message", msgData);

    // Xóa ô nhập liệu (UI sẽ tự update khi nhận lại tin nhắn từ socket)
    setInputValue("");
  };

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

      const { url } = res.data; // URL ảnh trả về từ server
      const fileType = file.type.startsWith("image/") ? "image" : "file";

      // B. Gửi URL file qua Socket
      const msgData = {
        passengerID: currentUser.id,
        staffID: null,
        content: url,
        senderType: "passenger",
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

  return (
    <div className="passenger-chat-wrapper fade-in">
      {!chatStarted ? (
        /* --- GIAO DIỆN PRE-CHAT (CHỌN CHỦ ĐỀ) --- */
        <div className="pre-chat-container glass-panel">
          <div className="pre-chat-content">
            <div className="icon-glow">
              <Headphones size={48} color="#fff" />
            </div>
            <h2 className="welcome-title">Xin chào, {currentUser.name}!</h2>
            <p className="sub-text">
              Bạn cần hỗ trợ vấn đề gì? Hãy chọn chủ đề bên dưới.{" "}
            </p>

            <div className="topic-selection">
              {TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className={`topic-item ${
                    selectedTopic === topic.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <span className="radio-circle">
                    {selectedTopic === topic.id && <div className="dot" />}
                  </span>
                  {topic.label}
                </div>
              ))}
            </div>

            <button
              className="btn-start-chat"
              onClick={() => setChatStarted(true)}
            >
              {" "}
              Hỗ trợ ngay <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* --- GIAO DIỆN CHAT CHÍNH --- */
        <div className="chat-interface glass-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="support-info">
              <div className="avatar-support">
                <Bot size={24} />
                <span className="online-dot"></span>
              </div>
              <div>
                <h3>FlightHK Support</h3>
                <span className="status-text">
                  Thường trả lời trong vài phút
                </span>
              </div>
            </div>
            <button
              className="btn-end-chat"
              onClick={() => setChatStarted(false)}
            >
              Kết thúc
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx} // Dùng index làm key tạm nếu id bị trùng do render nhanh
                className={`msg-row ${
                  msg.sender === "user" ? "msg-right" : "msg-left"
                }`}
              >
                {msg.sender !== "user" && (
                  <div className="msg-avatar-small">
                    <Headphones size={14} />
                  </div>
                )}
                {/* --- LOGIC HIỂN THỊ ĐA DẠNG --- */}
                <div
                  className={`msg-bubble ${
                    msg.type === "image"
                      ? "bubble-image"
                      : msg.type === "file"
                        ? "bubble-file"
                        : ""
                  }`}
                >
                  {/* TRƯỜNG HỢP 1: ẢNH */}
                  {msg.type === "image" && (
                    <img
                      src={msg.fileUrl}
                      alt="Sent"
                      className="chat-sent-image"
                      onClick={() => window.open(msg.fileUrl, "_blank")}
                    />
                  )}

                  {/* TRƯỜNG HỢP 2: FILE TÀI LIỆU (PDF/DOC) */}
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

                  {/* TRƯỜNG HỢP 3: TEXT THƯỜNG */}
                  {msg.type === "text" && <p>{msg.text}</p>}

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
        </div>
      )}
    </div>
  );
};

export default PassengerChat;
