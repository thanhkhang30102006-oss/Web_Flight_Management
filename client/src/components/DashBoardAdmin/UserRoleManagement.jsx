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

const UserRoleManagement = () => {
  const [activeTab, setActiveTab] = useState("passenger"); // 'passenger' | 'staff'
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý danh sách (để demo chức năng sửa/xóa)
  const [passengers, setPassengers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // State Modal tạo nhân viên
  const [isStaffModalOpen, setStaffModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStaff, setNewStaff] = useState({
    staffID: "",
    staffName: "",
    staffAccountName: "",
    emailPrivate: "",
    staffPosition: "staff",
  });

  // --- LOGIC PASSENGER ---
  const fetchPassengers = async () => {
    try {
      const response = await fetch(`api/admin/passengers`);
      const dataRes = await response.json();

      if (dataRes && dataRes.success) {
        setPassengers(dataRes.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách khách:", error);
    }
  };
  // Hàm mở khóa / khóa tài khoản khách hàng
  const togglePassengerState = async (id, currentState) => {
    const actionName = currentState === "active" ? "KHÓA" : "MỞ KHÓA";
    const confirm = window.confirm(
      `Bạn có chắc chắn muốn ${actionName} tài khoản khách hàng này?`
    );
    if (!confirm) return;
    const url =
      currentState === "active"
        ? `api/admin/updateStateLock`
        : `api/admin/updateStateUnLock`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerID: id }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchPassengers(); // Load lại danh sách
      } else {
        alert("Thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi đổi trạng thái khách:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  // --- LOGIC STAFF ---

  const fetchStaffs = async () => {
    try {
      const response = await fetch(`api/admin/staffs`);
      const dataRes = await response.json();

      if (dataRes && dataRes.success) {
        setStaffs(dataRes.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách staff:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "passenger") {
      fetchPassengers();
    } else {
      fetchStaffs();
    }
  }, [activeTab]);
  const handleCreateStaff = async (e) => {
    e.preventDefault();

    // Validate
    if (!newStaff.staffName || !newStaff.staffAccountName) {
      alert("Vui lòng điền đầy đủ tên và tên tài khoản!");
      setIsSubmitting(false);
      return;
    }
    const confirm = window.confirm(
      `Xác nhận tạo nhân viên: ${newStaff.staffName}?`
    );
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`api/admin/staff/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: newStaff }),
      });
      const data = await res.json();
      // Tạo object nhân viên mới với cấu trúc staffID, staffName...
      if (data.success) {
        alert(data.message);
        setStaffModalOpen(false);
        fetchStaffs();
        // Reset form
        setNewStaff({
          staffID: "",
          staffName: "",
          staffAccountName: "",
          emailPrivate: "",
          staffPosition: "staff",
        });
      } else {
        alert(data.message || "Tạo thất bại");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteStaff = async (staffID, staffName) => {
    // Confirm xóa
    const confirm = window.confirm(
      `CẢNH BÁO: Bạn có chắc muốn XÓA nhân viên "${staffName}" (ID: ${staffID}) không?\nHành động này không thể hoàn tác.`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`api/admin/staff/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffID: staffID }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Đã xóa thành công.");
        fetchStaffs();
      } else {
        alert("Xóa thất bại: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối server khi xóa.");
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
              {passengers.length > 0 ? (
                passengers
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
                            <div
                              style={{ fontSize: "12px", color: "#f2f2f2ff" }}
                            >
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
                            onClick={() =>
                              togglePassengerState(
                                p.passengerID,
                                p.passengerState
                              )
                            }
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
                            onClick={() =>
                              togglePassengerState(
                                p.passengerID,
                                p.passengerState
                              )
                            }
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
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
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
                      onClick={() => handleDeleteStaff(s.staffID, s.staffName)}
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
              {/**INPUT 4: emailStaff */}
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Email tài khoản (Email Account)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ width: "100%", marginTop: "5px" }}
                  value={newStaff.emailPrivate}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      emailPrivate: e.target.value,
                    })
                  }
                  placeholder="VD: abcd@gamil.com"
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
