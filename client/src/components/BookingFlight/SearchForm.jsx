import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Đảm bảo bạn đã config i18n
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  Search,
  Clock,
} from "lucide-react";

const FlightSearchForm = () => {
  const { t } = useTranslation();

  // State khớp với tên trường trong CSDL của bạn
  const [searchParams, setSearchParams] = useState({
    departurePoint: "",
    arrivePoint: "",
    departureDay: "",
    departureTime: "",
    passengerCount: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", searchParams);
    // Gọi API tìm kiếm tại đây
  };

  return (
    <div className="search-card">
      <h2 className="form-title">{t("Tìm kiếm chuyến bay")}</h2>

      <form onSubmit={handleSubmit}>
        {/* Điểm đi - departurePoint */}
        <div className="input-wrapper">
          <PlaneTakeoff size={18} className="input-icon" />
          <input
            type="text"
            name="departurePoint"
            placeholder={t("Điểm đi (VD: Hà Nội)")}
            value={searchParams.departurePoint}
            onChange={handleChange}
            required
          />
        </div>

        {/* Điểm đến - arrivePoint */}
        <div className="input-wrapper">
          <PlaneLanding size={18} className="input-icon" />
          <input
            type="text"
            name="arrivePoint"
            placeholder={t("Điểm đến (VD: Đà Nẵng)")}
            value={searchParams.arrivePoint}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nhóm Ngày và Giờ (Có thể để chung hoặc tách riêng tuỳ CSS của bạn) */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Ngày đi - departureDay */}
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Calendar size={18} className="input-icon" />
            <input
              type="date"
              name="departureDay"
              placeholder={t("Ngày đi")}
              value={searchParams.departureDay}
              onChange={handleChange}
              required
              className={!searchParams.departureDay ? "empty-date" : ""}
            />
          </div>

          {/* Giờ đi - departureTime */}
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Clock size={18} className="input-icon" />
            <input
              type="time"
              name="departureTime"
              placeholder={t("Giờ đi")}
              value={searchParams.departureTime}
              onChange={handleChange}
              // Giờ đi có thể không bắt buộc tuỳ logic của bạn, nếu bắt buộc thêm required
            />
          </div>
        </div>

        {/* Số lượng hành khách */}

        <button type="submit" className="submit-btn">
          <Search size={18} style={{ marginRight: "8px" }} />
          {t("Tìm Chuyến Bay")}
        </button>
      </form>
    </div>
  );
};

export default FlightSearchForm;
