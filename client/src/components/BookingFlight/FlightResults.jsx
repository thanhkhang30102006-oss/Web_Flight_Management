import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Plane, Info, Armchair } from "lucide-react";
import { useTranslation } from "react-i18next";

// --- 1. CẤU HÌNH TỌA ĐỘ SÂN BAY (Để vẽ Map) ---
const AIRPORT_COORDS = {
  HAN: { lat: 21.213, lon: 105.803 }, // Hà Nội
  SGN: { lat: 10.818, lon: 106.651 }, // TP.HCM
  DAD: { lat: 16.054, lon: 108.202 }, // Đà Nẵng
  CXR: { lat: 11.998, lon: 109.219 }, // Nha Trang
  PQC: { lat: 10.168, lon: 103.992 }, // Phú Quốc
};

// --- 2. DỮ LIỆU GIẢ (Theo cấu trúc bạn yêu cầu) ---
const MOCK_FLIGHTS = [
  {
    id: 1,
    flightNumber: "VN-192",
    departurePoint: "HAN",
    arrivePoint: "SGN",
    departureDay: "2025-12-12",
    departureTime: "08:30", // Giờ đi
    arrivalTime: "10:40", // Giả lập giờ đến
    planeType: "Boeing 787-9 Dreamliner",
    flightTotalSeat: 300,
    flightState: "ontime", // ontime | delayed | cancelled
    airline: "Vietnam Airlines",
    price: "1,250,000 VND",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Vietnam_Airlines_Logo.svg/1200px-Vietnam_Airlines_Logo.svg.png",
  },
  {
    id: 2,
    flightNumber: "VJ-512",
    departurePoint: "HAN",
    arrivePoint: "DAD",
    departureDay: "2025-12-12",
    departureTime: "14:15",
    arrivalTime: "15:35",
    planeType: "Airbus A321",
    flightTotalSeat: 230,
    flightState: "delayed",
    airline: "Vietjet Air",
    price: "850,000 VND",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/VietJet_Air_logo.svg/2560px-VietJet_Air_logo.svg.png",
  },
  {
    id: 3,
    flightNumber: "QH-204",
    departurePoint: "HAN",
    arrivePoint: "CXR",
    departureDay: "2025-12-12",
    departureTime: "09:00",
    arrivalTime: "10:50",
    planeType: "Embraer E190",
    flightTotalSeat: 100,
    flightState: "ontime",
    airline: "Bamboo Airways",
    price: "1,100,000 VND",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Bamboo_Airways_logo.svg/1200px-Bamboo_Airways_logo.svg.png",
  },
];

// --- 3. COMPONENT MAP (Hiển thị iframe OpenStreetMap) ---
const FlightRouteMap = ({ dep, arr }) => {
  const depCoords = AIRPORT_COORDS[dep];
  const arrCoords = AIRPORT_COORDS[arr];

  if (!depCoords || !arrCoords)
    return (
      <div style={{ color: "white", padding: 20 }}>
        Không có dữ liệu bản đồ cho chặng này.
      </div>
    );

  // Tính trung điểm để map focus vào giữa
  // (Logic đơn giản, iframe embed thường cần bbox hoặc marker cụ thể, ở đây demo marker điểm đi)
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    depCoords.lon - 5
  },${depCoords.lat - 5},${arrCoords.lon + 5},${
    arrCoords.lat + 5
  }&layer=mapnik&marker=${depCoords.lat},${depCoords.lon}`;

  return (
    <motion.div
      className="map-visual-container"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 350 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4 }}
    >
      <iframe
        className="map-iframe"
        src={mapSrc}
        title="Flight Route Map"
      ></iframe>

      {/* Overlay trang trí */}
      <div className="map-overlay-info">
        <Plane size={24} className="plane-anim" />
        <span>
          Đang mô phỏng lộ trình: <b>{dep}</b> ➝ <b>{arr}</b>
        </span>
      </div>
    </motion.div>
  );
};

// --- 4. COMPONENT LIST KẾT QUẢ ---
const FlightResults = ({ searchTriggered }) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);

  if (!searchTriggered) return null;

  return (
    <div
      className="results-list"
      style={{
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h3 style={{ color: "white", marginBottom: "10px" }}>
        {t("booking.results", "Kết quả tìm kiếm")} ({MOCK_FLIGHTS.length})
      </h3>

      {MOCK_FLIGHTS.map((flight) => (
        <motion.div
          key={flight.id}
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-box flight-card-item"
          style={{
            background:
              selectedId === flight.id
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(255, 255, 255, 0.1)",
            borderColor:
              selectedId === flight.id ? "#60a5fa" : "rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
          onClick={() =>
            setSelectedId(selectedId === flight.id ? null : flight.id)
          }
          whileHover={{ scale: 1.01 }}
        >
          {/* --- Hàng 1: Thông tin chính --- */}
          <div className="flight-card-main">
            {/* Cột 1: Hãng bay & Số hiệu */}
            <div className="fc-airline">
              <img src={flight.logo} alt="logo" className="fc-logo" />
              <div>
                <h4 className="fc-name">{flight.airline}</h4>
                <div className="fc-number">{flight.flightNumber}</div>
                <div className={`fc-status ${flight.flightState}`}>
                  {flight.flightState === "ontime" ? "Đúng giờ" : "Delay"}
                </div>
              </div>
            </div>

            {/* Cột 2: Thời gian & Lộ trình */}
            <div className="fc-route">
              <div className="fc-point">
                <span className="fc-time">{flight.departureTime}</span>
                <span className="fc-city">{flight.departurePoint}</span>
              </div>

              <div className="fc-arrow">
                <span className="fc-duration">Bay thẳng</span>
                <div className="dashed-line-plane">
                  <div className="dot"></div>
                  <Plane size={16} className="icon-plane-center" />
                  <div className="dot"></div>
                </div>
                <span className="fc-date">{flight.departureDay}</span>
              </div>

              <div className="fc-point">
                <span className="fc-time">{flight.arrivalTime}</span>
                <span className="fc-city">{flight.arrivePoint}</span>
              </div>
            </div>

            {/* Cột 3: Giá & Nút chọn */}
            <div className="fc-price-action">
              <div className="fc-price">{flight.price}</div>
              <div className="fc-seat-info">
                <Armchair size={14} /> Còn{" "}
                {Math.floor(flight.flightTotalSeat * 0.4)} chỗ
              </div>
              <button className="btn-select">Chọn vé</button>
            </div>
          </div>

          {/* --- Phần mở rộng (Map & Chi tiết tàu bay) --- */}
          <AnimatePresence>
            {selectedId === flight.id && (
              <motion.div
                className="flight-details-expand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="detail-row-info">
                  <div className="info-tag">
                    <Plane size={14} /> Loại tàu bay:{" "}
                    <strong>{flight.planeType}</strong>
                  </div>
                  <div className="info-tag">
                    <Info size={14} /> Tổng ghế:{" "}
                    <strong>{flight.flightTotalSeat}</strong>
                  </div>
                </div>

                <FlightRouteMap
                  dep={flight.departurePoint}
                  arr={flight.arrivePoint}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default FlightResults;
