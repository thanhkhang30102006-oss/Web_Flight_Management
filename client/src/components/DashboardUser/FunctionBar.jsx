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

function LeftSide() {
  const menuItems = [
    { path: "/", name: "Tổng quan", icon: <Home size={20} /> },
    { path: "/booking", name: "Đặt vé", icon: <Plane size={20} /> },
    {
      path: "/my-trips",
      name: "Chuyến bay của tôi",
      icon: <Luggage size={20} />,
    },
    { path: "/wallet", name: "Ví & Ưu đãi", icon: <Wallet size={20} /> },
    { path: "/setting", name: "Cài đặt", icon: <Settings size={20} /> },
    { path: "/support", name: "Hỗ trợ", icon: <Headphones size={20} /> },
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
          <NavLink
            to={item.path}
            key={item.name}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="icon-wrapper">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </NavLink>
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
