import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";
import {
  LayoutDashboard,
  Plane,
  Ticket,
  BarChart3,
  MessageSquare,
  LogOut,
  ChevronDown,
  SquareCheckBig,
} from "lucide-react";
import "./StaffSideBar.css";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3001/api/staff";
function StaffSidebar({ currentTab, onTabChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // State quản lý menu nào đang được mở (Expand)
  // Ví dụ: ['flight-mgt'] nghĩa là menu Quản lý chuyến bay đang mở
  const [expandedMenus, setExpandedMenus] = useState([]);

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.subItems?.some((sub) => sub.id === currentTab)
    );
    if (activeParent) {
      setExpandedMenus([activeParent.id]);
    } else {
      setExpandedMenus([]);
    }
  }, [currentTab]);

  const handleMouseEnter = (menuId) => {
    setExpandedMenus([menuId]); // Chỉ mở menu đang hover, đóng các menu khác
  };

  // Hàm xử lý khi di chuột ra (Đóng)
  const handleMouseLeave = () => {
    // Tìm xem menu nào đang chứa currentTab
    const activeParent = menuItems.find((item) =>
      item.subItems?.some((sub) => sub.id === currentTab)
    );

    if (activeParent) {
      // Nếu có, giữ menu đó mở
      setExpandedMenus([activeParent.id]);
    } else {
      // Nếu không (đang ở Dashboard chẳng hạn), đóng hết
      setExpandedMenus([]);
    }
  };

  // Cấu trúc dữ liệu theo yêu cầu
  const menuItems = [
    {
      id: "dashboard",
      name: t("sidebar.dashboard", "Tổng quan"),
      icon: <LayoutDashboard size={20} />,
      type: "single", // Menu đơn
    },
    {
      id: "check-in",
      name: "Check-In",
      icon: <SquareCheckBig size={20} />,
      type: "single",
    },
    {
      id: "flight-mgt",
      name: t("sidebar.flightManagement", "Quản lý chuyến bay"),
      icon: <Plane size={20} />,
      type: "dropdown", // Menu cha
      subItems: [
        {
          id: "flight-create-update",
          name: t("sidebar.createFlight"),
        },
        {
          id: "flight-schedule-map",
          name: t("sidebar.flightSchedule", "Lịch trình bay"),
        },
        {
          id: "flight-report",
          name: t("sidebar.flightReport", "Báo cáo chuyến bay"),
        },
      ],
    },
    {
      id: "booking-ops",
      name: t("sidebar.bookingOps", "Nghiệp vụ vé"),
      icon: <Ticket size={20} />,
      type: "single",
    },
    {
      id: "revenue",
      name: t("sidebar.revenueReports", "Doanh thu & Báo cáo"),
      icon: <BarChart3 size={20} />,
      type: "single",
    },
    {
      id: "support",
      name: t("sidebar.customerSupport", "Hỗ trợ khách hàng"),
      icon: <MessageSquare size={20} />,
      type: "single",
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
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-icon">
          <img src={airplaneIcon} alt="Logo" className="sidebar-logo-img" />
        </div>
        <span className="brand-name">
          FlightHK{" "}
          <small style={{ fontSize: "10px", color: "#aaa" }}>Staff</small>
        </span>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActiveParent = item.subItems?.some(
            (sub) => sub.id === currentTab
          );
          const isExpanded = expandedMenus.includes(item.id);

          return (
            <div
              key={item.id}
              className="menu-group"
              onMouseEnter={() =>
                item.type === "dropdown" && handleMouseEnter(item.id)
              }
              style={{ cursor: "pointer" }}
            >
              {/* MENU CHA */}
              <div
                className={`menu-item expanded ${
                  currentTab === item.id || isActiveParent ? "active" : ""
                }`}
                onClick={() => {
                  if (item.type === "single") {
                    onTabChange(item.id);
                  }
                }}
              >
                <span className="icon-wrapper">{item.icon}</span>
                <span className="item-name">{item.name}</span>

                {/* Mũi tên Dropdown */}
                {item.type === "dropdown" && (
                  <ChevronDown size={16} className="arrow-icon" />
                )}
              </div>

              {/* MENU CON (DROPDOWN) */}
              {item.type === "dropdown" && (
                <div
                  className={`submenu-container ${isExpanded ? "open" : ""}`}
                >
                  {" "}
                  {item.subItems.map((sub) => (
                    <div
                      key={sub.id}
                      className={`submenu-item ${
                        currentTab === sub.id ? "active" : ""
                      }`}
                      onClick={() => onTabChange(sub.id)}
                    >
                      • {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="menu-item logout-btn" onClick={handleLogout}>
          <span className="icon-wrapper">
            <LogOut size={20} />
          </span>
          <span className="item-name">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}

export default StaffSidebar;
