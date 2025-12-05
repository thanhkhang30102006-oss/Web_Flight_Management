import React from "react";
import { NavLink } from "react-router-dom";
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
import "./LeftSide.css";

function LeftSide({ currentTab, onTabChange }) {
  const menuItems = [
    { id: "home", name: "Tổng quan", icon: <Home size={20} /> },
    { id: "booking", name: "Đặt vé", icon: <Plane size={20} /> },
    { id: "my-trips", name: "Chuyến bay của tôi", icon: <Luggage size={20} /> },
    { id: "wallet", name: "Ví & Ưu đãi", icon: <Wallet size={20} /> },
    { id: "setting", name: "Cài đặt", icon: <Settings size={20} /> },
    { id: "support", name: "Hỗ trợ", icon: <Headphones size={20} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Phần Logo thương hiệu */}
      <div className="logo-container">
        <div className="logo-icon">
          <img
            src={airplaneIcon}
            alt="FlightHK Logo"
            className="sidebar-logo-img"
          />{" "}
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

      {/* Phần footer của sidebar (Ví dụ: Đăng xuất) */}
      <div className="sidebar-footer">
        <button className="menu-item logout-btn">
          <span className="icon-wrapper">
            <LogOut size={20} />
          </span>
          <span className="item-name">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

export default LeftSide;
