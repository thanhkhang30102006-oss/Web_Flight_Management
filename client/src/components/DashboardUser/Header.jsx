import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Plane, Info } from "lucide-react";
import LanguageSwitcher from "../HomePage/header/LanguageSwitcher";
import "./Header.css";

// Dữ liệu giả lập (Sau này thay bằng API)
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "flight",
    content: "Chuyến bay **VN123** sắp cất cánh trong 2 giờ tới.",
    time: "10 phút trước",
    isRead: false,
  },
  {
    id: 2,
    type: "promo",
    content: "Chào mừng Bạn nhận được voucher giảm 20%.",
    time: "1 giờ trước",
    isRead: false,
  },
  {
    id: 3,
    type: "info",
    content: "Hệ thống bảo trì vào 00:00 ngày mai.",
    time: "1 ngày trước",
    isRead: true,
  },
];

const NotificationPanel = ({ onClose }) => {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Hàm đánh dấu đã đọc hết
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Tính số lượng chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      className="glass-dropdown"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="dropdown-header">
        <div className="header-left">
          <h4>{t("header.notification.title")}</h4>{" "}
          {unreadCount > 0 && (
            <span className="badge-new">
              {t("header.notification.new_count", { count: unreadCount })}
            </span>
          )}
        </div>
        <button className="btn-text" onClick={handleMarkAllRead}>
          {t("header.notification.mark_read")} <CheckCheck size={14} />{" "}
        </button>
      </div>

      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`noti-item ${!item.isRead ? "unread" : ""}`}
            >
              <div className={`icon-box ${item.type}`}>
                {item.type === "flight" && <Plane size={18} />}
                {item.type === "promo" && <Info size={18} />}
                {item.type === "info" && <Info size={18} />}
              </div>
              <div className="content-box">
                {/* Render HTML để in đậm chữ */}
                <p dangerouslySetInnerHTML={{ __html: item.content }} />
                <span className="time">{item.time}</span>
              </div>
              {!item.isRead && <div className="dot-status" />}
            </div>
          ))
        ) : (
          <div className="empty-state">{t("header.notification.empty")}</div>
        )}
      </div>
    </motion.div>
  );
};

function Header() {
  const { t } = useTranslation();

  const [showNoti, setShowNoti] = useState(false);
  const [user, setUser] = useState(null);

  // Ref để xử lý click ra ngoài thì đóng dropdown
  const notiRef = useRef(null);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const staffRole = localStorage.getItem("staffRole");
    let roleToDisplay = null;
    let userData = null;
    if (staffRole === "staff" || staffRole === "admin") {
      roleToDisplay = staffRole;
      userData = JSON.parse(localStorage.getItem("staffData"));
    } else if (userRole === "passenger") {
      roleToDisplay = userRole;
      userData = JSON.parse(localStorage.getItem("userData"));
    }
    setUser(userData);
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notiRef]);

  return (
    <header className="glass-header">
      <div className="header-content">
        {/* Left: Greeting */}
        <div className="greeting-section">
          <h1>{t("header.user.hello", { name: user?.name || "User" })}</h1>
          <p>{t("header.user.welcome_back")}</p>{" "}
        </div>

        {/* Right: Actions */}
        <div className="right-section">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder={t("header.search", "Tìm kiếm...")}
              className="search-input"
            />
            <button className="search-button">
              {t("header.searchBtn", "Tìm")}
            </button>
          </div>
          <LanguageSwitcher className="theme-glass" />
          {/* Notification Wrapper */}
          <div className="noti-wrapper" ref={notiRef}>
            <button
              className={`glass-btn-icon ${showNoti ? "active" : ""}`}
              onClick={() => setShowNoti(!showNoti)}
            >
              <Bell size={22} />
              {/* Hiển thị chấm đỏ nếu có tin mới (giả định) */}
              <span className="red-dot"></span>
            </button>

            {/* AnimatePresence giúp render hiệu ứng khi unmount (đóng) */}
            <AnimatePresence>
              {showNoti && (
                <NotificationPanel onClose={() => setShowNoti(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };
