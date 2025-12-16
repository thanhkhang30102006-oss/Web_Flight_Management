import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Clock,
  Search,
} from "lucide-react";

const internationalAirports = [
  // Mien Bac
  { code: "HAN", name: "Hà Nội (Nội Bài)" },
  { code: "HPH", name: "Hải Phòng (Cát Bi)" },
  { code: "VDO", name: "Vân Đồn (Quảng Ninh)" },
  { code: "THD", name: "Thanh Hóa (Thọ Xuân)" },
  { code: "VII", name: "Vinh (Nghệ An)" },
  { code: "DIN", name: "Điện Biên Phủ" },
  // Mien Trung
  { code: "DAD", name: "Đà Nẵng" },
  { code: "HUI", name: "Huế (Phú Bài)" },
  { code: "CXR", name: "Nha Trang (Cam Ranh)" },
  { code: "UIH", name: "Quy Nhơn (Phù Cát)" },
  { code: "VCL", name: "Quảng Nam (Chu Lai)" },
  { code: "VDH", name: "Đồng Hới (Quảng Bình)" },
  { code: "TBB", name: "Tuy Hòa (Phú Yên)" },
  // Tay NGuyen
  { code: "DLI", name: "Đà Lạt (Liên Khương)" },
  { code: "BMV", name: "Buôn Ma Thuột" },
  { code: "PXU", name: "Pleiku (Gia Lai)" },
  //  Miền Nam
  { code: "SGN", name: "TP.HCM (Tân Sơn Nhất)" },
  { code: "PQC", name: "Phú Quốc" },
  { code: "VCA", name: "Cần Thơ" },
  { code: "VCS", name: "Côn Đảo" },
  { code: "VKG", name: "Rạch Giá (Kiên Giang)" },
  { code: "CAH", name: "Cà Mau" },
];
const airportOptions = internationalAirports.map((airport) => ({
  value: airport.code,
  label: `${airport.name} (${airport.code})`,
}));

const glassSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: "transparent",
    border: "none",
    boxShadow: "none",
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
      toast.error("Bạn cần đăng nhập để tìm kiếm!");
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
      toast.error(data.message);
      const errorText = await searchResponse.text();
      console.error("Lỗi từ Server:", errorText);
      toast.error(
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
          <span className="input-label">
            {t("bookingFlow.from", "Điểm đi")}
          </span>
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
                placeholder={t(
                  "bookingFlow.placeholders.from",
                  "Chọn điểm đi..."
                )}
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
          <span className="input-label">{t("bookingFlow.to", "Điểm đến")}</span>
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
                placeholder={t(
                  "bookingFlow.placeholders.to",
                  "Chọn điểm đến..."
                )}
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
          <span className="input-label">
            {t("bookingFlow.date", "Ngày đi")}
          </span>
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
            {t("bookingFlow.departureTime", "Giờ đi")}
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
          <Search size={18} /> {t("bookingFlow.search", "Tìm")}
        </button>
      </form>
    </div>
  );
};

export default FlightSearchForm;
