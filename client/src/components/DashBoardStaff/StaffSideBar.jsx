import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";
import {
  LayoutDashboard, // Tổng quan
  Plane, // Quản lý chuyến bay
  Ticket, // Nghiệp vụ vé (Tra cứu/Hủy/Đổi)
  BarChart3, // Báo cáo doanh thu
  MessageSquare, // Chat hỗ trợ
  LogOut, // Đăng xuất
} from "lucide-react";

import "../DashboardUser/FunctionBar.css";
function StaffSidebar({ currentTab, onTabChange }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: "dashboard",
      name: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "flight-mgt",
      name: "Quản lý chuyến bay",
      // Bao gồm: Tạo, Lên lịch, Update Status, Xem tỉ lệ ghế
      icon: <Plane size={20} />,
    },
    {
      id: "booking-mgt",
      name: "Nghiệp vụ vé",
      // Bao gồm: Tra cứu, Đổi vé, Hủy vé, Hoàn tiền
      icon: <Ticket size={20} />,
    },
    {
      id: "revenue",
      name: "Báo cáo doanh thu",
      // Bao gồm: Xem theo Ngày/Tuần/Tháng
      icon: <BarChart3 size={20} />,
    },
    {
      id: "support",
      name: "Hỗ trợ khách hàng",
      // Bao gồm: Nhắn tin
      icon: <MessageSquare size={20} />,
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
          <small style={{ fontSize: "11px", color: "#aaa" }}>Manager</small>
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

      {/* Footer / Logout */}
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

export default StaffSidebar;
