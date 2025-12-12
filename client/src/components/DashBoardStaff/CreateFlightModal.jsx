import React, { useState } from "react";
import { X, Save, Plane, Calendar, Clock, MapPin, Hash } from "lucide-react";
import "../../pages/StaffDashboard.css";
import "./CreateFlightModal.css";
const CreateFlightModal = ({ isOpen, onClose, onSave }) => {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    flightNumber: "",
    departurePoint: "HAN",
    arrivePoint: "SGN",
    departureDay: "",
    departureTime: "",
    arriveDay: "",
    arriveTime: "",
    planeType: "Boeing 787",
    flightTotalSeat: 300,
    flightState: "active",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate cơ bản
    if (!formData.flightNumber || !formData.departureDay) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content glass-panel">
        {/* Header */}
        <div className="modal-header">
          <h2 className="panel-title" style={{ marginBottom: 0 }}>
            <Plane size={24} style={{ marginRight: 30 }} />
            Tạo chuyến bay mới
          </h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flight-form">
          {/* Hàng 1: Số hiệu & Máy bay */}
          <div className="form-row">
            <div className="form-group">
              <label>Số hiệu chuyến bay</label>
              <div className="input-with-icon">
                <Hash size={16} />
                <input
                  type="text"
                  name="flightNumber"
                  placeholder="VN..."
                  value={formData.flightNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Loại tàu bay</label>
              <div className="input-with-icon">
                <Plane size={16} />
                <select
                  name="planeType"
                  value={formData.planeType}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="Boeing 787">Boeing 787</option>
                  <option value="Airbus A321">Airbus A321</option>
                  <option value="Airbus A350">Airbus A350</option>
                  <option value="Embraer 190">Embraer 190</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Tổng ghế</label>
              <input
                type="number"
                name="flightTotalSeat"
                value={formData.flightTotalSeat}
                onChange={handleChange}
                style={{ width: "100px" }}
              />
            </div>
          </div>

          {/* Hàng 2: Hành trình */}
          <div className="form-row">
            <div className="form-group">
              <label>Điểm đi (Departure)</label>
              <div className="input-with-icon">
                <MapPin size={16} className="text-blue" />
                <select
                  name="departurePoint"
                  value={formData.departurePoint}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="HAN">Hà Nội (HAN)</option>
                  <option value="SGN">TP.HCM (SGN)</option>
                  <option value="DAD">Đà Nẵng (DAD)</option>
                  <option value="PQC">Phú Quốc (PQC)</option>
                </select>
              </div>
            </div>
            <div className="arrow-separator">➝</div>
            <div className="form-group">
              <label>Điểm đến (Arrival)</label>
              <div className="input-with-icon">
                <MapPin size={16} className="text-green" />
                <select
                  name="arrivePoint"
                  value={formData.arrivePoint}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="SGN">TP.HCM (SGN)</option>
                  <option value="HAN">Hà Nội (HAN)</option>
                  <option value="DAD">Đà Nẵng (DAD)</option>
                  <option value="PQC">Phú Quốc (PQC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hàng 3: Thời gian Khởi hành */}
          <div className="form-section-label">Thời gian Khởi hành</div>
          <div className="form-row">
            <div className="form-group">
              <div className="input-with-icon">
                <Calendar size={16} />
                <input
                  type="date"
                  name="departureDay"
                  value={formData.departureDay}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-with-icon">
                <Clock size={16} />
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Hàng 4: Thời gian Hạ cánh */}
          <div className="form-section-label">Thời gian Hạ cánh (Dự kiến)</div>
          <div className="form-row">
            <div className="form-group">
              <div className="input-with-icon">
                <Calendar size={16} />
                <input
                  type="date"
                  name="arriveDay"
                  value={formData.arriveDay}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-with-icon">
                <Clock size={16} />
                <input
                  type="time"
                  name="arriveTime"
                  value={formData.arriveTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-save">
              <Save size={18} /> Lưu chuyến bay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFlightModal;
