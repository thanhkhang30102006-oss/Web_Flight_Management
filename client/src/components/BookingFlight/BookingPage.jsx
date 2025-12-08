import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom"; // Hook Fiều hướng
import SeatMap from "./SeatMap";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { io } from "socket.io-client";
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
import CountdownTimer from "../Timer/CountdownTimer";
const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedSeatsRef = useRef(selectedSeats);
  const [liveSelections, setLiveSelections] = useState({});
  const [mySocketID, setMySocketID] = useState(null);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [pendingBooking, setPendingBooking] = useState(null);
  const isNavigatingToPayment = useRef(false);
  const [dbOccupiedSeats, setDbOccupiedSeats] = useState([]);
  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      const currentFlight = location.state?.flight || pendingBooking?.flight;

      if (currentFlight?.flightNumber) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/user/booking/seats/${currentFlight.flightNumber}`
          );
          const result = await response.json();

          if (result.success) {
            setDbOccupiedSeats(result.data);
          }
        } catch (error) {
          console.error("Không thể tải danh sách ghế đã bán:", error);
        }
      }
    };

    fetchOccupiedSeats();
  }, [location.state, pendingBooking]);
  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    if (savedBooking) {
      const parsedData = JSON.parse(savedBooking);
      const currentTime = new Date().getTime();
      const expiredTime = new Date(parsedData.expiredTime).getTime();

      if (currentTime >= expiredTime) {
        localStorage.removeItem("pendingBooking");
        setPendingBooking(null);
        setSelectedSeats([]);
      } else {
        setPendingBooking(parsedData);
        setSelectedSeats(parsedData.selectedSeats || []);
      }
    }
  }, []);

  // Lấy dữ liệu chuyến bay từ trang trước (nếu có), nếu không dùng dữ liệu giả để test
  const flight = location.state?.flight || {};
  const { socket, connectSocket, disconnectSocket } = useSocket();
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);
  useEffect(() => {
    if (!socket) {
      console.log("Socket chưa có, đang tiến hành kết nối...");
      connectSocket();
    }
  }, [socket, connectSocket]);
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  useEffect(() => {
    if (!socket) return;
    setMySocketID(socket.id);
    if (flight && flight.flightNumber) {
      socket.emit("joinIntoBooking", flight.flightNumber);
      console.log(
        `Đã gửi thành công yêu cầu đặt phòng, ${flight.flightNumber}`
      );
    }
    const handleUpdateMap = (selections) => setLiveSelections(selections);
    const handleSeatsLocked = ({ seats }) => {
      setPendingSeats((prev) => [...new Set([...prev, ...seats])]);
    };

    const handleSeatUnlocked = ({ seatId }) => {
      setPendingSeats((prev) => prev.filter((id) => id !== seatId));
    };

    socket.on("updateSeatMap", handleUpdateMap);
    socket.on("seatsLocked", handleSeatsLocked);
    socket.on("seatUnlocked", handleSeatUnlocked);
    return () => {
      socket.off("updateSeatMap", handleUpdateMap);
      socket.off("seatsLocked", handleSeatsLocked);
      socket.off("seatUnlocked", handleSeatUnlocked);
    };
  }, [socket, flight.flightNumber]);
  useEffect(() => {
    if (!socket) return;

    socket.on("updateSeatMap", (updatedMap) => {
      console.log("Nhận map mới từ server:", updatedMap);
      setLiveSelections(updatedMap);
    });
  }, [socket]);
  useEffect(() => {
    isNavigatingToPayment.current = false;

    return () => {
      if (!isNavigatingToPayment.current) {
        console.log("Người dùng rời khỏi luồng đặt vé -> Hủy Socket & Storage");
        const seatsToRelease = selectedSeatsRef.current;

        if (seatsToRelease.length > 0 && socketRef.current) {
          const seatIds = seatsToRelease.map((s) => s.id);

          socketRef.current.emit("unlockSeats", {
            flightId: flight.flightNumber,
            seats: seatIds,
          });

          console.log("Đã gửi yêu cầu unlock seats:", seatIds);
        }
        disconnectSocket();

        localStorage.removeItem("pendingBooking");
      } else {
        console.log("Người dùng chuyển sang trang thanh toán -> Giữ kết nối");
      }
    };
  }, []);
  useEffect(() => {
    const total = selectedSeats.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  }, [selectedSeats]);
  useEffect(() => {
    if (!pendingBooking || !pendingBooking.expiredTime) return;

    const checkExpiryInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const expiredTime = new Date(pendingBooking.expiredTime).getTime();

      if (currentTime >= expiredTime) {
        alert("Thời gian giữ ghế đã hết! Bạn có thể đặt lại.");

        // --- ĐOẠN CODE CẦN THÊM ---
        if (socket && pendingBooking.selectedSeats) {
          // Lấy danh sách ID ghế
          const seatsToUnlock = pendingBooking.selectedSeats.map((s) => s.id);
          socket.emit("unlockSeats", {
            flightId: flight.flightNumber,
            seats: seatsToUnlock,
          });
        }
        // ---------------------------

        localStorage.removeItem("pendingBooking");
        setPendingBooking(null);
        setSelectedSeats([]);

        setPendingSeats((prev) =>
          prev.filter(
            (id) => !pendingBooking.selectedSeats.map((s) => s.id).includes(id)
          )
        );

        clearInterval(checkExpiryInterval);
      }
    }, 1000);
    return () => clearInterval(checkExpiryInterval);
  }, [pendingBooking, socket, flight.flightNumber]);
  const [loading, setLoading] = useState(false);
  const [passenger, setPassenger] = useState({
    name: "",
    email: "",
    phone: "",
    luggage: "",
    passport: "",
  });

  const isBookingValid = () => {
    // 1. Phải chọn ít nhất 1 ghế
    const hasSeats = selectedSeats.length > 0;
    const hasInfo =
      passenger.name.trim() !== "" &&
      passenger.email.trim() !== "" &&
      passenger.phone.trim() !== "" &&
      passenger.passport.trim() !== "";
    return hasSeats && hasInfo;
  };
  const occupiedSeats = [];
  const handlePassengerChange = (e) => {
    const { name, value } = e.target;
    setPassenger((prev) => ({ ...prev, [name]: value }));
  };
  const handlePayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thanh toán!");
      return;
    }
    const response = await fetch(
      `http://localhost:3001/api/user/booking/payment/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: flight.flightNumber,
          seats: selectedSeats,
          totalPrice: totalPrice,
          passengerInfo: passenger,
        }),

        credentials: "include",
      }
    );
    const result = await response.json();

    if (!response.ok) {
      alert(data.message);
      const errorText = await response.text();
      console.error("Lỗi từ Server:", errorText);
      alert(
        `Lỗi khi gửi thông tin thanh toán (${response.status}): Vui lòng kiểm tra lại thông tin.`
      );
      return;
    } else {
      isNavigatingToPayment.current = true;
      const paymentData = {
        flight,
        selectedSeats,
        passenger,
        totalPrice,
        paymentInfo: result.data,
        expiredTime: result.data.expiredTime,
      };

      localStorage.setItem("pendingBooking", JSON.stringify(paymentData));
      navigate("/user/payment", {
        state: paymentData,
      });
    }
  };
  const handleResumePayment = () => {
    if (pendingBooking) {
      const currentExpiredTime = pendingBooking?.expiredTime;

      const bookingData = {
        selectedSeats: selectedSeats,
        totalPrice: totalPrice,
        flight: flight,
        expiredTime: currentExpiredTime,
      };
      isNavigatingToPayment.current = true;
      navigate("/user/payment", { state: pendingBooking });
    }
  };
  const handleSeatClick = (seatId, type) => {
    if (!socket) return;
    const holderId = liveSelections[seatId];
    const myCurrentId = socket.id;
    console.log(
      `Ghế: ${seatId} | Người giữ: ${holderId} | Tui là: ${myCurrentId}`
    );
    console.log(pendingSeats);

    if (pendingBooking) {
      alert("Bạn đang có ghế chưa thanh toán không thể đặt thêm ghế");
      return;
    }
    if (holderId && holderId !== myCurrentId) {
      alert("Ghế này đang có người khác chọn!");
      return;
    }
    const isUnselecting = holderId === myCurrentId;
    if (isUnselecting) {
      socket.emit("selectSeat", {
        flightId: flight.flightNumber,
        seatId,
      });
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
    } else {
      if (selectedSeats.length >= 5) {
        alert("Bạn chỉ được chọn tối đa 5 ghế!");
        return;
      }

      socket.emit("selectSeat", {
        flightId: flight.flightNumber,
        seatId: seatId,
      });
      //
      const basePrice = flight.finalPrice?.economy || 0;
      const businessPrice = flight.finalPrice?.business || 0;

      const seatPrice = type === "business" ? businessPrice : basePrice;

      const newSeatItem = {
        id: seatId,
        type: type,
        price: seatPrice,
      };
      setSelectedSeats((prev) => [...prev, newSeatItem]);
    }
  };

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
            <div className="row-2-input">
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
              <div className="form-group">
                <label>
                  <CreditCard size={16} /> {t("bookingPage.form.passport")}{" "}
                </label>
                <input
                  type="text"
                  name="passport"
                  placeholder={t("bookingPage.form.passportPlaceholder")}
                  value={passenger.passport}
                  onChange={handlePassengerChange}
                />
              </div>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="summary-box">
              <div className="summary-row">
                <span>{t("bookingPage.summary.basePrice")}</span>
                <span>
                  {Number(flight.finalPrice?.economy).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
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
              className={`checkout-btn ${
                isBookingValid() ? "active" : "disabled"
              }`}
              // Logic: Nếu chưa Valid thì Disabled = true
              disabled={!isBookingValid()}
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
            {/* Component SeatMap mới */}
            <div className="seat-picker-wrapper custom-scrollbar">
              <SeatMap
                liveSelections={liveSelections}
                pendingSeats={pendingSeats}
                mySocketID={socket ? socket.id : null}
                selectedSeats={selectedSeats}
                occupiedSeats={dbOccupiedSeats}
                onSeatClick={handleSeatClick}
                flightSelected={flight}
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
            <div className="screen-indicator">
              {t("bookingPage.seatMap.screenDirection")}
            </div>{" "}
          </div>
        </div>
      </motion.div>

      {pendingBooking && (
        <div
          style={{
            position: "fixed", // Cố định vị trí
            bottom: 0, // Dính sát đáy
            left: 0, // Dính sát trái
            width: "100%", // Rộng toàn màn hình
            background: "white",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.2)", // Đổ bóng nhẹ cho đẹp
            padding: "10px 20px",
            zIndex: 9999, // Luôn nổi lên trên
            borderTop: "3px solid #f0ad4e", // Viền vàng cảnh báo
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {/* Component Timer Thanh Ngang */}
          <CountdownTimer
            targetDate={pendingBooking.expiredTime}
            totalDuration={600} // Giả sử 10 phút, bạn có thể chỉnh số này
            onExpire={() => {
              alert("Hết giờ giữ ghế!");
            }}
          />

          {/* Hàng nút bấm */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "5px",
            }}
          >
            <div>
              <strong>
                Đang giữ {pendingBooking.selectedSeats?.length || 0} ghế
              </strong>
              <span style={{ margin: "0 10px", color: "#666" }}>|</span>
              <span style={{ color: "#28a745", fontWeight: "bold" }}>
                {pendingBooking.totalPrice?.toLocaleString()} VND
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleResumePayment}
                style={{
                  padding: "8px 24px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Thanh toán ngay →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
