import React from "react";
import { useTranslation } from "react-i18next";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";

import {
  Home,
  Plane,
  Luggage,
  Wallet,
  Settings,
  Headphones,
  LogOut,
} from "lucide-react";
import "./FunctionBar.css";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3001/api/user";
function LeftSide({ currentTab, onTabChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuItems = [
    {
      id: "home",
      name: t("sidebar.dashboard"),
      icon: <Home size={20} />,
    },
    {
      id: "booking",
      name: t("sidebar.booking"),
      icon: <Plane size={20} />,
    },
    {
      id: "my-trips",
      name: t("sidebar.my_trips"),
      icon: <Luggage size={20} />,
    },

    {
      id: "settings",
      name: t("sidebar.settings"),
      icon: <Settings size={20} />,
    },
    {
      id: "support",
      name: t("sidebar.support"),
      icon: <Headphones size={20} />,
    },
  ];
  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      navigate("/loginsignup");
    }
  };
  return (
    <aside className="sidebar">
      {/* Phần Logo thương hiệu */}
      <div className="logo-container">
        <div className="logo-icon">
          <img
            src={airplaneIcon}
            alt="FlightHK Logo"
            className="sidebar-logo-img"
          />
        </div>
        <span className="brand-name">FlightHK</span>
      </div>

      {/* Menu chính */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${currentTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            style={{ cursor: "pointer" }}
          >
            <span className="icon-wrapper">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </nav>

      {/* Phần footer của sidebar */}
      <div className="sidebar-footer">
        <button className="menu-item logout-btn" onClick={handleLogout}>
          <span className="icon-wrapper">
            <LogOut size={20} />
          </span>
          {/* 4. Sử dụng t() cho nút Đăng xuất */}
          <span className="item-name">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}

export default LeftSide;
