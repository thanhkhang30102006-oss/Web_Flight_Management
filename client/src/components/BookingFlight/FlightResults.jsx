import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Info,
  Armchair,
  X,
  Check,
  User,
  Mail,
  Phone,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Rót dữ liệu vào

const BookingModal = ({ flight, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerInfo, setPassengerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  // Giả lập ghế đã có người ngồi (Cố định vài ghế để demo)
  const occupiedSeats = ["2A", "2B", "5C", "5D", "8E", "8F"];

  // Cấu hình sơ đồ ghế (6 ghế / hàng, có lối đi ở giữa)
  const rows = 10;
  const cols = ["A", "B", "C", "", "D", "E", "F"]; // "" là lối đi

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return; // Ghế đã bán
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId)); // Bỏ chọn
    } else {
      setSelectedSeats([...selectedSeats, seatId]); // Chọn mới
    }
  };

  const totalPrice = flight.price * (selectedSeats.length || 1); // Tạm tính ít nhất 1 vé

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop mờ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-slate-900 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
        style={{ maxHeight: "90vh" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
        >
          <X size={24} />
        </button>

        {/* --- CỘT TRÁI: SƠ ĐỒ GHẾ (MÔ PHỎNG MÁY BAY) --- */}
        <div className="w-full md:w-1/2 p-6 bg-slate-800/50 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Chọn chỗ ngồi</h3>
            <p className="text-sm text-slate-400">
              {flight.planeType} - {flight.flightNumber}
            </p>
          </div>

          {/* Chú thích */}
          <div className="flex justify-center gap-4 mb-8 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-600 border border-slate-500"></div>{" "}
              Trống
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-700 opacity-50 cursor-not-allowed"></div>{" "}
              Đã bán
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500 shadow-lg shadow-blue-500/50"></div>{" "}
              Đang chọn
            </div>
          </div>

          {/* VẼ MÁY BAY */}
          <div className="relative mx-auto max-w-[300px] bg-slate-100/5 rounded-t-[100px] rounded-b-[40px] p-8 border border-white/10 pb-20">
            {/* Buồng lái */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 border-b-2 border-white/10"></div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
              {/* Header cột */}
              {cols.map((col, i) => (
                <div
                  key={i}
                  className="text-center text-slate-500 text-xs font-bold mb-2"
                >
                  {col}
                </div>
              ))}

              {/* Render Ghế */}
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {cols.map((col, colIndex) => {
                    if (col === "")
                      return (
                        <div
                          key={`${rowIndex}-aisle`}
                          className="w-4 text-center text-[10px] text-slate-600 flex items-center justify-center"
                        >
                          {rowIndex + 1}
                        </div>
                      ); // Lối đi hiện số hàng

                    const seatId = `${rowIndex + 1}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <motion.button
                        key={seatId}
                        whileHover={!isOccupied ? { scale: 1.1 } : {}}
                        whileTap={!isOccupied ? { scale: 0.9 } : {}}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={isOccupied}
                        className={`
                          h-8 w-full rounded-md flex items-center justify-center text-[10px] font-bold transition-all relative
                          ${
                            isOccupied
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : isSelected
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 border border-blue-400"
                                : "bg-slate-600 text-slate-300 hover:bg-slate-500 border border-slate-500"
                          }
                        `}
                      >
                        {isSelected && <Check size={12} />}
                      </motion.button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM THÔNG TIN --- */}
        <div className="w-full md:w-1/2 p-8 bg-white text-slate-800 flex flex-col">
          <h3 className="text-2xl font-bold mb-6 text-slate-900">
            Thông tin đặt vé
          </h3>

          <div className="space-y-4 flex-1">
            {/* Input Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="VD: Nguyen Van A"
                  value={passengerInfo.name}
                  onChange={(e) =>
                    setPassengerInfo({ ...passengerInfo, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email nhận vé
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="example@gmail.com"
                  value={passengerInfo.email}
                  onChange={(e) =>
                    setPassengerInfo({
                      ...passengerInfo,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Input Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0912 xxx xxx"
                  value={passengerInfo.phone}
                  onChange={(e) =>
                    setPassengerInfo({
                      ...passengerInfo,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Hãng bay:</span>
                <span className="font-semibold text-slate-900">
                  {flight.airline}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Ghế đã chọn:</span>
                <span className="font-bold text-blue-600">
                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "Chưa chọn ghế"}
                </span>
              </div>
              <div className="border-t border-blue-200 my-2 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-slate-800">
                  Tổng cộng:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
            <CreditCard size={20} />
            Thanh toán ngay
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const FlightResults = ({ searchTriggered, flights = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // State quản lý việc mở Modal
  const [selectedFlight, setSelectedFlight] = useState(null);
  if (!searchTriggered) return null;

  if (flights.length === 0) {
    return (
      <div className="text-white text-center mt-8">
        <h3>Không tìm thấy chuyến bay nào phù hợp.</h3>
      </div>
    );
  }

  const styles = `
    .flight-card-item {
        background: rgba(204, 204, 204, 0.2);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.6); 
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.45); 
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        transition: all 0.3s;
    }
    .flight-card-item:hover {
        background: rgba(211, 211, 211, 0.1);
        border-color: #56c2f9ff;
    }
    .flight-card-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
    }
    /* Các class cũ giữ nguyên... */
    .fc-airline { display: flex; align-items: center; gap: 12px; min-width: 200px; }
    .fc-logo { width: 45px; height: 45px; object-fit: contain; background: white; border-radius: 8px; padding: 4px; }
    .fc-name { font-weight: bold; color: white; margin: 0; font-size: 15px; }
    .fc-number { font-size: 12px; color: rgba(255,255,255,0.9); }
    .fc-status { font-size: 11px; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px; font-weight: 600; }
    .fc-status.active { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .fc-status.delayed { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

    .fc-route { display: flex; align-items: center; gap: 20px; flex: 1; justify-content: center; min-width: 250px; }
    .fc-point { text-align: center; }
    .fc-time { display: block; font-weight: 800; font-size: 20px; color: white; }
    .fc-city { font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 600; }
    
    .fc-arrow { display: flex; flex-direction: column; align-items: center; width: 120px; }
    .fc-duration { font-size: 11px; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
    .dashed-line-plane { display: flex; align-items: center; width: 100%; position: relative; height: 2px; background: linear-gradient(to right, transparent 50%, rgba(255,255,255,0.3) 50%); background-size: 10px 100%; }
    .icon-plane-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: #60a5fa; background: transparent; padding: 0 4px; }
    .fc-date { font-size: 11px; color: #dfedffff; margin-top: 6px; }

    .fc-price-action { text-align: right; min-width: 140px; }
    .fc-price { font-size: 20px; font-weight: 800; color: #4ade80; }
    .fc-seat-info { font-size: 12px; color: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: flex-end; gap: 5px; margin: 5px 0 10px; }
    .btn-select { background: white; color: #0f172a; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-select:hover { background: #3b82f6; color: white; transform: scale(1.05); }

    /* Scrollbar cho Modal */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
  `;

  if (!searchTriggered) return null;

  return (
    <>
      <style>{styles}</style>
      <div
        className="results-list"
        style={{ marginTop: "24px", maxWidth: "100%" }}
      >
        <h3
          style={{
            marginBottom: "16px",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {t("booking.results", "Kết quả tìm kiếm")} ({flights.length})
        </h3>

        {flights.map((flight) => (
          <motion.div
            key={flight.flightNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flight-card-item"
          >
            {/* --- THÔNG TIN CHÍNH (Đã xóa hết phần mở rộng) --- */}
            <div className="flight-card-main">
              {/* Cột 1 */}
              <div className="fc-airline">
                <img src={flight.logo} alt="logo" className="fc-logo" />
                <div>
                  <h4 className="fc-name">{flight.planeType}</h4>
                  <div className="fc-number">{flight.flightNumber}</div>
                  <div className={`fc-status ${flight.flightState}`}>
                    {flight.flightState.charAt(0).toUpperCase() +
                      flight.flightState.slice(1)}
                  </div>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="fc-route">
                <div className="fc-point">
                  <span className="fc-time">
                    {flight.departureTime.slice(0, 5)}
                  </span>
                  <span className="fc-city">{flight.departurePoint}</span>
                </div>

                <div className="fc-arrow">
                  <span className="fc-duration">Bay thẳng</span>
                  <div className="dashed-line-plane">
                    <Plane size={20} className="icon-plane-center" />
                  </div>
                  <span className="fc-date">{flight.departureDay}</span>
                </div>

                <div className="fc-point">
                  <span className="fc-time">
                    {flight.arriveTime.slice(0, 5)}
                  </span>
                  <span className="fc-city">{flight.arrivePoint}</span>
                </div>
              </div>

              {/* Cột 3: Nút Chọn Vé kích hoạt Modal */}
              <div className="fc-price-action">
                <div className="fc-price">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(flight.finalPrice.economy)}
                </div>
                {/**Phải edit lại số chỗ floghtTotalSeat- seatAlreadyBooked */}
                <div className="fc-seat-info">
                  <Armchair size={14} /> Còn{" "}
                  {flight.flightTotalSeat - flight.seatCount}
                  chỗ
                </div>
                <button
                  className="btn-select"
                  onClick={() => {
                    // Chuyển hướng sang trang BookingPage mới tạo
                    // Truyền theo dữ liệu chuyến bay (state)
                    navigate("/user/booking-details", {
                      state: { flight: flight },
                    });
                  }}
                >
                  Chọn vé
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* --- MODAL (Chỉ hiện khi có selectedFlight) --- */}
        <AnimatePresence>
          {selectedFlight && (
            <BookingModal
              flight={selectedFlight}
              onClose={() => setSelectedFlight(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FlightResults;
