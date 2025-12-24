import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  Home,
  Plane,
  Download,
  Share2,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  QrCode,
  Loader2,
  Ticket,
  Cloud,
  Wind,
} from "lucide-react";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";
import "./BookingSuccess.css";
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";

// --- SUB-COMPONENT: ANIMATION CẤT CÁNH ---
const TakeoffOverlay = () => {
  const { t } = useTranslation();
  // Cấu hình ngẫu nhiên cho mây
  const clouds = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    y: Math.random() * 80 - 10,
    size: 200 + Math.random() * 50,
    duration: 1.5 + Math.random() * 4,
    delay: Math.random() * 0.5,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  // Cấu hình ngẫu nhiên cho gió
  const windLines = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    y: Math.random() * 80 - 10,
    width: 100 + Math.random() * 300,
    duration: 0.6 + Math.random() * 0.8,
    delay: Math.random() * 0.5,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <motion.div
      className="takeoff-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. Hiệu ứng Mây trôi (Phải sang Trái) */}
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          className="takeoff-cloud"
          style={{ top: `${cloud.y}%` }}
          initial={{ x: "130vw", opacity: 0 }}
          animate={{ x: "-20vw", opacity: [0, 0.8, 0.8, 0] }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "linear",
            delay: cloud.delay,
          }}
        >
          <Cloud
            size={cloud.size}
            fill="white"
            stroke="none"
            style={{ opacity: 0.6 }}
          />
        </motion.div>
      ))}

      {/* 2. Hiệu ứng Gió (Phải sang Trái - Nhanh) */}
      {windLines.map((wind) => (
        <motion.div
          key={`wind-line-${wind.id}`}
          className="wind-line"
          style={{
            top: `${wind.y}%`,
            width: `${wind.width}px`, // Áp dụng chiều dài random
          }}
          initial={{ x: "110vw", opacity: 0 }}
          animate={{ x: "-50vw", opacity: [0, wind.opacity, 0] }}
          transition={{
            duration: wind.duration,
            repeat: Infinity,
            ease: "linear",
            delay: wind.delay,
          }}
        />
      ))}

      {/* 4. Máy bay cất cánh (Dưới lên trên) */}
      <motion.img
        src={airplaneIcon}
        className="takeoff-plane-img"
        style={{ width: 150 }}
        initial={{
          x: "-20vw",
          y: "100vh",
          rotate: 0,
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          x: ["-80vw", "40vw", "120vw"],
          y: ["80vh", "0vh", "-60vh"],
          scale: [0.5, 2.5, 3],
          rotate: [-25, -5, 5],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 6,
          times: [0, 0.5, 1],
          ease: [0.45, 0.95, 0.55, 0.95],
          delay: 0.1,
        }}
      />

      {/* Text tạm biệt (Optional) */}
      <motion.h2
        style={{
          position: "absolute",
          bottom: "15%",
          color: "white",
          fontSize: "3.4rem",
          fontWeight: "600",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          width: "100%",
          textAlign: "center",
          zIndex: 20,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {t(
          "booking.success.animationText",
          "Chúc quý khách chuyến bay tốt đẹp!"
        )}
      </motion.h2>
    </motion.div>
  );
};

const BookSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const ticketRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  // 1. Lấy dữ liệu từ State
  const { flight, passenger, totalPrice, ticketInfo, selectedSeats } =
    location.state || {};
  const tickets = ticketInfo.tickets;
  const ticketIds = tickets.map((ticket) => ticket.ticketID);
  const allTicketIds = ticketIds;
  // 2. Redirect nếu không có dữ liệu (User truy cập trực tiếp link)
  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  if (!location.state) return null;
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error(t("booking.success.alerts.loginRequired"));
      return;
    }
    const currentLanguage = i18n.language;

    const sendEmailInfo = async () => {
      const response = await fetch(
        `http://localhost:3001/api/user/booking/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            flight: flight,
            passenger: passenger,
            totalPrice: totalPrice,
            ticketInfo: ticketInfo,
            selectedSeats: selectedSeats,
            language: i18n.language,
          }),

          credentials: "include",
        }
      );
      if (response.success) {
        toast.success(t("booking.success.alerts.emailSent"));
      }
    };
    sendEmailInfo();
  }, []);
  // Format tiền tệ
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Tai về

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setIsProcessing(true);
    try {
      // Chụp phần ticketRef
      const canvas = await html2canvas(ticketRef.current, {
        useCORS: true,
        backgroundColor: "#1f2937",
        scale: 2,
      });

      // Tạo link tải
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `FlightTicket_${ticketInfo?.bookingCode || "CODE"}.png`;
      link.click();
    } catch (err) {
      console.error("Lỗi tải vé:", err);
      toast.error(t("booking.success.alerts.downloadError"));
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#1a202c",
      });
      const imgData = canvas.toDataURL("image/png");

      // Tạo PDF khổ A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ve_May_Bay_${ticketInfo?.bookingCode}.pdf`);
    } catch (error) {
      console.error("Lỗi PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- CHỨC NĂNG 2: CHIA SẺ ---
  const handleShare = async () => {
    const shareData = {
      title: t("booking.success.shareContent.title"),
      text: t("booking.success.shareContent.text", {
        destination: flight?.arrivePoint,
        code: ticketInfo?.bookingCode,
      }),
      url: window.location.href,
    };

    // Kiểm tra trình duyệt có hỗ trợ Web Share API không (Hoạt động tốt trên Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Đã hủy chia sẻ");
        toast.success(t("booking.success.alerts.shareCancelled"));
      }
    } else {
      // Fallback cho PC: Copy nội dung vào clipboard
      const textToCopy = t("booking.success.shareContent.clipboard", {
        flightNo: flight?.flightNumber,
        from: flight?.departurePoint,
        to: flight?.arrivePoint,
        code: ticketInfo?.bookingCode,
        seats: selectedSeats?.map((s) => s.id).join(", "),
      });
      navigator.clipboard.writeText(textToCopy);
      toast.success(t("booking.success.alerts.clipboardSuccess"));
    }
  };

  if (!location.state) return null;

  const handleGoHome = () => {
    // 1. Bật animation
    setIsLeaving(true);

    // 2. Đợi animation chạy xong (ví dụ 2.2 giây) rồi mới chuyển trang
    setTimeout(() => {
      navigate("/user");
    }, 5000);
  };

  return (
    <div className="success-page-layout">
      {/* Background Video (Tùy chọn) */}
      <video className="success-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
      </video>
      <div className="success-overlay"></div>
      <Toaster position="top-center" reverseOrder={false} />

      <AnimatePresence>
        {isLeaving && <TakeoffOverlay key="takeoff" />}
      </AnimatePresence>

      <motion.div
        className="success-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isLeaving ? 0 : 1, y: isLeaving ? -50 : 0 }} // Fade out khi bấm Home
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* --- PHẦN 1: HEADER THÔNG BÁO --- */}
        <div className="success-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <CheckCircle size={54} className="success-icon" />
          </motion.div>
          <h1>{t("booking.success.title", "Đặt vé thành công!")}</h1>
          <p>
            {t(
              "booking.success.subtitle",
              "Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi."
            )}
          </p>
          <div className="booking-ref">
            <span>{t("booking.success.refCode")}</span>{" "}
            <span className="ref-code">
              {allTicketIds[0]}
              {/* Skibidi -----------------Dữ liệu */}
            </span>
          </div>
        </div>

        <div className="success-content-grid">
          {/* --- PHẦN 2: CHI TIẾT VÉ (Giao diện vé máy bay) --- */}
          <div className="glass-panel ticket-section" ref={ticketRef}>
            <div className="panel-header">
              <Plane size={18} /> {t("booking.success.ticket.header")}{" "}
            </div>
            {/* Ticket Visual - Tái sử dụng style của bạn */}
            <div className="ticket-visual success-mode">
              <div className="ticket-header">
                <div className="airline-brand">
                  <Plane className="airline-logo-placeholder" size={24} />
                  <span className="flight-no">{flight.flightNumber}</span>
                </div>
                <span className="flight-status confirmed">
                  {t("booking.success.ticket.status")}
                </span>
              </div>

              <div className="ticket-body">
                <div className="route-point">
                  <span className="city-code">{flight.departurePoint}</span>
                  <span className="time-large">{flight.departureTime}</span>
                  <span className="date-small">{flight.departureDay}</span>
                </div>

                <div className="flight-path">
                  <span className="duration">
                    {t("booking.success.ticket.directFlight")}
                  </span>{" "}
                  <div className="path-line">
                    <div className="dot start"></div>
                    <Plane className="plane-icon-center" size={20} />
                    <div className="dot end"></div>
                  </div>
                  <span className="type">{flight.planeType}</span>
                </div>

                <div className="route-point text-right">
                  <span className="city-code">{flight.arrivePoint}</span>
                  <span className="time-large">{flight.arriveTime}</span>
                  <span className="date-small">{flight.arriveDay}</span>
                </div>
              </div>

              <div className="ticket-footer-success">
                <div className="tf-item">
                  <Armchair size={16} />
                  <span>
                    {t("booking.success.ticket.seatLabel")}{" "}
                    <b>
                      {ticketInfo.seats.map((seat, index) => (
                        <span key={index}>
                          {seat.seatNumber.replace(
                            flight.flightNumber,
                            ""
                          )}{" "}
                        </span>
                      ))}
                    </b>
                  </span>
                </div>
                <div className="tf-item">
                  <Ticket size={16} />
                  <span>
                    Mã Vé: <b>{allTicketIds[0]}</b>
                  </span>
                </div>
                <div className="tf-item">
                  <QrCode size={16} />
                  <span>E-Ticket</span>
                </div>
              </div>

              {/* Notches */}
              <div className="ticket-notch left"></div>
              <div className="ticket-notch right"></div>
            </div>
            {/* Total Price Box */}
            <div className="total-paid-box">
              <span>{t("booking.success.ticket.totalPaid")}</span>{" "}
              <span className="amount">{formatCurrency(totalPrice)}</span>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              {t("booking.success.ticket.footerNote")}{" "}
            </div>
          </div>

          {/* --- PHẦN 3: THÔNG TIN KHÁCH HÀNG & LIÊN HỆ --- */}
          <div className="glass-panel info-section">
            <div className="panel-header">
              <User size={18} /> {t("booking.success.info.header")}{" "}
            </div>

            <div className="info-list">
              <div className="info-row">
                <div className="label">
                  <User size={14} /> {t("booking.success.info.name")}{" "}
                </div>
                <div className="value">{passenger.name}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <Mail size={14} /> {t("booking.success.info.email")}{" "}
                </div>
                <div className="value">{passenger.email}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <Phone size={14} /> {t("booking.success.info.phone")}{" "}
                </div>
                <div className="value">{passenger.phone}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <CreditCard size={14} />{" "}
                  {t("booking.success.info.passport")}{" "}
                </div>
                <div className="value">{passenger.passport}</div>
              </div>
              <div className="divider-line"></div>
              <div className="info-row">
                <div className="label">
                  <Calendar size={14} /> {t("booking.success.info.date")}{" "}
                </div>
                <div className="value">
                  {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-secondary-glass"
                onClick={handleDownloadPDF}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isProcessing
                  ? t("booking.success.buttons.downloading")
                  : t("booking.success.buttons.downloadImage")}{" "}
              </button>

              {/* NÚT CHIA SẺ */}
              <button className="btn-secondary-glass" onClick={handleShare}>
                <Share2 size={18} /> {t("booking.success.buttons.share")}{" "}
              </button>
            </div>
          </div>
        </div>

        {/* --- PHẦN 4: NÚT ĐIỀU HƯỚNG --- */}
        <div className="footer-actions">
          <button className="btn-home" onClick={handleGoHome}>
            <Home size={20} /> {t("booking.success.buttons.home")}{" "}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookSuccess;
