import React, { useState } from "react";
import { Header } from "../components/DashboardUser/header";
import AdminSidebar from "../components/DashBoardStaff/AdminSideBar";
// File CSS bố cục (đã tạo ở bước trước)
import "../pages/DashboardLayout.css";

const UserRoleManagement = () => (
  <div className="glass-panel fade-in">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 className="panel-title">Quản lý Tài khoản & Phân quyền</h2>
      <button className="btn-primary">+ Tạo nhân viên mới</button>
    </div>

    <div
      className="filter-bar"
      style={{ margin: "20px 0", display: "flex", gap: "10px" }}
    >
      <select className="glass-input">
        <option>Tất cả vai trò</option>
        <option>Kế toán</option>
        <option>Nhân viên vé</option>
        <option>Khách hàng</option>
      </select>
      <input
        type="text"
        placeholder="Tìm theo tên/email..."
        className="glass-input"
      />
    </div>

    {/* Bảng giả lập */}
    <div className="table-responsive">
      <table
        className="glass-table"
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nguyễn Văn A</td>
            <td>a@flighthk.com</td>
            <td>
              <span className="badge badge-blue">Kế toán</span>
            </td>
            <td>Active</td>
            <td>
              <button className="btn-sm">Sửa</button>{" "}
              <button className="btn-sm btn-danger">Xóa</button>
            </td>
          </tr>
          <tr>
            <td>Trần Thị B</td>
            <td>b@flighthk.com</td>
            <td>
              <span className="badge badge-green">NV Vé</span>
            </td>
            <td>Active</td>
            <td>
              <button className="btn-sm">Sửa</button>{" "}
              <button className="btn-sm btn-danger">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// 2. Quản lý Mẫu Email
const EmailTemplateManager = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Cấu hình Email Tự động</h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {/* Danh sách mẫu */}
      <div className="template-list">
        <div className="card active">Email Xác nhận đặt vé</div>
        <div className="card">Email Thông báo Hủy chuyến</div>
        <div className="card">Email Quên mật khẩu</div>
        <div className="card">Email Chúc mừng sinh nhật</div>
      </div>

      {/* Trình chỉnh sửa */}
      <div className="editor-area">
        <label>Tiêu đề Email:</label>
        <input
          type="text"
          className="glass-input"
          defaultValue="[FlightHK] Xác nhận vé của bạn - #MÃ_VÉ"
        />

        <label style={{ marginTop: "10px", display: "block" }}>
          Nội dung HTML:
        </label>
        <textarea
          className="glass-input"
          style={{ height: "300px", fontFamily: "monospace" }}
          defaultValue="<p>Xin chào {CustomerName},</p><p>Cảm ơn bạn đã đặt vé...</p>"
        />
        <button className="btn-primary" style={{ marginTop: "15px" }}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
);

// 3. System Logs & Monitoring
const SystemLogsMonitor = () => (
  <div className="glass-panel fade-in">
    <h2 className="panel-title">Theo dõi hệ thống & Logs</h2>

    <div
      className="stats-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "15px",
        marginBottom: "20px",
      }}
    >
      <div className="stat-card ok">
        <h3>Account Validity</h3>
        <p>100% Valid</p>
      </div>
      <div className="stat-card warning">
        <h3>Pending Errors</h3>
        <p>3 Issues</p>
      </div>
      <div className="stat-card info">
        <h3>Last Patch</h3>
        <p>Version 1.0.2</p>
      </div>
    </div>

    <div
      className="logs-terminal"
      style={{
        background: "#000",
        color: "#0f0",
        padding: "15px",
        borderRadius: "8px",
        fontFamily: "monospace",
        height: "300px",
        overflowY: "scroll",
      }}
    >
      <p>[2023-10-20 10:00:01] INFO: System started successfully.</p>
      <p>
        [2023-10-20 10:05:22] WARN: User ID 9932 login attempt failed (Wrong
        Password).
      </p>
      <p>
        [2023-10-20 10:15:00] INFO: CronJob "CheckExpiredBookings" executed.
      </p>
      <p>[2023-10-20 10:20:11] ERROR: Payment Gateway Timeout (Retry 1/3)...</p>
      <p>[2023-10-20 10:20:15] INFO: Patch 1.0.3 ready to deploy...</p>
    </div>
    <div style={{ marginTop: "15px" }}>
      <button className="btn-secondary">Quét toàn bộ tài khoản</button>
      <button className="btn-primary" style={{ marginLeft: "10px" }}>
        Vá lỗi hệ thống (Hot Fix)
      </button>
    </div>
  </div>
);

const AdminOverview = () => (
  <div className="glass-panel">
    <h2>Xin chào Administrator</h2>
    <p>Hệ thống đang hoạt động ổn định.</p>
  </div>
);

/* --- MAIN ADMIN DASHBOARD --- */

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <AdminOverview />;
      case "user-mgt":
        return <UserRoleManagement />;
      case "email-tpl":
        return <EmailTemplateManager />;
      case "system-logs":
        return <SystemLogsMonitor />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Admin */}
      <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content */}
      <main className="main-content">
        <Header /> {/* Header dùng chung, tự hiện tên Admin */}
        <div className="content-body">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
