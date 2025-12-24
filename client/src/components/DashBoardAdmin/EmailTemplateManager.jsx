import React, { useState } from "react";
import { Mail, Save, Send, RefreshCw, FileText } from "lucide-react";
import "../../pages/AdminDashboard.css";
import "./EmailTemplateManager.css";

// Mock Data
const MOCK_TEMPLATES = [
  {
    id: 1,
    name: "Xác nhận đặt vé (Booking Success)",
    subject: "[FlightHK] Vé của bạn đã được đặt thành công - {{ticketID}}",
    content:
      "<p>Xin chào {{customerName}},</p><p>Cảm ơn bạn đã đặt vé tại FlightHK. Dưới đây là thông tin vé của bạn: <b>{{flightNumber}}</b></p>",
    variables: [
      "{{customerName}}",
      "{{ticketID}}",
      "{{flightNumber}}",
      "{{departureTime}}",
    ],
  },
  {
    id: 2,
    name: "Hủy chuyến bay (Flight Cancellation)",
    subject: "Thông báo quan trọng: Chuyến bay {{flightNumber}} bị hủy",
    content:
      "<p>Kính gửi {{customerName}},</p><p>Chúng tôi rất tiếc phải thông báo chuyến bay của bạn đã bị hủy do điều kiện thời tiết.</p>",
    variables: ["{{customerName}}", "{{flightNumber}}", "{{refundAmount}}"],
  },
  {
    id: 3,
    name: "Quên mật khẩu (Reset Password)",
    subject: "Yêu cầu cấp lại mật khẩu",
    content:
      "<p>Nhấn vào link dưới đây để đổi mật khẩu: <a href='{{resetLink}}'>Đổi mật khẩu</a></p>",
    variables: ["{{customerName}}", "{{resetLink}}"],
  },
];

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [selectedId, setSelectedId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Lấy template đang chọn
  const currentTemplate = templates.find((t) => t.id === selectedId);

  // Xử lý thay đổi nội dung form
  const handleUpdate = (field, value) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, [field]: value } : t))
    );
  };

  // Giả lập lưu
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu mẫu email thành công!");
    }, 800);
  };

  return (
    <div
      className="fade-in"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 className="panel-title">Mẫu Email Tự Động</h2>
      </div>

      <div className="email-layout">
        {/* LEFT: LIST */}
        <div className="template-list custom-scrollbar">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`template-item ${t.id === selectedId ? "active" : ""}`}
              onClick={() => setSelectedId(t.id)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "5px",
                }}
              >
                <Mail
                  size={16}
                  color={t.id === selectedId ? "#60a5fa" : "#94a3b8"}
                />
                <strong
                  style={{
                    fontSize: "14px",
                    color: t.id === selectedId ? "white" : "#ffffffff",
                  }}
                >
                  {t.name}
                </strong>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#f4f4f4ff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.subject}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: EDITOR */}
        <div className="glass-panel editor-container">
          {/* Subject Input */}
          <div>
            <label
              style={{
                fontSize: "1.2rem",
                color: "#ffffffff",
                display: "block",
                marginBottom: "15px",
              }}
            >
              Tiêu đề Email (Subject)
            </label>
            <input
              className="glass-input"
              style={{ width: "100%" }}
              value={currentTemplate.subject}
              onChange={(e) => handleUpdate("subject", e.target.value)}
            />
          </div>

          {/* Variables Helper */}
          <div>
            <label
              style={{
                fontSize: "1rem",
                color: "#ffffffff",
                marginRight: "10px",
              }}
            >
              Biến có sẵn (Click để copy):
            </label>
            {currentTemplate.variables.map((v) => (
              <span
                key={v}
                className="variable-tag"
                title="Copy"
                onClick={() => {
                  navigator.clipboard.writeText(v);
                  // Logic chèn vào cursor nếu làm editor xịn
                }}
              >
                {v}
              </span>
            ))}
          </div>

          {/* HTML Content (Textarea giả lập editor) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "1rem",
                color: "#ffffffff",
                marginBottom: "5px",
              }}
            >
              Nội dung HTML:
            </label>
            <textarea
              className="glass-input custom-scrollbar"
              style={{
                flex: 1,
                width: "100%",
                fontFamily: "monospace",
                lineHeight: "1.5",
                resize: "none",
              }}
              value={currentTemplate.content}
              onChange={(e) => handleUpdate("content", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-primary"
              style={{ marginBottom: "10px" }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
