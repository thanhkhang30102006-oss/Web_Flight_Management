import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle, Home, Copy, Download, Share2 } from "lucide-react";
import CountdownTimer from "../Timer/CountdownTimer";
import "./PaymentPage.css"; // File CSS ở bước 2
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";
import { useSocket } from "../../context/SocketContext";
const PaymentPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu vé từ trang trước
  const { disconnectSocket } = useSocket();
  const {
    flight,
    selectedSeats,
    passenger,
    totalPrice,
    paymentInfo,
    expiredTime,
  } = location.state || {};

  const handleGoHome = () => {
    disconnectSocket();
    navigate("/user");
  };
  const handleExpired = () => {
    // Hiện thông báo
    alert(
      t(
        "paymentPage.expiredMessage",
        "Thời gian giữ ghế đã hết! Vui lòng đặt lại."
      )
    );

    disconnectSocket();

    navigate("/user");
  };
  const BANK_ID = "970418";
  const ACCOUNT_NO = "8852915518";
  const ACCOUNT_NAME = "FLIGHT HK AIRLINES";

  // Nội dung chuyển khoản: VD: VEMAYBAY VN192 NGUYENVANA
  const content = `VEMAYBAY ${flight?.flightNumber} ${
    passenger?.name || "KHACH"
  }`;

  // Cấu trúc: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // Nếu không có dữ liệu (truy cập trực tiếp link), quay về trang chủ
  useEffect(() => {
    if (!flight) navigate("/");
  }, [flight, navigate]);

  const handleDownloadQR = async () => {
    try {
      // Fetch ảnh về dưới dạng Blob để tránh lỗi CORS hoặc mở tab mới
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      // Tạo đường dẫn ảo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Đặt tên file khi tải về
      link.download = `FlightHK_QR_${flight.flightNumber}.png`;

      // Kích hoạt click và dọn dẹp
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      alert(t("paymentPage.alerts.downloadError"));
    }
  };

  // --- 2. CHỨC NĂNG CHIA SẺ ---
  const handleShare = async () => {
    const shareData = {
      title: t("paymentPage.alerts.shareTitle"),
      // Dịch nội dung chia sẻ (có truyền biến)
      text: t("paymentPage.alerts.shareText", {
        flightNo: flight.flightNumber,
        price: totalPrice.toLocaleString(),
      }),
      url: qrUrl,
    };
    // Kiểm tra xem trình duyệt có hỗ trợ Share API không (Thường là Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log(t("paymentPage.alerts.shareCancel"));
      }
    } else {
      // Fallback cho PC: Copy link vào clipboard
      try {
        await navigator.clipboard.writeText(qrUrl);
        alert(t("paymentPage.alerts.copySuccess"));
      } catch (err) {
        alert(t("paymentPage.alerts.shareUnsupported"));
      }
    }
  };

  if (!flight) return null;

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {/* Chỉ hiện Timer nếu có expiredTime */}
        {expiredTime && (
          <CountdownTimer targetDate={expiredTime} onExpire={handleExpired} />
        )}
      </div>
      <div className="payment-layout">
        {/* Background Video */}
        <video className="payment-video-bg" autoPlay muted loop playsInline>
          <source src={videoWallpaper} type="video/webm" />
          <source
            src={videoWallpaper.replace("webm", "mp4")}
            type="video/mp4"
          />
        </video>
        <div className="payment-overlay"></div>

        <motion.div
          className="payment-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="glass-panel payment-box">
            <div className="payment-header">
              <div className="icon-check">
                <CheckCircle size={50} color="#4ade80" />
              </div>
              <h2>{t("paymentPage.title")}</h2>
              <p>{t("paymentPage.subtitle")}</p>
            </div>

            <div className="qr-section">
              <div className="qr-frame">
                <img src={qrUrl} alt="VietQR Code" className="qr-image" />
              </div>
              <div className="qr-actions">
                <button className="action-btn" onClick={handleDownloadQR}>
                  <Download size={16} />
                  {t("paymentPage.actions.download")}
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <Share2 size={16} /> {t("paymentPage.actions.share")}
                </button>
              </div>
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span>{t("paymentPage.details.bank")}</span>
                <strong>BIDV</strong>
              </div>
              <div className="detail-row">
                <span>{t("paymentPage.details.accountName")}</span>
                <strong>{ACCOUNT_NAME}</strong>
              </div>
              <div className="detail-row">
                <span>{t("paymentPage.details.accountNo")}</span>
                <div className="copy-row">
                  <strong>{ACCOUNT_NO}</strong>
                  <Copy size={14} className="cursor-pointer text-blue-400" />
                </div>
              </div>
              <div className="detail-row">
                <span>{t("paymentPage.details.content")}</span>
                <strong>{content}</strong>
              </div>
              <div className="divider"></div>
              <div className="detail-row total">
                <span>{t("paymentPage.details.amount")}</span>{" "}
                <span className="total-text">
                  {totalPrice?.toLocaleString()} VND
                </span>
              </div>
            </div>

            <button className="home-btn" onClick={() => navigate(-1)}>
              <Home size={20} /> {t("paymentPage.actions.booking-page")}
            </button>

            <p className="note-text">
              {t("paymentPage.note.start")} <b>{passenger?.email}</b>{" "}
              {t("paymentPage.note.end")}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentPage;
