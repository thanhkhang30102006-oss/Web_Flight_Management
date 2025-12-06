import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom"; // Hook Fiều hướng
import SeatMap from "./SeatMap"; // IMPORT MỚI
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Luggage,
  Plane,
} from "lucide-react";
import "./BookingPage.css";
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";
const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu chuyến bay từ trang trước (nếu có), nếu không dùng dữ liệu giả để test
  const flight = location.state?.flight || {
    flightNumber: "VN-192",
    airline: "Vietnam Airlines",
    departurePoint: "HAN",
    arrivePoint: "SGN",
    price: 1250000,
  };

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [passenger, setPassenger] = useState({
    name: "",
    email: "",
    phone: "",
    passport: "",
  });
  const occupiedSeats = ["1A", "2C", "5D", "8F"]; //gia lap ghe da ban
  const handlePassengerChange = (e) => {
    const { name, value } = e.target;
    setPassenger((prev) => ({ ...prev, [name]: value }));
  };
  const handlePayment = () => {
    // Chuyển sang trang thanh toán và mang theo "hành lý" dữ liệu
    navigate("/user/payment", {
      state: {
        flight,
        selectedSeats,
        passenger,
        totalPrice,
      },
    });
  };
  const handleSeatClick = (seatId, type) => {
    const exists = selectedSeats.find((s) => s.id === seatId);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId));
    } else {
      if (selectedSeats.length < 5) {
        const seatPrice =
          type === "business" ? flight.price * 1.5 : flight.price;

        const newSeat = {
          id: seatId,
          type: type,
          price: seatPrice,
        };
        setSelectedSeats([...selectedSeats, newSeat]);
      } else {
        alert(t("bookingPage.alertMaxSeats"));
      }
    }
  };
  const totalPrice = flight.price * (selectedSeats.length || 1);

  return (
    <div className="booking-layout">
      {/* 1. BACKGROUND VIDEO */}
      <video className="booking-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
      </video>
      <div className="booking-overlay"></div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="booking-page-container"
      >
        {/* HEADER MỚI: Gọn gàng, trong suốt */}
        <div className="compact-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={22} />
          </button>
          <div className="header-info">
            <h1>{t("bookingPage.title")}</h1>{" "}
            <div className="flight-route-badge">
              <span>{flight.departurePoint}</span>
              <Plane size={14} className="icon-plane" />
              <span>{flight.arrivePoint}</span>
              <span className="separator">•</span>
              <span>{flight.flightNumber}</span>
            </div>
          </div>
        </div>

        <div className="booking-grid">
          {/* --- CỘT 1: THÔNG TIN KHÁCH HÀNG --- */}
          <div className="glass-panel info-column">
            <h3 className="section-title">
              {t("bookingPage.sections.contact")}
            </h3>
            <div className="form-group">
              <label>
                <User size={16} /> {t("bookingPage.form.fullName")}{" "}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t("bookingPage.form.namePlaceholder")}
                value={passenger.name}
                onChange={handlePassengerChange}
              />
            </div>

            <div className="row-2-input">
              <div className="form-group">
                <label>
                  <Mail size={16} /> {t("bookingPage.form.email")}{" "}
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder={t("bookingPage.form.emailPlaceholder")}
                  value={passenger.email}
                  onChange={handlePassengerChange}
                />
              </div>
              <div className="form-group">
                <label>
                  <Phone size={16} /> {t("bookingPage.form.phone")}{" "}
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder={t("bookingPage.form.phonePlaceholder")}
                  value={passenger.phone}
                  onChange={handlePassengerChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Luggage size={16} /> {t("bookingPage.form.baggage")}
              </label>
              <select
                className="custom-select"
                name="luggage"
                onChange={handlePassengerChange}
                value={passenger.luggage}
              >
                <option value="none">
                  {t("bookingPage.form.baggageOptions.none")}
                </option>
                <option value="20kg">
                  {t("bookingPage.form.baggageOptions.20kg")}
                </option>
                <option value="30kg">
                  {t("bookingPage.form.baggageOptions.30kg")}
                </option>
              </select>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="summary-box">
              <div className="summary-row">
                <span>{t("bookingPage.summary.basePrice")}</span>
                <span>{flight.price.toLocaleString()} VND</span>
              </div>
              <div className="summary-row">
                <span>{t("bookingPage.summary.selectedCount")}</span>
                <span className="highlight-text">{selectedSeats.length}</span>
              </div>
              <div className="summary-row">
                <span>{t("bookingPage.summary.seats")}</span>
                <span className="seat-list">
                  {selectedSeats.length > 0
                    ? selectedSeats.map((s) => s.id).join(", ")
                    : t("bookingPage.summary.noneSelected")}
                </span>
              </div>
              <div className="divider"></div>
              <div className="total-row">
                <span>{t("bookingPage.summary.total")}</span>
                <span className="total-price">
                  {totalPrice.toLocaleString()} VND
                </span>
              </div>
            </div>

            <button
              className="checkout-btn"
              disabled={selectedSeats.length === 0}
              onClick={handlePayment}
            >
              <CreditCard size={20} /> {t("bookingPage.summary.payNow")}
            </button>
          </div>

          {/* --- CỘT 2: CHỌN GHẾ (DÙNG COMPONENT TỰ VIẾT) --- */}
          <div className="glass-panel seat-column">
            <h3 className="section-title">
              {t("bookingPage.sections.seatSelection")}
            </h3>
            {/* Component SeatMap mới (thay thế SeatPicker) */}
            <div className="seat-picker-wrapper custom-scrollbar">
              <SeatMap
                selectedSeats={selectedSeats}
                occupiedSeats={occupiedSeats}
                onSeatClick={handleSeatClick}
              />
            </div>
            <div className="screen-indicator">
              {t("bookingPage.seatMap.screenDirection")}
            </div>{" "}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingPage;
