import React, { useState } from "react";
import {
  Search,
  Plane,
  QrCode,
  CheckCircle,
  Printer,
  UserCheck,
  CircleCheckBig,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CheckInCounter.css";
import { getAirportInfo } from "../../../utils/AirportData";

const CheckInCounter = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const navigate = useNavigate();

  // 1. Hàm tìm kiếm vé
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setTicketData(null);
    setIsCheckedIn(false);

    try {
      // --- LOGIC API THẬT (Khi có backend) ---
      /*
      const res = await fetch(`http://localhost:3001/api/staff/checkin/search?q=${query}`);
      const data = await res.json();
      if(data.success) setTicketData(data.ticket);
      */

      // --- MOCK DATA (Để demo hiển thị) ---
      await new Promise((r) => setTimeout(r, 800)); // Delay giả

      // Giả lập tìm thấy vé
      const mockTicket = {
        ticketID: "TKT-8822109",
        flightNumber: "VN002",
        passengerName: "PHAN THANH KHANG",
        seatNumber: "2A",
        class: "Business",
        departure: "HAN",
        arrive: "SGN",
        date: "2025-12-29",
        time: "20:00",
        gate: "05", // Gate thường gán lúc checkin
        status: "valid", // valid, cancelled
        checkinState: "no", // no, yes
      };

      setTicketData(mockTicket);
      setIsCheckedIn(mockTicket.checkinState === "yes");
    } catch (error) {
      alert("Không tìm thấy vé!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm Xác nhận Check-in
  const handleConfirmCheckIn = async () => {
    setLoading(true);
    try {
      // --- LOGIC API THẬT ---
      /*
      await fetch(`http://localhost:3001/api/staff/checkin/confirm`, {
         method: 'POST',
         body: JSON.stringify({ ticketID: ticketData.ticketID })
      });
      */

      await new Promise((r) => setTimeout(r, 500)); // Delay xử lý
      setIsCheckedIn(true);
      // alert("Check-in thành công!");
    } catch (error) {
      alert("Lỗi check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container fade-in">
      {/* Search Box */}
      <div className="checkin-search-box">
        <h2 style={{ margin: 0, fontSize: "28px" }}>Quầy Thủ Tục (Check-in)</h2>
        <p style={{ color: "#e8ecf1ff", marginBottom: "20px" }}>
          Quét mã vé, nhập số Passport hoặc Mã đặt chỗ
        </p>

        <form onSubmit={handleSearch} className="input-group-lg">
          <input
            type="text"
            className="input-lg"
            placeholder="VD: TKT-8822109..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-search-lg" disabled={loading}>
            {loading ? "Đang tìm..." : <Search size={24} />}
          </button>
        </form>
      </div>

      {/* Result: Boarding Pass */}
      {ticketData && (
        <div className="boarding-pass-wrapper">
          <div className="boarding-pass">
            {/* Dấu đóng dấu Check-in */}
            {isCheckedIn && <div className="status-stamp">CHECKED-IN</div>}

            {/* Phần Trái */}
            <div className="pass-main">
              <div className="airline-header">
                <span className="brand-name">FlightHK</span>
                <span className="pass-type">{ticketData.class} Class</span>
              </div>

              <div className="flight-route-large">
                <div style={{ textAlign: "left" }}>
                  <div className="city-code">{ticketData.departure}</div>
                  <div className="city-name">
                    {getAirportInfo(ticketData.departure).name}
                  </div>
                </div>
                <Plane size={32} className="flight-icon-large" />
                <div style={{ textAlign: "right" }}>
                  <div className="city-code">{ticketData.arrive}</div>
                  <div className="city-name">
                    {getAirportInfo(ticketData.arrive).name}
                  </div>
                </div>
              </div>

              <div className="pass-details-grid">
                <div className="detail-item">
                  <label>Hành khách / Passenger</label>
                  <span>{ticketData.passengerName}</span>
                </div>
                <div className="detail-item">
                  <label>Chuyến bay / Flight</label>
                  <span>{ticketData.flightNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày / Date</label>
                  <span>{ticketData.date}</span>
                </div>
                <div className="detail-item">
                  <label>Giờ bay / Time</label>
                  <span>{ticketData.time}</span>
                </div>
                <div className="detail-item">
                  <label>Cổng / Gate</label>
                  <span>{ticketData.gate}</span>
                </div>
                <div className="detail-item">
                  <label>Mã vé/ Ticket ID</label>
                  <span style={{ fontSize: "14px" }}>
                    {ticketData.ticketID}
                  </span>
                </div>
              </div>
            </div>

            {/* Phần Phải (Cuống vé) */}
            <div className="pass-stub">
              <label
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                GHẾ / SEAT
              </label>
              <div className="seat-large">{ticketData.seatNumber}</div>

              <div className="barcode-area">
                <QrCode size={80} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="checkin-actions" style={{ justifyContent: "center" }}>
            {!isCheckedIn ? (
              <button
                className="btn-confirm"
                onClick={handleConfirmCheckIn}
                disabled={loading}
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <UserCheck size={24} /> Xác nhận Check-in
                  </>
                )}
              </button>
            ) : (
              <button
                className="btn-confirm"
                style={{ background: "#1aff00ff" }}
              >
                <CircleCheckBig size={24} /> Check-in thành công
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInCounter;
