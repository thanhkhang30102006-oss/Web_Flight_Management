import React, { useState, useEffect } from "react";
import { Header } from "../components/DashboardUser/header";
import StaffSidebar from "../components/DashBoardStaff/StaffSideBar";
import videoWallpaper from "../assets//videos/backgroud-wallpaper-staff.mp4";

// File CSS bố cục (đã tạo ở bước trước)
import "./StaffDashboard.css";
import DashboardOverview from "../components/DashBoardStaff/DashboardOverview";
import FlightManagement from "../components/DashBoardStaff/FlightManagement";
import BookingOperations from "../components/DashBoardStaff/BookingOperations";
import RevenueReports from "../components/DashBoardStaff/RevenueReports";
import CustomerSupport from "../components/DashBoardStaff/CustomerSupport";
import FlightScheduleMap from "../components/DashBoardStaff/FlightScheduleMap";
import FlightReport from "../components/DashBoardStaff/FlightReport";

// Dữ liệu mô phỏng bảng `flightinformations`
const StaffDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Hàm render nội dung dựa trên tab được chọn
  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardOverview />;

      // Nhóm Flight Management
      case "flight-mgt":
      case "flight-create-update":
        return <FlightManagement />;

      case "flight-report":
        return <FlightReport />;
      case "flight-schedule-map":
        return <FlightScheduleMap />;
      // Nhóm Booking Operations
      case "booking-ops":
      case "booking-search":
      case "booking-change":
      case "booking-cancel":
      case "booking-refund":
        return <BookingOperations />;

      // Nhóm Revenue
      case "revenue":
      case "report-daily":
      case "report-weekly":
      case "report-monthly":
        return <RevenueReports />;

      // Nhóm Support
      case "support":
        return <CustomerSupport />;

      default:
        return <DashboardOverview />;
    }
  };
  return (
    <div className="dashboard-layout">
      {/* Background Video */}
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        {/* Fallback nếu không chạy được */}
        <source src={videoWallpaper} type="video/mp4" />
      </video>

      {/* Lớp phủ mờ */}
      <div className="dashboard-video-overlay"></div>

      {/* Sidebar */}
      <StaffSidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Nội dung chính */}
      <main className="main-content">
        <Header />
        <div className="content-container">{renderContent()}</div>
      </main>
    </div>
  );
};

export default StaffDashboard;
