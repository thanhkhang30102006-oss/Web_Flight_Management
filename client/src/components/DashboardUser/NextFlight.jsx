import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import {
  Plane,
  MapPin,
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Cloud,
  ArrowRight,
  Armchair,
  AlertCircle,
  Ticket,
  Loader2,
  User,
} from "lucide-react";
import "./NextFlight.css";
import { useNavigate } from "react-router-dom";
const AIRPORT_COORDS = {
  // Miền Bắc
  HAN: { name: "Hà Nội", lat: 21.213, lon: 105.803 },
  HPH: { name: "Hải Phòng", lat: 20.818, lon: 106.733 },
  VDO: { name: "Vân Đồn", lat: 21.11, lon: 107.41 },
  DIN: { name: "Điện Biên", lat: 21.39, lon: 103.0 },
  THD: { name: "Thanh Hóa", lat: 19.9, lon: 105.46 },
  VII: { name: "Vinh", lat: 18.73, lon: 105.67 },

  // Miền Trung
  DAD: { name: "Đà Nẵng", lat: 16.054, lon: 108.202 },
  CXR: { name: "Nha Trang", lat: 11.998, lon: 109.219 },
  HUI: { name: "Huế", lat: 16.4, lon: 107.7 },
  VDH: { name: "Đồng Hới", lat: 17.51, lon: 106.59 },
  VCL: { name: "Chu Lai", lat: 15.4, lon: 108.7 },
  UIH: { name: "Quy Nhơn", lat: 13.95, lon: 109.05 },
  TBB: { name: "Tuy Hòa", lat: 13.04, lon: 109.33 },

  // Tây Nguyên
  DLI: { name: "Đà Lạt", lat: 11.75, lon: 108.37 },
  BMV: { name: "Buôn Ma Thuột", lat: 12.66, lon: 108.12 },
  PXU: { name: "Pleiku", lat: 14.0, lon: 108.01 },

  // Miền Nam
  SGN: { name: "TP.HCM", lat: 10.818, lon: 106.651 },
  PQC: { name: "Phú Quốc", lat: 10.168, lon: 103.992 },
  VCA: { name: "Cần Thơ", lat: 10.085, lon: 105.712 },
  VCS: { name: "Côn Đảo", lat: 8.73, lon: 106.63 },
  VKG: { name: "Rạch Giá", lat: 10.0, lon: 105.13 },
  CAH: { name: "Cà Mau", lat: 9.17, lon: 105.17 },
};
// --- MOCK DATA (Dữ liệu giả lập cho Weather & Flight) ---
const getWeatherIcon = (code) => {
  if (code === 0 || code === 1)
    return <Sun className="weather-icon-w text-yellow-400" />;
  if (code === 2 || code === 3)
    return <CloudSun className="weather-icon-w text-gray-400" />;
  if (code >= 51 && code <= 67)
    return <CloudRain className="weather-icon-w text-blue-400" />;
  if (code >= 95)
    return <CloudLightning className="weather-icon-w text-purple-400" />;
  return <Cloud className="weather-icon-w text-gray-300" />;
};

const getWeatherDescription = (code) => {
  if (code <= 1) return "Nắng đẹp";
  if (code <= 3) return "Có mây";
  if (code >= 45 && code <= 48) return "Sương mù";
  if (code >= 51 && code <= 67) return "Có mưa";
  if (code >= 80 && code <= 82) return "Mưa rào";
  if (code >= 95) return "Mưa dông";
  return "Nhiều mây";
};
let isHasTicket = false;

// Component 1: Khi CHƯA có vé (No Flight)
const NoFlightView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // 2. Khởi tạo hook
  return (
    <motion.div
      className="glass-card no-flight-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="promo-content">
        <div className="icon-wrapper">
          <Ticket size={40} className="promo-icon" />
        </div>
        <div className="text-content">
          <h3>{t("next_flight.no_ticket.title")}</h3>{" "}
          <p>
            {/* 4. Dịch đoạn văn có chứa thẻ strong bằng component Trans */}
            <Trans i18nKey="next_flight.no_ticket.desc">
              Đặt vé ngay hôm nay để nhận ưu đãi <strong>20%</strong> cho các
              chặng bay nội địa hè này.
            </Trans>
          </p>
        </div>
      </div>
      <button
        className="btn-primary-glass"
        onClick={() => navigate("/user/booking-details")}
      >
        {t("next_flight.no_ticket.btn")}
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
};

// Component 2a: Phần Vé máy bay (Left Side)
const TicketView = ({ flight, seat, passengerName }) => {
  const realSeatNumber = seat.seatNumber.replace(flight.flightNumber, "");
  return (
    <>
      <div className="ticket-visual">
        {/* Header Vé: Logo & Status */}
        <div className="ticket-header">
          <div className="airline-brand">
            <Plane className="airline-logo-placeholder" size={24} />
            <span className="flight-no">{flight.flightNumber}</span>
          </div>
          <span className={`flight-status ${flight.flightState}`}>
            {flight.flightState === "active" ? "Đúng giờ" : "Bị hoãn"}
          </span>
        </div>

        {/* Body Vé: Tuyến đường */}
        <div className="ticket-body">
          <div className="route-point">
            <span className="city-code">{flight.departurePoint}</span>
            <span className="time-large">{flight.departureTime}</span>
            <span className="date-small">{flight.departureDay}</span>
          </div>

          <div className="flight-path">
            <span className="duration">Bay thẳng</span>
            <div className="path-line">
              <div className="dot start"></div>
              <Plane className="plane-icon-center" size={24} />
              <div className="dot end"></div>
            </div>
            <span className="type">{flight.planeType}</span>
          </div>

          <div className="route-point text-right">
            <span className="city-code">{flight.arrivePoint}</span>
            <span className="time-large">{flight.arriveTime}</span>
            <span className="date-small">{flight.arriveDay}</span>
          </div>
        </div>

        <div className="ticket-footer">
          <div className="info-item">
            <Armchair size={20} />{" "}
            <span className="value">{realSeatNumber || "Chưa chọn"}</span>
          </div>
          <div className="info-item">
            <User size={20} /> <span className="value">{passengerName}</span>
          </div>
          <div className="info-item">
            <Ticket size={20} />{" "}
            <span className="value">
              {seat.seatType === "economy" ? "Phổ thông" : "Thương gia"}
            </span>
          </div>
        </div>
        <div className="ticket-notch left"></div>
        <div className="ticket-notch right"></div>
      </div>
    </>
  );
};

