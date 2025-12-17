import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SeatMap from "../BookingFlight/SeatMap";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  AlertTriangle,
  Plane,
} from "lucide-react";
import "../BookingFlight/BookingPage.css";
const SeatMapChange = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { ticket } = location.state || {};
  const [flightFullInfo, setFlightFullInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  // Không còn là mảng array để lưu nhiều ghế nữa rồi
  const [newSelectedSeat, setNewSelectedSeat] = useState(null);

  const [liveSelections, setLiveSelections] = useState({});
  const [pendingSeats, setPendingSeats] = useState([]);
  const [dbOccupiedSeats, setDbOccupiedSeats] = useState([]);
  const { socket, connectSocket, disconnectSocket } = useSocket();
  const socketRef = useRef(socket);
  const displaySelections = liveSelections;
  // Lấy thông tin cụ thể của chuyến bay và những ghế đã bán
  useEffect(() => {
    const fetchFlightDetail = async () => {
      if (!ticket?.flightNumber) return;
      try {
        const response = await fetch(
          `http://localhost:3001/api/staff/flightmanagement/hasflight/${ticket.flightNumber}`
        );
        const result = await response.json();
        if (result.success) {
          setFlightFullInfo(result.flight);
        }

        const seatRes = await fetch(
          `http://localhost:3001/api/user/booking/seats/${ticket.flightNumber}`
        );
        const seatResult = await seatRes.json();
        if (seatResult.success) {
          setDbOccupiedSeats(seatResult.data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlightDetail();
  }, [ticket]);
  // Kết nối socket
  useEffect(() => {
    if (!socket) connectSocket();
  }, [socket, connectSocket]);
  // Logic người dùng join room socket
  useEffect(() => {
    socketRef.current = socket;
    if (!socket || !ticket?.flightNumber) return;

    // Join room
    socket.emit("joinIntoBooking", ticket.flightNumber);

    // Listeners
    const handleUpdateMap = (selections) => setLiveSelections(selections);
    const handleSeatsLocked = ({ seats }) =>
      setPendingSeats((prev) => [...new Set([...prev, ...seats])]);
    const handleSeatUnlocked = ({ seatId }) =>
      setPendingSeats((prev) => prev.filter((id) => id !== seatId));
    const handleSeatsSold = ({ seats }) => {
      // Cập nhật lại danh sách ghế đã bán real-time
      const newOccupied = seats.map((s) => ({ seatNumber: s }));
      setDbOccupiedSeats((prev) => [...prev, ...newOccupied]);

      // Nếu ghế mình đang chọn bị ai đó mua mất
      if (
        newSelectedSeat &&
        seats.some((s) => s.includes(newSelectedSeat.id))
      ) {
        alert("Ghế bạn chọn vừa bị người khác thanh toán!");
        setNewSelectedSeat(null);
      }
    };

    socket.on("updateSeatMap", handleUpdateMap);
    socket.on("seatsLocked", handleSeatsLocked);
    socket.on("seatUnlocked", handleSeatUnlocked);
    socket.on("seatsSold", handleSeatsSold);

    return () => {
      socket.off("updateSeatMap", handleUpdateMap);
      socket.off("seatsLocked", handleSeatsLocked);
      socket.off("seatUnlocked", handleSeatUnlocked);
      socket.off("seatsSold", handleSeatsSold);
    };
  }, [socket, ticket?.flightNumber, newSelectedSeat]);
  // Xử lý khi thoát trang
  useEffect(() => {
    return () => {
      if (newSelectedSeat && socketRef.current) {
        socketRef.current.emit("unlockSeats", {
          flightId: ticket.flightNumber,
          seats: [newSelectedSeat.id],
        });
      }
      disconnectSocket();
    };
  }, []);

  const handleSeatClick = (seatId, type) => {
    if (!socket) return;

    // xác định hạng vé
    const currentClass = ticket.class.toLowerCase();
    const targetClass = type.toLowerCase();

    if (currentClass !== targetClass) {
      alert(
        `Vé của bạn là hạng ${ticket.class}, bạn không thể chọn ghế hạng ${type}. Vui lòng hủy vé để đặt lại nếu muốn nâng hạng.`
      );
      return;
    }

    // Check trạng thái ghế
    const holderId = liveSelections[seatId];
    const myCurrentId = socket.id;

    if (holderId && holderId !== myCurrentId) {
      alert("Ghế này đang có người khác chọn!");
      return;
    }

    if (newSelectedSeat?.id === seatId) {
      socket.emit("selectSeat", { flightId: ticket.flightNumber, seatId });
      setNewSelectedSeat(null);
      return;
    }

    if (newSelectedSeat) {
      socket.emit("unlockSeats", {
        flightId: ticket.flightNumber,
        seats: [newSelectedSeat.id],
      });
    }

    // Lock ghế mới

    setNewSelectedSeat({ id: seatId, type, price: 0 });

    setTimeout(() => {
      socket.emit("selectSeat", {
        flightId: ticket.flightNumber,
        seatId: seatId,
      });
    }, 100);
  };

  const handleConfirmChange = async () => {
    if (!newSelectedSeat) return;

    const confirm = window.confirm(
      `Bạn xác nhận đổi từ ghế ${ticket.seatNumber} sang ghế ${newSelectedSeat.id}?`
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:3001/api/user/mytrip/ticket/change-seat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketID: ticket.ticketID,
            newSeatNumber: newSelectedSeat.id,
            flightNumber: ticket.flightNumber,
            oldseatNumber: ticket.seatNumber,
          }),
        }
      );

      const res = await response.json();
      if (res.success === "success") {
        alert("Đổi ghế thành công!");
        navigate("/user");
      } else {
        alert(res.message || "Đổi ghế thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối server");
    }
  };

  if (loading || !flightFullInfo)
    return <div className="loading-screen">Đang tải sơ đồ ghế...</div>;

  //SeatMap hiển thị đúng
  const selectedSeatsArray = newSelectedSeat ? [newSelectedSeat] : [];

  return (
    <div
      className="booking-layout seat-change-mode"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER ĐƠN GIẢN */}
      <div
        className="compact-header"
        style={{
          flexShrink: 0,
          background: "white",
          zIndex: 10,
          padding: "15px 20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="btn-back"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="header-info" style={{ marginLeft: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Đổi chỗ ngồi</h2>
          <div
            className="flight-route-badge"
            style={{
              color: "#666",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span>{ticket.flightNumber}</span>
            <span className="separator">•</span>
            <span>
              Hạng vé: <b>{ticket.class}</b>
            </span>
            <span className="separator">•</span>
            <span>
              Ghế hiện tại: <b>{ticket.seatNumber}</b>
            </span>
          </div>
        </div>
      </div>

      <div
        className="booking-grid"
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "20px",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {/* --- CỘT TRÁI: INFO & ACTION --- */}
        <div
          className="glass-panel info-column"
          style={{
            width: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            height: "fit-content",
          }}
        >
          <div
            className="current-seat-info"
            style={{
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "1px dashed #ccc",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>
              Ghế hiện tại
            </h4>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              {ticket.seatNumber}
            </div>
          </div>

          <div
            className="arrow-down"
            style={{ textAlign: "center", color: "#007bff" }}
          >
            <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
          </div>

          <div
            className={`new-seat-info ${newSelectedSeat ? "active" : ""}`}
            style={{
              padding: "15px",
              background: newSelectedSeat ? "#e3f2fd" : "#eee",
              borderRadius: "8px",
              border: newSelectedSeat
                ? "1px solid #2196f3"
                : "1px solid transparent",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>Ghế mới</h4>
            {newSelectedSeat ? (
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                {newSelectedSeat.id}
              </div>
            ) : (
              <div style={{ fontStyle: "italic", color: "#999" }}>
                Chưa chọn ghế
              </div>
            )}
          </div>

          <div
            className="alert-box"
            style={{
              fontSize: "13px",
              color: "#d32f2f",
              display: "flex",
              gap: "8px",
              alignItems: "start",
            }}
          >
            <AlertTriangle
              size={16}
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <span>
              Bạn chỉ được đổi sang các ghế trống cùng hạng{" "}
              <b>{ticket.class}</b>.
            </span>
          </div>

          <button
            onClick={handleConfirmChange}
            disabled={!newSelectedSeat}
            style={{
              marginTop: "10px",
              padding: "12px",
              background: newSelectedSeat ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: newSelectedSeat ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Save size={18} /> Xác nhận đổi ghế
          </button>
        </div>

        {/* --- CỘT PHẢI: MAP (TÁI SỬ DỤNG) --- */}
        <div
          className="glass-panel seat-column"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Component SeatMap được tái sử dụng */}
          <div
            className="seat-picker-wrapper custom-scrollbar"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <SeatMap
              liveSelections={liveSelections}
              pendingSeats={pendingSeats}
              mySocketID={socket ? socket.id : null}
              selectedSeats={selectedSeatsArray} // Pass mảng chứa 1 ghế
              occupiedSeats={dbOccupiedSeats}
              onSeatClick={handleSeatClick}
              flightSelected={flightFullInfo}
            />
          </div>

          {/* Chú thích đơn giản */}
          <div
            className="seat-legend"
            style={{
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "15px",
                fontSize: "12px",
                justifyContent: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    background: "#ddd",
                    borderRadius: 4,
                  }}
                ></span>{" "}
                Đã bán/Ghế cũ
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                ></span>{" "}
                Còn trống
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    background: "#4caf50",
                    borderRadius: 4,
                  }}
                ></span>{" "}
                Đang chọn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SeatMapChange;
