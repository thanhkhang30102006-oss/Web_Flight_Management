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
import { useNavigate } from "react-router-dom";
const userData = localStorage.getItem("userData");
const loggedInUser = userData ? JSON.parse(userData) : null;
const passengerID = loggedInUser.id;

const MyTrips = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [flight, setFlight] = useState([]);
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const getInfoFromPassenger = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(
          `api/user/mytrip/getflight/${passengerID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();
        if (result.success) {
          const groups = {};

          result.tickets.forEach((ticket) => {
            const pID = ticket.paymentID;

            if (!groups[pID]) {
              const paymentInfo = result.payments.find(
                (p) => p.paymentID === pID
              );
              groups[pID] = {
                paymentID: pID,
                totalPrice: paymentInfo ? paymentInfo.paymentPrice : 0,
                status: paymentInfo.paymentState,
                tickets: [],
              };
            }

            const flightInfo = result.flights.find(
              (f) => f.flightNumber === ticket.flightNumber
            );
            const seatInfo = result.seats.find(
              (s) => s.seatNumber === ticket.seatNumber
            );

            const ticketDetail = {
              ticketID: ticket.ticketID,
              flightNumber: ticket.flightNumber,
              departurePoint: flightInfo?.departurePoint,
              arrivePoint: flightInfo?.arrivePoint,
              departureDay: flightInfo?.departureDay,
              departureTime: flightInfo?.departureTime,
              seatNumber: ticket.seatNumber.replace(ticket.flightNumber, ""),
              class: seatInfo?.seatType,
              passengerName: result.passenger?.passengerName || "Khách",
              status: ticket.ticketState,
              arriveDay: flightInfo?.arriveDay,
              arriveTime: flightInfo?.arriveTime,
              state: seatInfo?.seatState,
            };

            // Đẩy vé vào nhóm
            groups[pID].tickets.push(ticketDetail);
          });

          const groupedArray = Object.values(groups).sort(
            (a, b) => b.paymentID - a.paymentID
          );

          setTrips(groupedArray);
        } else {
          setTrips([]);
          console.error("Lỗi lấy thông tin:", result.message);
        }
      } catch (error) {
        console.error("Lỗi kết nối server:", error);
      } finally {
      }
    };
    getInfoFromPassenger();
  }, [passengerID]);
  // Filter logic
  console.log(flight);
  const filteredTrips = trips.filter((trip) => {
    if (!trip.tickets || trip.tickets.length === 0) return false;

    const term = searchTerm.toLowerCase();

    return trip.tickets.some((ticket) => {
      return (
        (ticket.flightNumber?.toLowerCase() || "").includes(term) ||
        (ticket.departurePoint?.toLowerCase() || "").includes(term) ||
        (ticket.arrivePoint?.toLowerCase() || "").includes(term) ||
        (ticket.departureDay?.toLowerCase() || "").includes(term) ||
        (ticket.departureTime?.toLowerCase() || "").includes(term)
      );
    });
  });
  // Đổi chỗ ngồi
  const handleChangeSeat = (trip) => {
    if (trip.status !== "valid") return alert("Vé này không thể đổi ghế!");
    // Logic: Navigate to SeatMap với thông tin vé ticketID
    navigate("/seat-change", {
      state: {
        ticket: {
          ticketID: trip.ticketID,
          flightNumber: trip.flightNumber,
          seatNumber: trip.seatNumber,
          class: trip.class,
          departurePoint: trip.departurePoint,
          arrivePoint: trip.arrivePoint,
          state: trip.state,
        },
      },
    });
    console.log("Điều hướng đến trang đổi ghế cho:", trip.ticketID);
    alert(
      `Đang chuyển đến sơ đồ ghế chuyến ${trip.flightNumber} để đổi ghế...`
    );
  };

  const handleCancelTicket = async (trip) => {
    if (trip.status !== "valid") return alert("Vé này không thể hủy!");
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn hủy vé này? Phí hoàn vé sẽ được áp dụng."
    );
    if (confirm) {
      console.log("Gửi yêu cầu hủy vé:", trip.ticketID);
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          `http://localhost:3001/api/user/mytrip/ticket/cancel-ticket/${trip.ticketID}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (response.ok) {
          setTrips((prev) =>
            prev.map((group) => ({
              ...group,
              tickets: group.tickets.map((t) =>
                t.ticketID === trip.ticketID ? { ...t, status: "cancelled" } : t
              ),
            }))
          );
          setSelectedTrip((prev) => ({ ...prev, status: "cancelled" }));

          setTimeout(() => {
            setSelectedTrip(null);

            setTrips((prevTrips) => {
              const updatedTrips = prevTrips.map((group) => ({
                ...group,
                tickets: group.tickets.filter(
                  (t) => t.ticketID !== trip.ticketID
                ),
              }));
              return updatedTrips.filter((group) => group.tickets.length > 0);
            });

            alert("Đã hủy vé thành công");
          }, 1500);
        } else {
          alert("Lỗi: " + (result.message || "Không thể hủy vé"));
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Lỗi kết nối server");
      }
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

      <div className="trips-container">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((group) => (
            <div key={group.paymentID} className="payment-group-section">
              <div className="payment-header">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    #{group.paymentID}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: group.status === "valid" ? "#16a34a" : "#64748b",
                      fontWeight: "600",
                      marginTop: "2px",
                    }}
                  >
                    {group.tickets.length} vé •{" "}
                    {group.status === "valid" ? "Thành công" : group.status}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Tổng tiền
                  </span>
                  <div
                    className="price-tag"
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#dc2626",
                    }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(group.totalPrice || 0)}
                  </div>
                </div>
              </div>

              <div className="trips-grid animate-fade-in">
                {group.tickets.map((trip) => (
                  <motion.div
                    key={trip.ticketID}
                    className={`trip-card glass-panel ${trip.status}`}
                    whileHover={{ scale: 1.01, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="card-top">
                      <div className="route">
                        <span className="code">{trip.departurePoint}</span>
                        <Plane className="plane-icon" size={16} />
                        <span className="code">{trip.arrivePoint}</span>
                      </div>
                      <span className={`status-badge ${trip.status}`}>
                        {trip.status === "valid" ? "Sắp khởi hành" : "Đã hủy"}
                      </span>
                    </div>
                    <div className="card-body">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          className="info-row"
                          style={{ marginBottom: "4px" }}
                        >
                          <Calendar size={13} style={{ marginRight: "6px" }} />
                          <span style={{ fontSize: "13px" }}>
                            {trip.departureDay}
                          </span>
                        </div>
                        <div
                          className="info-row"
                          style={{ marginBottom: "4px" }}
                        >
                          <Clock size={13} style={{ marginRight: "6px" }} />
                          <span style={{ fontSize: "13px" }}>
                            {trip.departureTime}
                          </span>
                        </div>
                      </div>
                      <div
                        className="info-row flight-num"
                        style={{ marginTop: "6px" }}
                      >
                        <Ticket size={13} />
                        <span style={{ fontSize: "13px" }}>
                          {trip.flightNumber} - {trip.seatNumber}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Plane size={48} />
            <p>Không tìm thấy chuyến bay nào.</p>
          </div>
        )}
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
                            {selectedTrip.departureDay}
                          </span>
                        </div>
                        <div className="path">
                          <div className="line"></div>
                        </div>
                        <div className="point right">
                          <span className="city">
                            {selectedTrip.arrivePoint}
                          </span>
                          <span className="time">
                            {selectedTrip.arriveTime}
                          </span>
                          <span className="date">{selectedTrip.arriveDay}</span>
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
                          <span className="value">
                            {selectedTrip.seatNumber}
                          </span>
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
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyTrips;
