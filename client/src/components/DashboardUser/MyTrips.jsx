import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plane,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  RefreshCw,
  XCircle,
  ArrowRight,
  MoreVertical,
  Ticket,
  AlertCircle,
} from "lucide-react";
import "./MyTrips.css";

// --- MOCK DATA (Dữ liệu giả lập để test giao diện) ---
const MOCK_MY_TRIPS = [
  {
    ticketID: "TKT-VN123456",
    flightNumber: "VN-192",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDate: "2025-12-20",
    departureTime: "08:30",
    arriveDate: "2025-12-21",
    arriveTime: "00:30",
    seatNumber: "12A",
    class: "Phổ thông",
    price: 2500000,
    status: "valid", // valid, cancelled, completed
    passengerName: "Phan Thanh Khang",
  },
  {
    ticketID: "TKT-VN123496",
    flightNumber: "VN-192",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDate: "2025-12-20",
    departureTime: "08:30",
    arriveDate: "2025-12-21",
    arriveTime: "00:30",
    seatNumber: "12A",
    class: "Phổ thông",
    price: 2500000,
    status: "valid", // valid, cancelled, completed
    passengerName: "Phan Thanh Khang",
  },
  {
    ticketID: "TKT-VN153456",
    flightNumber: "VN-192",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDate: "2025-12-20",
    departureTime: "08:30",
    arriveDate: "2025-12-21",
    arriveTime: "00:30",
    seatNumber: "12A",
    class: "Phổ thông",
    price: 2500000,
    status: "valid", // valid, cancelled, completed
    passengerName: "Phan Thanh Khang",
  },
  {
    ticketID: "TKT-VN123756",
    flightNumber: "VN-192",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDate: "2025-12-20",
    departureTime: "08:30",
    arriveDate: "2025-12-21",
    arriveTime: "00:30",
    seatNumber: "12A",
    class: "Phổ thông",
    price: 2500000,
    status: "valid",
    passengerName: "Phan Thanh Khang",
  },
];

