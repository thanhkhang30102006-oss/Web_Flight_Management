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

function LeftSide({ currentTab, onTabChange }) {
  const { t } = useTranslation();
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
      id: "mytrips",
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
        <button className="menu-item logout-btn">
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