// Component 2b: Phần Thời tiết (Right Side)
const WeatherWidget = ({ depCode, arrCode, weatherData, loading }) => {
  if (loading)
    return (
      <div className="weather-loading">
        <Loader2 className="animate-spin" /> Đang tải thời tiết...
      </div>
    );
  if (!weatherData) return null;
  const SimpleRow = ({ code, data, color }) => (
    <div
      className="weather-row-simple"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
      }}
    >
      <div
        className="loc"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "30%",
        }}
      >
        <MapPin size={20} className={color} />
        <span style={{ fontWeight: "bold" }}>{code}</span>
      </div>
      <div
        className="stat"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {getWeatherIcon(data.code)}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {data.temp}°C
          </div>
          <div style={{ fontSize: "0.85rem", color: "#555" }}>
            {getWeatherDescription(data.code)}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="weather-widget">
      <h4 className="widget-title">Dự báo ngày bay</h4>
      <SimpleRow code={depCode} data={weatherData.dep} color="text-blue-500" />
      <div className="divider-dashed"></div>
      <SimpleRow code={arrCode} data={weatherData.arr} color="text-red-500" />
    </div>
  );
};

// --- COMPONENT CHÍNH ---
function NextFlightCard({ passengerID, passengerName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flightPoint, setFlightPoint] = useState(null);
  const [isHasTicket, setIsHasTicket] = useState(false);
  useEffect(() => {
    const fecthFligthTicket = async () => {
      try {
        if (!passengerID) return;
        const response = await fetch(
          `api/user/dashboard/latestticket/passenger/${passengerID}`
        );
        const result = await response.json();

        if (result.success && result.flight) {
          setIsHasTicket(true);
          setFlightPoint(result);
        } else {
          setIsHasTicket(false);
          setFlightPoint(null);
        }
      } catch (error) {
        console.error("Không thể tải danh sách ghế đã bán:", error);
      }
    };
    fecthFligthTicket();
  }, [passengerID]);
  useEffect(() => {
    if (!flightPoint || !flightPoint.flight) return;
    const flight = flightPoint.flight;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const depCoords = AIRPORT_COORDS[flight.departurePoint];
        const arrCoords = AIRPORT_COORDS[flight.arrivePoint];

        if (!depCoords || !arrCoords) {
          console.warn("Thiếu tọa độ sân bay trong AIRPORT_COORDS");
          setLoading(false);
          return;
        }
        const depDate = flight.departureDay;
        const arrDate = flight.arriveDay;
        const getUrl = (lat, lon, date) =>
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&start_date=${date}&end_date=${date}&timezone=auto`;
        const depUrl = getUrl(depCoords.lat, depCoords.lon, depDate);
        const arrUrl = getUrl(arrCoords.lat, arrCoords.lon, arrDate);
        // --- BẮT ĐẦU: Logic dùng FETCH ---

        // 1. Gọi song song 2 request
        const [res1, res2] = await Promise.all([fetch(depUrl), fetch(arrUrl)]);

        // 2. Kiểm tra lỗi HTTP (Fetch không tự throw lỗi 404/500)
        if (!res1.ok || !res2.ok) {
          throw new Error("Lỗi kết nối đến server thời tiết");
        }

        // 3. Parse JSON song song
        const [dataDep, dataArr] = await Promise.all([
          res1.json(),
          res2.json(),
        ]);

        // 4. Set State
        setWeather({
          dep: {
            temp: Math.round(dataDep.daily.temperature_2m_max[0]),
            min: Math.round(dataDep.daily.temperature_2m_min[0]),
            code: dataDep.daily.weather_code[0],
          },
          arr: {
            temp: Math.round(dataArr.daily.temperature_2m_max[0]),
            min: Math.round(dataArr.daily.temperature_2m_min[0]),
            code: dataArr.daily.weather_code[0],
          },
        });
        // --- KẾT THÚC: Logic dùng FETCH ---
      } catch (error) {
        console.error("Lỗi fetch API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [flightPoint]);

  if (!flightPoint || !flightPoint.flight) return <NoFlightView />;
  const { flight, seat } = flightPoint;
  return (
    <motion.div
      className="flight-dashboard-row"
      key={flight.flightNumber}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="col-ticket">
        <div className="glass-panel-title">Chuyến bay sắp tới</div>
        <TicketView flight={flight} seat={seat} passengerName={passengerName} />
      </div>

      <div className="col-weather">
        <div className="glass-panel-title">Thông tin điểm đến</div>
        <div className="glass-card weather-container">
          <WeatherWidget
            depCode={flight.departurePoint}
            arrCode={flight.arrivePoint}
            weatherData={weather}
            loading={loading}
          />
        </div>
      </div>
    </motion.div>
  );
}

export { NextFlightCard };