const MyTrips = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState(MOCK_MY_TRIPS);

  // Filter logic
  const filteredTrips = trips.filter(
    (trip) =>
      trip.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.departurePoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.arrivePoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.departureDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ACTIONS HANDLERS (Logic điều hướng) ---
  const handleChangeSeat = (trip) => {
    if (trip.status !== "valid") return alert("Vé này không thể đổi ghế!");
    // Logic: Navigate to SeatMap with ticketID
    console.log("Điều hướng đến trang đổi ghế cho:", trip.ticketID);
    alert(
      `Đang chuyển đến sơ đồ ghế chuyến ${trip.flightNumber} để đổi ghế...`
    );
  };

  const handleChangeFlight = (trip) => {
    if (trip.status !== "valid") return alert("Vé này không thể đổi chuyến!");
    // Logic: Navigate to SearchFlight with old ticket info
    console.log("Điều hướng đến trang tìm chuyến mới cho:", trip.ticketID);
    alert(
      `Đang tìm chuyến bay thay thế cho chặng ${trip.departurePoint} - ${trip.arrivePoint}...`
    );
  };

  const handleCancelTicket = (trip) => {
    if (trip.status !== "valid") return alert("Vé này không thể hủy!");
    // Logic: Open Confirm Modal -> Call API Refund
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn hủy vé này? Phí hoàn vé sẽ được áp dụng."
    );
    if (confirm) {
      console.log("Gửi yêu cầu hủy vé:", trip.ticketID);
      // Giả lập cập nhật state
      setTrips((prev) =>
        prev.map((t) =>
          t.ticketID === trip.ticketID ? { ...t, status: "cancelled" } : t
        )
      );
      setSelectedTrip((prev) => ({ ...prev, status: "cancelled" }));
    }
  };

  return (
    <div className="my-trips-container">
      {/* 1. HEADER & SEARCH */}
      <div className="trips-header">
        <h1>Chuyến đi của tôi</h1>
        <div className="glass-search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Tìm theo mã chuyến bay, điểm đi/đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. TRIP LIST (GRID) */}
      <div className="trips-grid animate-fade-in">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <motion.div
              key={trip.ticketID}
              className={`trip-card glass-panel ${trip.status}`}
              whileHover={{ scale: 1.01, y: -5 }}
              onClick={() => setSelectedTrip(trip)}
            >
              <div className="card-top">
                <div className="route">
                  <span className="code">{trip.departurePoint}</span>
                  <Plane className="plane-icon" size={16} />
                  <span className="code">{trip.arrivePoint}</span>
                </div>
                <span className={`status-badge ${trip.status}`}>
                  {trip.status === "valid"
                    ? "Sắp khởi hành"
                    : trip.status === "completed"
                    ? "Đã hoàn thành"
                    : "Đã hủy"}
                </span>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <Calendar size={14} /> {trip.departureDate}
                </div>
                <div className="info-row">
                  <Clock size={14} /> {trip.departureTime}
                </div>
                <div className="info-row flight-num">
                  <Ticket size={14} /> {trip.flightNumber}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <Plane size={48} />
            <p>Không tìm thấy chuyến bay nào.</p>
          </div>
        )}
      </div>

      {/* 3. DETAIL MODAL (Overlay) */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            className="trip-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrip(null)}
          >
            <motion.div
              className="trip-detail-modal glass-panel"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
            >
              <button
                className="close-btn"
                onClick={() => setSelectedTrip(null)}
              >
                <XCircle size={24} />
              </button>

              <div className="modal-content-flex">
                {/* LEFT: TICKET VISUAL (Giống BookSuccess) */}
                <div className="mytrip-ticket-visual-wrapper">
                  <h3>Chi tiết vé điện tử</h3>
                  <div
                    className={`mytrip-ticket-visual ${selectedTrip.status}`}
                  >
                    <div className="mytrip-ticket-header">
                      <div className="brand">FlightHK</div>
                      <div className="flight-id">
                        {selectedTrip.flightNumber}
                      </div>
                    </div>
                    <div className="mytrip-ticket-body">
                      <div className="point">
                        <span className="city">
                          {selectedTrip.departurePoint}
                        </span>
                        <span className="time">
                          {selectedTrip.departureTime}
                        </span>
                        <span className="date">
                          {selectedTrip.departureDate}
                        </span>
                      </div>
                      <div className="path">
                        <div className="line"></div>
                      </div>
                      <div className="point right">
                        <span className="city">{selectedTrip.arrivePoint}</span>
                        <span className="time">{selectedTrip.arriveTime}</span>
                        <span className="date">{selectedTrip.arriveDate}</span>
                      </div>
                    </div>
                    <div className="mytrip-ticket-footer">
                      <div className="item">
                        <span className="label">Hành khách</span>
                        <span className="value">
                          {selectedTrip.passengerName}
                        </span>
                      </div>
                      <div className="item">
                        <span className="label">Ghế</span>
                        <span className="value">{selectedTrip.seatNumber}</span>
                      </div>
                      <div className="item">
                        <span className="label">Hạng</span>
                        <span className="value">{selectedTrip.class}</span>
                      </div>
                    </div>
                    {/* Notches */}
                    <div className="mytrip-notch left"></div>
                    <div className="mytrip-notch right"></div>
                    {/* Watermark nếu đã hủy */}
                    {selectedTrip.status === "cancelled" && (
                      <div className="watermark">ĐÃ HỦY</div>
                    )}
                  </div>
                </div>

                {/* RIGHT: MANAGE ACTIONS */}
                <div className="manage-actions-wrapper">
                  <h3>Quản lý đặt chỗ</h3>
                  <div className="actions-list">
                    {/* Chỉ hiển thị nút thao tác nếu vé còn Valid */}
                    {selectedTrip.status === "valid" ? (
                      <>
                        <button
                          className="action-btn glass-btn"
                          onClick={() => handleChangeSeat(selectedTrip)}
                        >
                          <div className="icon-box blue">
                            <Armchair size={20} />
                          </div>
                          <div className="text-box">
                            <span className="title">Đổi chỗ ngồi</span>
                            <span className="desc">
                              Chọn lại ghế trống khác
                            </span>
                          </div>
                          <ArrowRight size={16} className="arrow" />
                        </button>

                        <button
                          className="action-btn glass-btn"
                          onClick={() => handleChangeFlight(selectedTrip)}
                        >
                          <div className="icon-box purple">
                            <RefreshCw size={20} />
                          </div>
                          <div className="text-box">
                            <span className="title">Đổi chuyến bay</span>
                            <span className="desc">
                              Thay đổi ngày hoặc giờ bay
                            </span>
                          </div>
                          <ArrowRight size={16} className="arrow" />
                        </button>

                        <div className="divider"></div>

                        <button
                          className="action-btn glass-btn danger"
                          onClick={() => handleCancelTicket(selectedTrip)}
                        >
                          <div className="icon-box red">
                            <XCircle size={20} />
                          </div>
                          <div className="text-box">
                            <span className="title">Hủy vé & Hoàn tiền</span>
                            <span className="desc">
                              Áp dụng theo chính sách vé
                            </span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <div className="status-message">
                        <AlertCircle size={32} />
                        <p>
                          Vé này đã{" "}
                          {selectedTrip.status === "completed"
                            ? "hoàn thành"
                            : "bị hủy"}
                          .<br />
                          Không thể thực hiện thay đổi.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary Info */}
                  <div className="trip-summary-box">
                    <div className="row">
                      <span>Mã đặt chỗ:</span>{" "}
                      <strong>{selectedTrip.ticketID}</strong>
                    </div>
                    <div className="row">
                      <span>Tổng tiền:</span>
                      <strong className="price">
                        {selectedTrip.price.toLocaleString()} VND
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTrips;
