import React, { useState, useEffect } from "react";
import { X, Save, Clock, Calendar, AlertTriangle } from "lucide-react";

const EditFlightStatusModal = ({ isOpen, onClose, flight, onSave }) => {
  const [formData, setFormData] = useState({
    flightState: "active",
    departureDay: "",
    departureTime: "",
    arriveDay: "",
    arriveTime: "",
    reason: "", // Lý do thay đổi
  });

  // Khi mở modal, điền dữ liệu của chuyến bay vào form
  useEffect(() => {
    if (flight) {
      setFormData({
        flightState: flight.flightState || "active",
        // Cắt chuỗi để lấy đúng định dạng yyyy-MM-dd và HH:mm cho input HTML
        departureDay: flight.departureDay
          ? flight.departureDay.split("T")[0]
          : "",
        departureTime: flight.departureTime
          ? flight.departureTime.slice(0, 5)
          : "",
        arriveDay: flight.arriveDay ? flight.arriveDay.split("T")[0] : "",
        arriveTime: flight.arriveTime ? flight.arriveTime.slice(0, 5) : "",
        reason: "", // Reset lý do mỗi khi mở mới
      });
    }
  }, [flight, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert("Vui lòng nhập lý do thay đổi!");
      return;
    }
    // Gửi dữ liệu ngược lại cho component cha
    onSave({ ...flight, ...formData });
  };

  return (
    <div className="modal-overlay">
      <div
        className="flightstaff-modal-content glass-panel"
        style={{ maxWidth: "600px" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            Cập nhật chuyến bay:{" "}
            <span style={{ color: "#3b82f6" }}>{flight?.flightNumber}</span>
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 1. Trạng thái */}
          <div className="form-group">
            <label>Trạng thái chuyến bay</label>
            <select
              name="flightState"
              value={formData.flightState}
              onChange={handleChange}
              className="custom-select"
              style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
            >
              <option value="active">Active (Hoạt động)</option>
              <option value="delayed">Delayed (Hoãn)</option>
              <option value="cancelled">Cancelled (Hủy)</option>
            </select>
          </div>

          {/* 2. Thời gian Khởi hành */}
          <div className="row-2-input">
            <div className="form-group">
              <label>
                <Calendar size={14} /> Ngày khởi hành
              </label>
              <input
                type="date"
                name="departureDay"
                value={formData.departureDay}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <Clock size={14} /> Giờ khởi hành
              </label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* 3. Thời gian Đến */}
          <div className="row-2-input">
            <div className="form-group">
              <label>
                <Calendar size={14} /> Ngày đến
              </label>
              <input
                type="date"
                name="arriveDay"
                value={formData.arriveDay}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <Clock size={14} /> Giờ đến
              </label>
              <input
                type="time"
                name="arriveTime"
                value={formData.arriveTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* 4. Lý do thay đổi (Bắt buộc) */}
          <div className="form-group">
            <label style={{ color: "#f87171" }}>
              <AlertTriangle size={14} style={{ marginRight: 5 }} />
              Lý do thay đổi (Bắt buộc)
            </label>
            <textarea
              name="reason"
              rows="3"
              placeholder="Ví dụ: Thời tiết xấu, bảo trì kỹ thuật..."
              value={formData.reason}
              onChange={handleChange}
              className="form-input"
              style={{ width: "100%", padding: "10px" }}
              required
            ></textarea>
          </div>

          <div
            className="modal-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFlightStatusModal;
