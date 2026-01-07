import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SeatMap from "../BookingFlight/SeatMap";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import toast, { Toaster } from "react-hot-toast";

import {
  ArrowLeft,
  ArrowRight,
  Save,
  AlertTriangle,
  Plane,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import "./SeatMapChange.css";
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";

const SeatMapChange = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { ticket } = location.state || {};
  const [flightFullInfo, setFlightFullInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSelectedSeat, setNewSelectedSeat] = useState(null);

  const [liveSelections, setLiveSelections] = useState({});
  const [pendingSeats, setPendingSeats] = useState([]);
  const [dbOccupiedSeats, setDbOccupiedSeats] = useState([]);
  const { socket, connectSocket, disconnectSocket } = useSocket();
  const socketRef = useRef(socket);
  const [isProcessing, setIsProcessing] = useState(false);
  const displaySelections = liveSelections;

  // xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
        toast.error("Ghế bạn chọn vừa bị người khác thanh toán!");
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
      toast.error(
        `Vé của bạn là hạng ${ticket.class}, bạn không thể chọn ghế hạng ${type}. Vui lòng hủy vé để đặt lại nếu muốn nâng hạng.`
      );
      return;
    }

    // Check trạng thái ghế
    const holderId = liveSelections[seatId];
    const myCurrentId = socket.id;

    if (holderId && holderId !== myCurrentId) {
      toast.error("Ghế này đang có người khác chọn!");
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
    setShowConfirmModal(true);
  };

  const executeChangeSeat = async () => {
    setShowConfirmModal(false); // Đóng modal trước
    setIsProcessing(true);
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (res.success === "success") {
        toast.success("Đổi ghế thành công!");
        navigate("/user?tab=mytrips");
      } else {
        toast.error(res.message || "Đổi ghế thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !flightFullInfo)
    return <div className="loading-screen">Đang tải sơ đồ ghế...</div>;

  //SeatMap hiển thị đúng
  const selectedSeatsArray = newSelectedSeat ? [newSelectedSeat] : [];

  return (
    <div className="seatmap-change-layout">
      {/* 1. BACKGROUND VIDEO */}
      <video className="seatmap-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
      </video>
      <Toaster />
      <div className="seatmap-overlay"></div>

      <div className="seatmap-content-wrapper">
        {/* HEADER */}
        <div className="compact-header">
          <button
            onClick={() => navigate(-1)}
            className="btn-back"
            style={{ color: "#00ff08ff" }}
          >
            <ArrowLeft size={30} />
          </button>
          <div className="header-info" style={{ marginLeft: "15px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#ffffffff" }}>
              Đổi chỗ ngồi
            </h2>
            <div className="flight-route-badge" style={{ color: "#ffffffff" }}>
              <span style={{ fontWeight: "bold" }}>{ticket.flightNumber}</span>
              <span className="separator">•</span>
              <span>
                Hạng vé: <b>{ticket.class}</b>
              </span>
              <span className="separator">•</span>
              <span>
                Ghế cũ: <b>{ticket.seatNumber}</b>
              </span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="seatchange-booking-grid">
          {/* --- CỘT TRÁI: INFO --- */}
          <div className="glass-panel seatchange-info-column">
            <div className="current-seat-info">
              <h4>Ghế hiện tại</h4>
              <div>{ticket.seatNumber}</div>
            </div>

            {/* Mũi tên */}
            <div className="arrow-down">
              <ArrowRight size={24} />
            </div>

            {/* Ghế mới chọn */}
            <div className={`new-seat-info ${newSelectedSeat ? "active" : ""}`}>
              <h4>Ghế mới chọn</h4>
              {newSelectedSeat ? (
                <div className="selected-seat-id">{newSelectedSeat.id}</div>
              ) : (
                <div className="placeholder-text">
                  Vui lòng chọn ghế trên sơ đồ
                </div>
              )}
            </div>

            {/* Cảnh báo */}
            <div className="alert-box">
              <AlertTriangle
                size={16}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span>
                Chỉ được đổi sang các ghế trống cùng hạng <b>{ticket.class}</b>.
              </span>
            </div>

            {/* Nút xác nhận */}
            <button
              className="confirm-btn"
              onClick={handleConfirmChange}
              disabled={!newSelectedSeat}
            >
              <Save size={20} /> Xác nhận đổi ghế
            </button>
          </div>

          {/* --- CỘT PHẢI: MAP --- */}
          <div
            className="glass-panel seat-column"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="seat-picker-wrapper custom-scrollbar"
              style={{ flex: 1, overflowY: "auto" }}
            >
              <SeatMap
                liveSelections={liveSelections}
                pendingSeats={pendingSeats}
                mySocketID={socket ? socket.id : null}
                selectedSeats={selectedSeatsArray}
                occupiedSeats={dbOccupiedSeats}
                onSeatClick={handleSeatClick}
                flightSelected={flightFullInfo}
              />
            </div>

            {/* Chú thích */}
            <div className="seat-legend">
              <div className="legend-row">
                <div className="legend-item">
                  <span className="box available"></span>
                  {t("bookingPage.seatMap.legend.economy", "Phổ thông")}
                </div>
                <div className="legend-item">
                  <span className="box business"></span>
                  {t("bookingPage.seatMap.legend.business", "Thương gia")}
                </div>
                <div className="legend-item">
                  <span className="box occupied"></span>
                  {t("bookingPage.seatMap.legend.occupied", "Đã bán")}
                </div>
              </div>

              <div className="legend-row">
                <div className="legend-item">
                  <span className="box selected economy"></span>
                  <span className="box selected business"></span>
                  {t(
                    "bookingPage.seatMap.legend.selected.another",
                    "Đang chọn của khách hàng khác"
                  )}
                </div>
                <div className="legend-item">
                  <span className="box selected"></span>
                  <span className="box selected business personal"></span>
                  {t(
                    "bookingPage.seatMap.legend.selected.personal",
                    "Đang chọn của mình"
                  )}
                </div>
              </div>

              <div className="legend-row">
                <div className="legend-item">
                  <span className="box pending"></span>
                  {t("bookingPage.seatMap.legend.pending", "Đang giữ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 4. MODAL XÁC NHẬN */}
      {showConfirmModal && (
        <div className="modal-overlay-custom">
          <div className="modal-content-glass">
            <div className="modal-header">
              <h3>Xác nhận đổi ghế</h3>
              <button
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn đổi từ ghế <b>{ticket.seatNumber}</b> sang
                ghế <b>{newSelectedSeat?.id}</b> không?
              </p>
              <div className="change-summary">
                <span>{ticket.seatNumber}</span> <ArrowRight size={16} />{" "}
                <span>{newSelectedSeat?.id}</span>
              </div>
              <p className="note">
                Lưu ý: Hành động này không thể hoàn tác ngay lập tức.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn-confirm" onClick={executeChangeSeat}>
                <CheckCircle size={18} /> Đồng ý đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isProcessing && (
        <div className="fullscreen-loading">
          <div className="loading-content">
            <div className="spinner-large"></div>
            <p>Đang xử lý đổi ghế...</p>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Vui lòng không tắt trình duyệt
            </span>
          </div>
        </div>
      )}

      {/* Style CSS cho Modal (Bạn có thể move vào file CSS riêng) */}
      <style jsx>{`
        .modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modal-content-glass {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 400px;
          max-width: 90%;
          color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }
        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        .close-btn:hover {
          color: #fff;
        }
        .modal-body {
          padding: 24px;
          text-align: center;
        }
        .change-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin: 15px 0;
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
        }
        .note {
          font-size: 13px;
          color: #94a3b8;
          font-style: italic;
          margin-top: 10px;
        }
        .modal-footer {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          padding: 8px 16px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid #475569;
          color: #cbd5e1;
          cursor: pointer;
        }
        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .btn-confirm {
          padding: 8px 16px;
          border-radius: 6px;
          background: #2563eb;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-confirm:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
};
export default SeatMapChange;
