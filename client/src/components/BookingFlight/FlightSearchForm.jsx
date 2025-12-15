import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Clock,
  Search,
} from "lucide-react";

const internationalAirports = [
  // --- Việt Nam ---
  { code: "HAN", name: "Hà Nội (Nội Bài)" },
  { code: "SGN", name: "TP.HCM (Tân Sơn Nhất)" },
  { code: "DAD", name: "Đà Nẵng" },
  { code: "CXR", name: "Nha Trang (Cam Ranh)" },
  { code: "PQC", name: "Phú Quốc" },
  { code: "HPH", name: "Hải Phòng (Cát Bi)" },
  // --- Đông Nam Á (Phổ biến nhất) ---
  { code: "BKK", name: "Bangkok (Suvarnabhumi) - Thái Lan" },
  { code: "DMK", name: "Bangkok (Don Mueang) - Thái Lan" },
  { code: "SIN", name: "Singapore (Changi) - Singapore" },
  { code: "KUL", name: "Kuala Lumpur - Malaysia" },
  { code: "DPS", name: "Bali (Ngurah Rai) - Indonesia" },
  { code: "MNL", name: "Manila (Ninoy Aquino) - Philippines" },
  { code: "PNH", name: "Phnom Penh - Campuchia" },
  { code: "REP", name: "Siem Reap - Campuchia" },
  { code: "VTE", name: "Vientiane (Wattay) - Lào" },
  { code: "RGN", name: "Yangon - Myanmar" },

  // --- Đông Bắc Á (Hàn, Nhật, Đài, Trung) ---
  { code: "ICN", name: "Seoul (Incheon) - Hàn Quốc" },
  { code: "PUS", name: "Busan (Gimhae) - Hàn Quốc" },
  { code: "NRT", name: "Tokyo (Narita) - Nhật Bản" },
  { code: "HND", name: "Tokyo (Haneda) - Nhật Bản" },
  { code: "KIX", name: "Osaka (Kansai) - Nhật Bản" },
  { code: "TPE", name: "Đài Bắc (Taoyuan) - Đài Loan" },
  { code: "KHH", name: "Cao Hùng - Đài Loan" },
  { code: "HKG", name: "Hồng Kông" },
  { code: "PVG", name: "Thượng Hải (Phố Đông) - TQ" },
  { code: "CAN", name: "Quảng Châu (Bạch Vân) - TQ" },

  // --- Châu Úc, Âu, Mỹ (Đường dài) ---
  { code: "SYD", name: "Sydney (Kingsford Smith) - Úc" },
  { code: "MEL", name: "Melbourne - Úc" },
  { code: "CDG", name: "Paris (Charles de Gaulle) - Pháp" },
  { code: "LHR", name: "London (Heathrow) - Anh" },
  { code: "FRA", name: "Frankfurt - Đức" },
  { code: "SFO", name: "San Francisco - Mỹ" },
  { code: "LAX", name: "Los Angeles - Mỹ" },
  { code: "JFK", name: "New York (John F. Kennedy) - Mỹ" },
  { code: "DXB", name: "Dubai - UAE" },
  { code: "DOH", name: "Doha (Hamad) - Qatar" },
];
const airportOptions = internationalAirports.map((airport) => ({
  value: airport.code,
  label: `${airport.name} (${airport.code})`, // Hiển thị tên kèm mã
}));

const glassSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: "transparent", // Nền trong suốt
    border: "none", // Bỏ viền mặc định
    boxShadow: "none", // Bỏ bóng
    minHeight: "auto",
    cursor: "pointer",
    color: "white",
    flexWrap: "nowrap",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0", // Bỏ padding thừa để text sát icon hơn
    flexWrap: "nowrap",
  }),
  singleValue: (base) => ({
    ...base,
    color: "inherit", // Lấy màu chữ từ input (thường là trắng hoặc đen tùy theme)
    fontWeight: 500,
  }),
  input: (base) => ({
    ...base,
    color: "inherit",
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af", // text-gray-400
  }),
  menu: (base) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.95)", // Nền menu thả xuống (hơi đục để dễ đọc)
    backdropFilter: "blur(10px)",
    borderRadius: "8px",
    width: "max-content", // Menu tự động rộng theo nội dung
    minWidth: "100%",
    zIndex: 9999,
    marginTop: "4px",
  }),
  option: (base, state) => ({
    ...base,
    color: "black", // Màu chữ trong danh sách thả xuống
    backgroundColor: state.isFocused ? "#e5e7eb" : "transparent", // Màu nền khi hover
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
};

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

  const handleSelectChange = (field, selectedOption) => {
    setParams({
      ...params,
      [field]: selectedOption ? selectedOption.value : "",
    });
  };
  const getValueObject = (code) => {
    return airportOptions.find((opt) => opt.value === code) || null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để tìm kiếm!");
      return;
    }

    const searchPayload = {
      from: params.from?.value || "", // Lấy code: "HAN"
      to: params.to?.value || "", // Lấy code: "SGN"
      date: params.date,
      time: params.time,
    };

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
          <div className="glass-input-wrapper flex items-center pr-2 overflow-hidden">
            <div className="pl-3 shrink-0">
              <PlaneTakeoff size={18} className="text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
              <Select
                options={airportOptions}
                // 3. Dùng helper để convert Code -> Object cho component hiển thị
                value={getValueObject(params.from)}
                onChange={(option) => handleSelectChange("from", option)}
                placeholder={t("booking.placeholders.from", "Chọn điểm đi...")}
                styles={glassSelectStyles}
                classNamePrefix="react-select"
                isClearable
                components={{
                  IndicatorSeparator: () => null,
                  DropdownIndicator: () => null,
                }}
              />
            </div>
          </div>
        </div>

        {/* Điểm đến */}
        <div className="input-group">
          <span className="input-label">{t("booking.to", "Điểm đến")}</span>
          <div className="glass-input-wrapper flex items-center pr-2 overflow-hidden">
            <div className="pl-3 shrink-0">
              <PlaneLanding size={18} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <Select
                options={airportOptions}
                // Dùng helper để convert Code -> Object
                value={getValueObject(params.to)}
                onChange={(option) => handleSelectChange("to", option)}
                placeholder={t("booking.placeholders.to", "Chọn điểm đến...")}
                styles={glassSelectStyles}
                components={{
                  IndicatorSeparator: () => null,
                  DropdownIndicator: () => null,
                }}
                isClearable
              />
            </div>
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
