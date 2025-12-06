import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Hook điều hướng
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
import "./BookingPage.css"; // File CSS tùy chỉnh cho thư viện
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4"; // Check lại đường dẫn assets của bạn
const BookingPage = () => {
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

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      // Bỏ chọn
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      // Chọn mới (Giới hạn tối đa 5 ghế nếu muốn)
      if (selectedSeats.length < 5) {
        setSelectedSeats([...selectedSeats, seatId]);
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
            <h1>Form Đặt Vé</h1>
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
            <h3 className="section-title">1. Thông tin liên hệ</h3>

            <div className="form-group">
              <label>
                <User size={16} /> Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={passenger.name}
                onChange={(e) =>
                  setPassenger({ ...passenger, name: e.target.value })
                }
              />
            </div>

            <div className="row-2-input">
              <div className="form-group">
                <label>
                  <Mail size={16} /> Email
                </label>
                <input type="email" placeholder="example@email.com" />
              </div>
              <div className="form-group">
                <label>
                  <Phone size={16} /> Số điện thoại
                </label>
                <input type="tel" placeholder="0912 xxx xxx" />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Luggage size={16} /> Hành lý ký gửi (Tùy chọn)
              </label>
              <select className="custom-select">
                <option>Không mang theo</option>
                <option>20kg (+200.000đ)</option>
                <option>30kg (+350.000đ)</option>
              </select>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="summary-box">
              <div className="summary-row">
                <span>Giá vé cơ bản:</span>
                <span>{flight.price.toLocaleString()} VND</span>
              </div>
              <div className="summary-row">
                <span>Số ghế đã chọn:</span>
                <span className="highlight-text">{selectedSeats.length}</span>
              </div>
              <div className="summary-row">
                <span>Ghế:</span>
                <span className="seat-list">
                  {selectedSeats.length > 0
                    ? selectedSeats.map((s) => s.number).join(", ")
                    : "Chưa chọn"}
                </span>
              </div>
              <div className="divider"></div>
              <div className="total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">
                  {totalPrice.toLocaleString()} VND
                </span>
              </div>
            </div>

            <button
              className="checkout-btn"
              disabled={selectedSeats.length === 0}
            >
              <CreditCard size={20} /> Thanh toán ngay
            </button>
          </div>

          {/* --- CỘT 2: CHỌN GHẾ (DÙNG COMPONENT TỰ VIẾT) --- */}
          <div className="glass-panel seat-column">
            <h3 className="section-title">2. Chọn chỗ ngồi</h3>

            {/* Component SeatMap mới (thay thế SeatPicker) */}
            <div className="seat-picker-wrapper custom-scrollbar">
              <SeatMap
                selectedSeats={selectedSeats}
                occupiedSeats={occupiedSeats}
                onSeatClick={handleSeatClick}
              />
            </div>

            <div className="screen-indicator">Màn hình phía này</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingPage;
