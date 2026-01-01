import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Ticket,
  CreditCard,
  Trash2,
  MapPin,
} from "lucide-react";
import SeatMap from "../BookingFlight/SeatMap";
import "./FlightSeatDetail.css"; // <--- Import file CSS mới
import { Snowfall } from "react-snowfall";
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";

const FlightSeatDetail = () => {
  const { flightNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const flightInfo = location.state?.flight || {};

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeatPassenger, setSelectedSeatPassenger] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Load danh sách ghế đã đặt
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/user/booking/seats/${flightNumber}`
        );
        const result = await response.json();
        if (result.success) {
          setOccupiedSeats(result.data);
        }
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    };
    fetchSeats();
  }, [flightNumber]);

  // 2. Xử lý khi Staff click ghế
  const handleSeatClick = async (seatId) => {
    const targetSeatNumber = (seatId + flightNumber).toUpperCase();

    if (!targetSeatNumber) {
      return;
    }
    const isOccupied = occupiedSeats.some(
      (s) => s.seatNumber.toUpperCase() === targetSeatNumber
    );

    if (!isOccupied) {
      setSelectedSeatPassenger(null);
      return;
    }
    setLoading(true);

    try {
      // MOCK DATA (Thay bằng API thật khi có)
      const response = await fetch(
        `http://localhost:3001/api/staff/flightmanagement/flight-seats/${flightNumber}/${seatId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Hiển thị kết quả sau khi gọi API ra đây
      const result = await response.json();
      const mockPassenger = {
        ticketID: result.data.ticketID,
        seatNumber: result.data.seatNumber,
        passengerName: result.data.contactName,
        passengerEmail: result.data.contactEmail,
        passengerMobile: result.data.contactPhone,
        passengerPassport: result.data.contactPassport,
        ticketState: result.data.ticketState,
      };
      setSelectedSeatPassenger(mockPassenger);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seat-detail-layout">
      <video className="booking-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
      </video>
      <Snowfall color="white" />
      {/* HEADER */}

      <div className="detail-header-bar">
        <button
          onClick={() =>
            navigate("/staff-dashboard", {
              state: { activeTab: "flight-create-update" },
            })
          }
          className="btn-back"
          style={{ color: "#00ff08ff" }}
        >
          <ArrowLeft size={30} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#ffffffff" }}>
            Quản lý ghế ngồi
          </h2>
          <div
            style={{
              fontSize: "13px",
              color: "#ffffffff",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "700", color: "#619dffff" }}>
              {flightNumber}
            </span>
            <span>•</span>
            <span>
              {flightInfo.departurePoint} ➝ {flightInfo.arrivePoint}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="detail-grid">
        {/* TRÁI: SEAT MAP */}
        <div className="flight seat-map-panel">
          <div className="map-title">Sơ đồ khoang hành khách</div>
          <div
            className="seat-picker-wrapper custom-scrollbar"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <SeatMap
              isStaffMode={true}
              seats={[]}
              occupiedSeats={occupiedSeats}
              flightSelected={flightInfo}
              onSeatClick={(seatId) => handleSeatClick(seatId)}
              liveSelections={{}}
              selectedSeats={
                selectedSeatPassenger
                  ? [{ id: selectedSeatPassenger.seatNumber }]
                  : []
              }
            />
          </div>
          {/* Chú thích */}
          <div
            className="seat-legend"
            style={{ justifyContent: "center", marginTop: "10px" }}
          >
            <div className="legend-item">
              <span className="box occupied"></span> Đã bán
            </div>
            <div className="legend-item">
              <span className="box available"></span> Trống
            </div>
            <div className="legend-item">
              <span className="box selected business personal"></span> Đang xem
            </div>
          </div>
        </div>

        {/* PHẢI: THÔNG TIN KHÁCH HÀNG */}
        <div className="passenger-info-panel">
          {loading ? (
            <div className="empty-state-box">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : selectedSeatPassenger ? (
            <div className="passenger-card">
              <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "5px",
                  }}
                >
                  Ghế đang chọn
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div className="seat-big-number">
                    {selectedSeatPassenger.seatNumber}
                  </div>
                  <span
                    className={`ticket-status-badge ${selectedSeatPassenger.ticketState === "valid" ? "valid" : "cancelled"}`}
                  >
                    {selectedSeatPassenger.ticketState === "valid"
                      ? "Đã thanh toán"
                      : "Đã hủy"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div>
                  <div className="info-label">
                    <Ticket size={14} /> Mã vé
                  </div>
                  <div className="info-value">
                    {selectedSeatPassenger.ticketID}
                  </div>
                </div>

                <div>
                  <div className="info-label">
                    <User size={14} /> Họ tên
                  </div>
                  <div className="info-value">
                    {selectedSeatPassenger.passengerName}
                  </div>
                </div>

                <div>
                  <div className="info-label">
                    <CreditCard size={14} /> Passport / CMND
                  </div>
                  <div className="info-value">
                    {selectedSeatPassenger.passengerPassport}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div className="info-label">
                      <Phone size={14} /> SĐT
                    </div>
                    <div className="info-value" style={{ fontSize: "14px" }}>
                      {selectedSeatPassenger.passengerMobile}
                    </div>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <div className="info-label">
                      <Mail size={14} /> Email
                    </div>
                    <div
                      className="info-value"
                      style={{
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={selectedSeatPassenger.passengerEmail}
                    >
                      {selectedSeatPassenger.passengerEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state-box">
              <div className="empty-icon"></div>
              <h3>Chưa chọn ghế</h3>
              <p>
                Vui lòng click vào ghế màu xám
                <br />
                để xem thông tin hành khách.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightSeatDetail;
