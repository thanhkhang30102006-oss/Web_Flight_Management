import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Shield,
  Lock,
  Unlock,
  Plus,
  UserCheck,
  Briefcase,
  X,
  Mail,
  Phone,
} from "lucide-react";
import "./UserRoleManagement.css";

// --- MOCK DATA PASSENGERS ---
const MOCK_PASSENGERS = [
  {
    passengerID: "PSG001",
    passengerName: "Nguyễn Văn An",
    passengerEmail: "an.nguyen@example.com",
    passengerMobile: "0909111222",
    passengerNationality: "Vietnam",
    passengerPassport: "B1234567",
    passengerState: "active", // Trạng thái bình thường
  },
  {
    passengerID: "PSG002",
    passengerName: "Tran Thi Binh",
    passengerEmail: "binh.tran@example.com",
    passengerMobile: "0909333444",
    passengerNationality: "Vietnam",
    passengerPassport: "C9876543",
    passengerState: "blocked", // Bị khóa do sai pass
  },
];

// --- MOCK DATA STAFF ---
const MOCK_STAFF = [
  {
    staffID: "25HIEUDZ1231",
    staffName: "Admin User",
    staffAccountName: "admin@flighthk.com",
    staffPosition: "admin",
    status: "active",
  },
  {
    staffID: "25HIEUDZ1231",
    staffName: "Le Van Ke Toan",
    staffAccountName: "ketoan",
    staffPosition: "accountant",
    status: "active",
  },
];
const UserRoleManagement = () => {
  const [activeTab, setActiveTab] = useState("passenger"); // 'passenger' | 'staff'
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý danh sách (để demo chức năng sửa/xóa)
  const [passengers, setPassengers] = useState(MOCK_PASSENGERS);
  const [staffs, setStaffs] = useState(MOCK_STAFF);

  // State Modal tạo nhân viên
  const [isStaffModalOpen, setStaffModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStaff, setNewStaff] = useState({
    staffID: "",
    staffName: "",
    staffAccountName: "",
    staffPosition: "staff",
  });

  // --- LOGIC PASSENGER ---

  // Hàm mở khóa / khóa tài khoản khách hàng
  const togglePassengerState = (id) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.passengerID === id) {
          // Nếu đang active thì block, đang blocked thì active (Unblock)
          return {
            ...p,
            passengerState:
              p.passengerState === "active" ? "blocked" : "active",
          };
        }
        return p;
      })
    );
  };

  // --- LOGIC STAFF ---
  // Sửa lại chỗ này nhé Khang
  /*
  const createdStaff = {
        staffID: staffs.length + 1, // Giả lập ID tự tăng
        staffName: newStaff.staffName,
        staffAccountName: newStaff.staffAccountName,
        staffPosition: newStaff.staffPosition,
        status: "active",
      };
      */
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    if (!newStaff.staffName || !newStaff.staffAccountName) {
      alert("Vui lòng điền đầy đủ tên và tên tài khoản!");
      setIsSubmitting(false);
      return;
    }

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Tạo object nhân viên mới với cấu trúc staffID, staffName...
      const createdStaff = {
        staffID: newStaff.staffID,
        staffName: newStaff.staffName,
        staffAccountName: newStaff.staffAccountName,
        staffPosition: newStaff.staffPosition,
        status: "active",
      };

      setStaffs((prev) => [...prev, createdStaff]);

      alert(
        `Đã tạo tài khoản: ${createdStaff.staffAccountName}\nMật khẩu đã gửi về email.`
      );
      setStaffModalOpen(false);

      // Reset form với các trường mới
      setNewStaff({
        staffID: "",
        staffName: "",
        staffAccountName: "",
        staffPosition: "staff",
      });
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* 1. HEADER & TABS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2 className="panel-title">Quản lý Tài khoản</h2>

        {/* Nút thêm nhân viên chỉ hiện ở tab Staff */}
        {activeTab === "staff" && (
          <button
            className="btn-primary"
            onClick={() => setStaffModalOpen(true)}
          >
            <Plus size={18} /> Thêm nhân viên
          </button>
        )}
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "passenger" ? "active" : ""}`}
          onClick={() => setActiveTab("passenger")}
        >
          <Users size={18} /> Khách hàng (Passengers)
        </button>
        <button
          className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          <Shield size={18} /> Nhân viên (Staff)
        </button>
      </div>

      {/* 2. TOOLBAR (SEARCH) */}
      <div
        className="filter-bar glass-panel"
        style={{
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
        }}
      >
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder={
              activeTab === "passenger"
                ? "Tìm theo tên, email, passport..."
                : "Tìm nhân viên..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "white",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div
        className="table-responsive glass-panel"
        style={{ flex: 1, padding: 0, overflow: "hidden" }}
      >
        {/* === TAB 1: PASSENGERS === */}
        {activeTab === "passenger" && (
          <table className="glass-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Thông tin hành khách</th>
                <th>Liên hệ</th>
                <th>Passport / Quốc tịch</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {passengers
                .filter((p) =>
                  p.passengerName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((p) => (
                  <tr key={p.passengerID}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: "50%",
                            background: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Users size={18} color="white" />
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                            {p.passengerName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#f2f2f2ff" }}>
                            ID: {p.passengerID}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>
                        <Mail size={12} /> {p.passengerEmail}
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        <Phone size={12} /> {p.passengerMobile}
                      </div>
                    </td>
                    <td>
                      <div>{p.passengerPassport}</div>
                      <div style={{ fontSize: "12px", color: "#f2f2f2ff" }}>
                        {p.passengerNationality}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${p.passengerState === "active" ? "badge-active" : "badge-blocked"}`}
                      >
                        {p.passengerState === "active"
                          ? "Hoạt động"
                          : "Đang Khóa"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {p.passengerState === "blocked" ? (
                        <button
                          className="btn-action"
                          title="Mở khóa tài khoản"
                          onClick={() => togglePassengerState(p.passengerID)}
                          style={{
                            background: "rgba(34, 197, 94, 0.2)",
                            color: "#4ade80",
                          }}
                        >
                          <Unlock size={16} /> Mở khóa
                        </button>
                      ) : (
                        <button
                          className="btn-action"
                          title="Khóa tài khoản"
                          onClick={() => togglePassengerState(p.passengerID)}
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                          }}
                        >
                          <Lock size={16} /> Khóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* === TAB 2: STAFF === */}
        {activeTab === "staff" && (
          <table className="glass-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên nhân viên</th>
                <th>Tên tài khoản (Account)</th>
                <th>Chức vụ (Position)</th>
                <th style={{ textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((s) => (
                <tr key={s.staffID}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Briefcase size={16} color="white" />
                      </div>
                      <strong>{s.staffID}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{s.staffName}</strong>
                  </td>
                  <td>{s.staffAccountName}</td>
                  <td>
                    <span
                      className="badge badge-active"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                      }}
                    >
                      {s.staffPosition === "admin"
                        ? "Quản trị viên"
                        : s.staffPosition === "accountant"
                          ? "Kế toán"
                          : "Nhân viên vé"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn-action"
                      style={{ color: "#ffffffff" }}
                    >
                      <X size={16} /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL TẠO NHÂN VIÊN --- */}
      {isStaffModalOpen && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setStaffModalOpen(false)}
          ></div>
          <div className="staff-modal fade-in-up">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Tạo nhân viên mới</h3>
              <button
                onClick={() => setStaffModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleCreateStaff}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* INPUT 0: staffID */}
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Nhân viên ID (Staff ID)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ width: "100%", marginTop: "5px" }}
                  value={newStaff.staffID}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, staffID: e.target.value })
                  }
                  placeholder="VD: 25STF001"
                  required
                />
              </div>
              {/* INPUT 1: staffName */}
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Họ và tên (Staff Name)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ width: "100%", marginTop: "5px" }}
                  value={newStaff.staffName}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, staffName: e.target.value })
                  }
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              {/* INPUT 2: staffAccountName */}
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Tên tài khoản (Account Name)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ width: "100%", marginTop: "5px" }}
                  value={newStaff.staffAccountName}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      staffAccountName: e.target.value,
                    })
                  }
                  placeholder="VD: Staff_A"
                  required
                />
              </div>

              {/* INPUT 3: staffPosition */}
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Chức vụ (Position)
                </label>
                <select
                  className="glass-input"
                  style={{ width: "100%", marginTop: "5px" }}
                  value={newStaff.staffPosition}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, staffPosition: e.target.value })
                  }
                >
                  <option value="staff" style={{ color: "black" }}>
                    Nhân viên vé (Staff)
                  </option>
                  <option value="accountant" style={{ color: "black" }}>
                    Kế toán (Accountant)
                  </option>
                  <option value="admin" style={{ color: "black" }}>
                    Quản trị viên (Admin)
                  </option>
                </select>
              </div>

              <div
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#93c5fd",
                  border: "1px dashed rgba(59, 130, 246, 0.4)",
                }}
              >
                <p style={{ margin: 0 }}>
                  ℹ️ Mật khẩu mặc định sẽ được gửi qua email liên kết với tài
                  khoản này.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: "10px", justifyContent: "center" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <UserCheck size={18} /> Tạo tài khoản
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default UserRoleManagement;
