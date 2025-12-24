import React, { useState } from "react";
// 1. Import các component con
import AdminSidebar from "../components/DashBoardAdmin/AdminSideBar";
import { Header } from "../components/DashboardUser/header";
import Overview from "../components/DashBoardAdmin/Overview";

// 2. Import CSS và Assets
import "./AdminDashboard.css";
import videoBg from "../assets/videos/background-wallpaper-bookingpage.mp4";
import UserRoleManagement from "../components/DashBoardAdmin/UserRoleManagement";
import EmailTemplateManager from "../components/DashBoardAdmin/EmailTemplateManager";
import SystemLogsMonitor from "../components/DashBoardAdmin/SystemLogsMonitor";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Hàm điều hướng nội dung
  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Overview />; // Gọi component Overview ở đây

      case "user-mgt":
        return <UserRoleManagement />;

      case "email-tpl":
        return <EmailTemplateManager />;

      case "system-logs":
        return <SystemLogsMonitor />;

      default:
        return <Overview />;
    }
  };

  return (
    <div className="admin-layout">
      {/* A. BACKGROUND VIDEO */}
      <video className="admin-video-bg" autoPlay muted loop playsInline>
        <source src={videoBg} type="video/mp4" />
      </video>
      <div className="admin-overlay"></div>

      {/* B. SIDEBAR (Bên trái) */}
      <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* C. MAIN CONTENT (Bên phải) */}
      <main className="main-content">
        {/* C1. Header */}

        <Header />

        {/* C2. Dynamic Content (Overview, UserMgt, etc.) */}
        <div className="content-container" style={{ flex: 1, minHeight: 0 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
