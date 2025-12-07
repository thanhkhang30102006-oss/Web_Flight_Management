import React, { useState } from "react";
import { Header } from "../components/DashboardUser/header";
import StaffSidebar from "../components/DashBoardStaff/StaffSideBar";
// File CSS bố cục (đã tạo ở bước trước)
import "../pages/DashboardLayout.css";

/* --- KHU VỰC CÁC COMPONENT CON (Sau này nên tách ra file riêng) --- */

// 1. Quản lý chuyến bay (Tạo, Update, Xem chỗ)
const FlightManagement = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Quản lý chuyến bay</h2>
    <div
      className="action-buttons"
      style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
    >
      <button className="btn-primary">Thêm chuyến bay mới</button>
      <button className="btn-secondary">
        Cập nhật trạng thái (Delay/Cancel)
      </button>
    </div>
    <p>
      Bảng danh sách chuyến bay + Cột hiển thị % ghế (Load Factor) sẽ ở đây...
    </p>
  </div>
);

// 2. Nghiệp vụ vé (Tìm, Sửa, Hủy, Hoàn tiền)
const BookingOperations = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Tra cứu & Xử lý đặt chỗ</h2>
    <div className="search-box" style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Nhập mã đặt chỗ hoặc SĐT khách..."
        style={{ padding: "10px", borderRadius: "8px", width: "300px" }}
      />
      <button className="btn-search">Tìm kiếm</button>
    </div>
    <div className="features-grid">
      <div className="card">Đổi ngày bay/Ghế</div>
      <div className="card">Hủy vé & Hoàn tiền</div>
    </div>
  </div>
);

// 3. Báo cáo doanh thu
const RevenueReports = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Báo cáo doanh thu</h2>
    <div className="filters">
      <button>Theo Ngày</button> <button>Theo Tuần</button>{" "}
      <button>Theo Tháng</button>
    </div>
    <div
      className="chart-placeholder"
      style={{
        height: "300px",
        background: "rgba(0,0,0,0.2)",
        marginTop: "20px",
      }}
    >
      {/* Nơi vẽ biểu đồ ChartJS hoặc Recharts */}
      <p style={{ textAlign: "center", paddingTop: "130px" }}>
        Biểu đồ doanh thu hiển thị tại đây
      </p>
    </div>
  </div>
);

// 4. Chat hỗ trợ
const CustomerSupport = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Hỗ trợ trực tuyến</h2>
    <div className="chat-layout" style={{ display: "flex", gap: "20px" }}>
      <div className="user-list" style={{ width: "30%" }}>
        Danh sách khách đang chờ...
      </div>
      <div
        className="chat-window"
        style={{ width: "70%", height: "400px", border: "1px solid #ccc" }}
      >
        Khung chat
      </div>
    </div>
  </div>
);

const DashboardOverview = () => (
  <div className="glass-panel">
    <h2>Xin chào, Staff!</h2>
    <p>Chọn một chức năng bên trái để bắt đầu làm việc.</p>
  </div>
);

/* --- MAIN DASHBOARD COMPONENT --- */

const StaffDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Hàm điều hướng hiển thị nội dung
  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "flight-mgt":
        return <FlightManagement />;
      case "booking-mgt":
        return <BookingOperations />;
      case "revenue":
        return <RevenueReports />;
      case "support":
        return <CustomerSupport />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar bên trái */}
      <StaffSidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content bên phải */}
      <main className="main-content">
        <Header /> {/* Header dùng chung, tự hiện tên Staff */}
        <div className="content-body">{renderContent()}</div>
      </main>
    </div>
  );
};

export default StaffDashboard;
