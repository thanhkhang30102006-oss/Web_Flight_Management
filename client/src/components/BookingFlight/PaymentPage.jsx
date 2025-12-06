import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, Copy, Download, Share2 } from "lucide-react";
import "./PaymentPage.css"; // File CSS ở bước 2
import videoWallpaper from "../../assets/videos/background-wallpaper-bookingpage.mp4";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu vé từ trang trước
  const { flight, selectedSeats, passenger, totalPrice } = location.state || {};

  // Cấu hình tài khoản nhận tiền (Dùng tài khoản của bạn hoặc demo)
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
      alert("Không thể tải ảnh, vui lòng thử lại hoặc chụp màn hình.");
    }
  };

  // --- 2. CHỨC NĂNG CHIA SẺ ---
  const handleShare = async () => {
    const shareData = {
      title: "Thanh toán vé máy bay FlightHK",
      text: `Thanh toán vé chuyến bay ${
        flight.flightNumber
      }. Tổng tiền: ${totalPrice.toLocaleString()} VND.`,
      url: qrUrl,
    };

    // Kiểm tra xem trình duyệt có hỗ trợ Share API không (Thường là Mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Đã hủy chia sẻ");
      }
    } else {
      // Fallback cho PC: Copy link vào clipboard
      try {
        await navigator.clipboard.writeText(qrUrl);
        alert("Đã sao chép link QR vào bộ nhớ tạm!");
      } catch (err) {
        alert("Trình duyệt không hỗ trợ chia sẻ.");
      }
    }
  };

  if (!flight) return null;

  return (
    <div className="payment-layout">
      {/* Background Video */}
      <video className="payment-video-bg" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        <source src={videoWallpaper.replace("webm", "mp4")} type="video/mp4" />
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
            <h2>Xác nhận thanh toán</h2>
            <p>Vui lòng quét mã QR bên dưới để hoàn tất đặt vé</p>
          </div>

          <div className="qr-section">
            <div className="qr-frame">
              <img src={qrUrl} alt="VietQR Code" className="qr-image" />
            </div>
            <div className="qr-actions">
              <button className="action-btn" onClick={handleDownloadQR}>
                <Download size={16} /> Lưu ảnh
              </button>
              <button className="action-btn" onClick={handleShare}>
                <Share2 size={16} /> Chia sẻ
              </button>
            </div>
          </div>

          <div className="payment-details">
            <div className="detail-row">
              <span>Ngân hàng:</span>
              <strong>BIDV</strong>
            </div>
            <div className="detail-row">
              <span>Chủ tài khoản:</span>
              <strong>{ACCOUNT_NAME}</strong>
            </div>
            <div className="detail-row">
              <span>Số tài khoản:</span>
              <div className="copy-row">
                <strong>{ACCOUNT_NO}</strong>
                <Copy size={14} className="cursor-pointer text-blue-400" />
              </div>
            </div>
            <div className="detail-row">
              <span>Nội dung:</span>
              <strong>{content}</strong>
            </div>
            <div className="divider"></div>
            <div className="detail-row total">
              <span>Số tiền:</span>
              <span className="total-text">
                {totalPrice?.toLocaleString()} VND
              </span>
            </div>
          </div>

          <button className="home-btn" onClick={() => navigate("/user")}>
            <Home size={20} /> Quay về Trang chủ
          </button>

          <p className="note-text">
            *Vé điện tử sẽ được gửi về email <b>{passenger?.email}</b> sau khi
            thanh toán thành công.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
