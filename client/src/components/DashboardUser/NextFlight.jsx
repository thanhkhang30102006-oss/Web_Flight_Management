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
  HAN: { name: "Hà Nội", lat: 21.213, lon: 105.803 },
  SGN: { name: "TP.HCM", lat: 10.818, lon: 106.651 },
  DAD: { name: "Đà Nẵng", lat: 16.054, lon: 108.202 },
  PQC: { name: "Phú Quốc", lat: 10.168, lon: 103.992 },
  HPH: { name: "Hải Phòng", lat: 20.818, lon: 106.733 },
};
// --- MOCK DATA (Dữ liệu giả lập cho Weather & Flight) ---
const getWeatherIcon = (code) => {
  if (code === 0 || code === 1)
    return <Sun className="weather-icon-w text-yellow-400" />;
  if (code === 2 || code === 3)
    return <CloudSun className="weather-icon-w text-gray-200" />;
  if (code >= 51 && code <= 67)
    return <CloudRain className="weather-icon-w text-blue-300" />;
  if (code >= 95)
    return <CloudLightning className="weather-icon-w text-purple-400" />;
  return <Cloud className="weather-icon-w text-gray-300" />;
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
        onClick={() => navigate("/user/booking")}
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

  return (
    <div className="weather-widget">
      <h4 className="widget-title">Thời tiết hiện tại</h4>

      {/* Nơi đi */}
      <div className="weather-row">
        <div className="location-info">
          <MapPin size={24} className="text-blue" />
          <span>{AIRPORT_COORDS[depCode]?.name || depCode}</span>
        </div>
        <div className="weather-stats">
          {getWeatherIcon(weatherData.dep.code)}
          <span className="temp">{weatherData.dep.temp}°C</span>
        </div>
      </div>

      <div className="divider-dashed"></div>

      {/* Nơi đến */}
      <div className="weather-row">
        <div className="location-info">
          <MapPin size={24} className="text-red" />
          <span>{AIRPORT_COORDS[arrCode]?.name || arrCode}</span>
        </div>
        <div className="weather-stats">
          {getWeatherIcon(weatherData.arr.code)}
          <span className="temp">{weatherData.arr.temp}°C</span>
        </div>
      </div>

      <div className="weather-summary">
        <p>Gió: {weatherData.arr.wind} km/h tại điểm đến</p>
      </div>
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

        const depUrl = `https://api.open-meteo.com/v1/forecast?latitude=${depCoords.lat}&longitude=${depCoords.lon}&current_weather=true`;
        const arrUrl = `https://api.open-meteo.com/v1/forecast?latitude=${arrCoords.lat}&longitude=${arrCoords.lon}&current_weather=true`;

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
            temp: dataDep.current_weather.temperature,
            code: dataDep.current_weather.weathercode,
            wind: dataDep.current_weather.windspeed,
          },
          arr: {
            temp: dataArr.current_weather.temperature,
            code: dataArr.current_weather.weathercode,
            wind: dataArr.current_weather.windspeed,
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
