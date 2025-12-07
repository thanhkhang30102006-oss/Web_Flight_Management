import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Clock,
  Search,
} from "lucide-react";

const FlightSearchForm = ({ onSearch }) => {
  const { t } = useTranslation();
  const [params, setParams] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const handleChange = (e) =>
    setParams({ ...params, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để tìm kiếm!");
      return;
    }
    const searchResponse = await fetch(`api/user/booking/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),

      credentials: "include",
    });
    const data = await searchResponse.json();

    if (!searchResponse.ok) {
      alert(data.message);
      const errorText = await searchResponse.text();
      console.error("Lỗi từ Server:", errorText);
      alert(
        `Lỗi tìm kiếm (${searchResponse.status}): Vui lòng kiểm tra lại thông tin.`
      );
      return;
    }
    if (Array.isArray(data)) {
      onSearch(data);
    }
  };

  return (
    <div className="glass-panel-box">
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Điểm đi */}
        <div className="input-group">
          <span className="input-label">{t("booking.from", "Điểm đi")}</span>
          <div className="glass-input-wrapper">
            <PlaneTakeoff size={18} className="text-gray-400" />
            <input
              className="glass-input"
              name="from"
              placeholder={t("booking.placeholders.from", "Hà Nội (HAN)")}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Điểm đến */}
        <div className="input-group">
          <span className="input-label">{t("booking.to", "Điểm đến")}</span>
          <div className="glass-input-wrapper">
            <PlaneLanding size={18} className="text-gray-400" />
            <input
              className="glass-input"
              name="to"
              placeholder={t("booking.placeholders.to", "Đà Nẵng (DAD)")}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Ngày đi */}
        <div className="input-group">
          <span className="input-label">{t("booking.date", "Ngày đi")}</span>
          <div className="glass-input-wrapper">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              className="glass-input"
              name="date"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <span className="input-label">
            {t("booking.departureTime", "Giờ đi")}
          </span>
          <div className="glass-input-wrapper">
            <Clock size={18} className="text-gray-400" />
            <input
              type="time"
              className="glass-input"
              name="time"
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="search-submit-btn">
          <Search size={18} /> {t("booking.search", "Tìm")}
        </button>
      </form>
    </div>
  );
};

export default FlightSearchForm;
