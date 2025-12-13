import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
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
} from "lucide-react";
import "./BookingSuccess.css";
// Import video background nếu muốn dùng chung background với booking
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";

const BookSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const ticketRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Lấy dữ liệu từ State
  const { flight, passenger, totalPrice, ticketInfo, selectedSeats } =
    location.state || {};

  // 2. Redirect nếu không có dữ liệu (User truy cập trực tiếp link)
  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  if (!location.state) return null;

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
        useCORS: true, // Cho phép tải ảnh từ nguồn khác (nếu có logo online)
        backgroundColor: "#1f2937", // Đặt nền tối giả lập vì ảnh trong suốt ra ngoài sẽ khó đọc
        scale: 2, // Tăng độ nét
      });

      // Tạo link tải
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `FlightTicket_${ticketInfo?.bookingCode || "CODE"}.png`;
      link.click();
    } catch (err) {
      console.error("Lỗi tải vé:", err);
      alert("Không thể tải vé. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };
  // CÁCH B: Tải dạng PDF (Chuyên nghiệp hơn nhưng có thể mất hiệu ứng Glass)
  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#1a202c", // Màu nền PDF
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
      title: "Vé máy bay điện tử",
      text: `Tôi vừa đặt vé máy bay đi ${flight?.arrivePoint}! Mã đặt chỗ: ${ticketInfo?.bookingCode}`,
      url: window.location.href, // Hoặc link website của bạn
    };

    // Kiểm tra trình duyệt có hỗ trợ Web Share API không (Hoạt động tốt trên Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Đã hủy chia sẻ");
      }
    } else {
      // Fallback cho PC: Copy nội dung vào clipboard
      const textToCopy = `Chuyến bay: ${flight?.flightNumber}\nTừ: ${
        flight?.departurePoint
      } - Đến: ${flight?.arrivePoint}\nMã vé: ${
        ticketInfo?.bookingCode
      }\nGhế: ${selectedSeats?.map((s) => s.id).join(", ")}`;
      navigator.clipboard.writeText(textToCopy);
      alert("Đã sao chép thông tin vé vào bộ nhớ tạm!");
    }
  };

  if (!location.state) return null;

  return (
    <div className="success-page-layout">
      {/* Background Video (Tùy chọn) */}
      <video className="success-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
      </video>
      <div className="success-overlay"></div>

      <motion.div
        className="success-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
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
            <span>Mã Vé:</span>
            <span className="ref-code">
              {ticketInfo?.bookingCode || "VN-X8892"}{" "}
              {/* Skibidi -----------------Dữ liệu */}
            </span>
          </div>
        </div>

        <div className="success-content-grid">
          {/* --- PHẦN 2: CHI TIẾT VÉ (Giao diện vé máy bay) --- */}
          <div className="glass-panel ticket-section" ref={ticketRef}>
            <div className="panel-header">
              <Plane size={18} /> Vé điện tử
            </div>
            {/* Ticket Visual - Tái sử dụng style của bạn */}
            <div className="ticket-visual success-mode">
              <div className="ticket-header">
                <div className="airline-brand">
                  <Plane className="airline-logo-placeholder" size={24} />
                  <span className="flight-no">{flight.flightNumber}</span>
                </div>
                <span className="flight-status confirmed">Đã xác nhận</span>
              </div>

              <div className="ticket-body">
                <div className="route-point">
                  <span className="city-code">{flight.departurePoint}</span>
                  <span className="time-large">{flight.departureTime}</span>
                  <span className="date-small">{flight.departureDay}</span>
                </div>

                <div className="flight-path">
                  <span className="duration">Bay thẳng</span>
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
                    Ghế:{" "}
                    {/* =-=-=-=----------------------------------=-=-=-==-= */}
                    <b>
                      {selectedSeats?.map((s) => s.id).join(", ") ||
                        ticketInfo?.seats?.join(", ")}
                    </b>
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
              <span>Tổng thanh toán</span>
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
              Vé điện tử - Vui lòng xuất trình tại quầy check-in
            </div>
          </div>

          {/* --- PHẦN 3: THÔNG TIN KHÁCH HÀNG & LIÊN HỆ --- */}
          <div className="glass-panel info-section">
            <div className="panel-header">
              <User size={18} /> Thông tin khách hàng
            </div>

            <div className="info-list">
              <div className="info-row">
                <div className="label">
                  <User size={14} /> Họ và tên
                </div>
                <div className="value">{passenger.name}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <Mail size={14} /> Email
                </div>
                <div className="value">{passenger.email}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <Phone size={14} /> Số điện thoại
                </div>
                <div className="value">{passenger.phone}</div>
              </div>
              <div className="info-row">
                <div className="label">
                  <CreditCard size={14} /> Hộ chiếu/CCCD
                </div>
                <div className="value">{passenger.passport}</div>
              </div>
              <div className="divider-line"></div>
              <div className="info-row">
                <div className="label">
                  <Calendar size={14} /> Ngày đặt
                </div>
                <div className="value">
                  {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-secondary-glass"
                onClick={handleDownloadPDF} // Hoặc đổi thành handleDownloadPDF
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isProcessing ? "Đang tạo..." : "Tải vé (Ảnh)"}
              </button>

              {/* NÚT CHIA SẺ */}
              <button className="btn-secondary-glass" onClick={handleShare}>
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* --- PHẦN 4: NÚT ĐIỀU HƯỚNG --- */}
        <div className="footer-actions">
          <button className="btn-home" onClick={() => navigate("/user")}>
            <Home size={20} /> Về trang chủ
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookSuccess;
