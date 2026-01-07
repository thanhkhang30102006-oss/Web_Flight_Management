import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X, Save, Plane, Calendar, Clock, MapPin, Hash } from "lucide-react";
import "../../pages/StaffDashboard.css";
import "./CreateFlightModal.css";
import { AIRPORT_LIST, AIRCRAFT_TYPES } from "../../utils/AirportData";
const CreateFlightModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
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
    // Validate dữ liệu trống
    if (!formData.flightNumber || !formData.departureDay) {
      toast.error(t("flight_modal.error_missing_info"));
      return;
    }

    // Validate logic: Điểm đi và đến trùng nhau
    if (formData.departurePoint === formData.arrivePoint) {
      toast.error(t("flight_modal.error_duplicate_data"));
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="flightstaff-modal-content glass-panel">
        {/* Header */}
        <div className="flightstaff-modal-header">
          <h2 className="flightstaff-panel-title" style={{ marginBottom: 0 }}>
            <Plane size={24} style={{ marginRight: 30 }} />
            {t("flight_modal.title")}
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
              <label>{t("flight_modal.lbl_flight_num")}</label>{" "}
              <div className="input-with-icon">
                <Hash size={16} />
                <input
                  type="text"
                  name="flightNumber"
                  placeholder={t("flight_modal.placeholder_flight_num")}
                  value={formData.flightNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* SELECT: LOẠI MÁY BAY */}
            <div className="form-group">
              <label>{t("flight_modal.lbl_plane_type")}</label>{" "}
              <div className="input-with-icon">
                <Plane size={16} />
                <select
                  name="planeType"
                  value={formData.planeType}
                  onChange={handleChange}
                  className="custom-select"
                >
                  {AIRCRAFT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t("flight_modal.lbl_total_seat")}</label>{" "}
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
              <label>{t("flight_modal.lbl_dep_point")}</label>{" "}
              <div className="input-with-icon">
                <MapPin size={16} className="text-blue" />
                <select
                  name="departurePoint"
                  value={formData.departurePoint}
                  onChange={handleChange}
                  className="custom-select"
                >
                  {AIRPORT_LIST.map((airport) => (
                    <option
                      key={airport.code}
                      value={airport.code}
                      disabled={airport.code === formData.arrivePoint}
                    >
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="arrow-separator">➝</div>
            <div className="form-group">
              <label>{t("flight_modal.lbl_arr_point")}</label>{" "}
              <div className="input-with-icon">
                <MapPin size={16} className="text-green" />
                <select
                  name="arrivePoint"
                  value={formData.arrivePoint}
                  onChange={handleChange}
                  className="custom-select"
                >
                  {AIRPORT_LIST.map((airport) => (
                    <option
                      key={airport.code}
                      value={airport.code}
                      // Disable nếu trùng với điểm ĐI hiện tại
                      disabled={airport.code === formData.departurePoint}
                    >
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Hàng 3: Thời gian Khởi hành */}
          <div className="form-section-label">
            {t("flight_modal.lbl_dep_time")}
          </div>{" "}
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
          <div className="form-section-label">
            {t("flight_modal.lbl_arr_time")}
          </div>{" "}
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
              {t("flight_modal.btn_cancel")}{" "}
            </button>
            <button type="submit" className="btn-save">
              <Save size={18} /> {t("flight_modal.btn_save")}{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFlightModal;
