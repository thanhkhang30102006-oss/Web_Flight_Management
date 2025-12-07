import React from "react";
import { useTranslation } from "react-i18next";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";
import {
  LayoutDashboard,
  Users,
  Mail, // Quản lý Email Template
  Activity,
  ShieldAlert,
  LogOut, // Đăng xuất
} from "lucide-react";

import "../DashboardUser/FunctionBar.css";

function AdminSidebar({ currentTab, onTabChange }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: "dashboard",
      name: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "user-mgt",
      name: "Người dùng & Phân quyền",
      // Bao gồm: Tạo/Xóa User, Set quyền (Kế toán, NV vé)
      icon: <Users size={20} />,
    },
    {
      id: "email-tpl",
      name: "Mẫu Email tự động",
      // Bao gồm: Edit template xác nhận vé, hủy chuyến...
      icon: <Mail size={20} />,
    },
    {
      id: "system-logs",
      name: "Logs & Hệ thống",
      // Bao gồm: Check account valid, xem error log, vá lỗi
      icon: <Activity size={20} />,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Logo Brand */}
      <div className="logo-container">
        <div className="logo-icon">
          <img src={airplaneIcon} alt="Logo" className="sidebar-logo-img" />
        </div>
        <span className="brand-name">
          FlightHK{" "}
          <small style={{ fontSize: "11px", color: "#ff4757" }}>Admin</small>
        </span>
      </div>

      {/* Menu Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${currentTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="icon-wrapper">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="menu-item logout-btn">
          <span className="icon-wrapper">
            <LogOut size={20} />
          </span>
          <span className="item-name">{t("sidebar.logout", "Đăng xuất")}</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
