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
    passengers: 1,
  });

  const handleChange = (e) =>
    setParams({ ...params, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(params);
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
              name="departureTime"
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
