import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

const CountdownTimer = ({ targetDate, totalDuration = 600, onExpire }) => {
  // totalDuration: Tổng thời gian giữ ghế (giây), ví dụ 10 phút = 600s
  // Để tính phần trăm thanh tiến trình
  const [timeLeft, setTimeLeft] = useState("--:--");
  const [percentage, setPercentage] = useState(100);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!targetDate) return;

    const timerId = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      // 1. Xử lý hết giờ
      if (distance <= 0) {
        setTimeLeft("00:00");
        setPercentage(0);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          if (onExpire) onExpire();
        }
        clearInterval(timerId);
        return;
      }

      // 2. Tính toán hiển thị số
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);
      setTimeLeft(
        `${minutes < 10 ? "0" + minutes : minutes}:${
          seconds < 10 ? "0" + seconds : seconds
        }`
      );

      const secondsLeft = distance / 1000;
      const percent = (secondsLeft / totalDuration) * 100;
      setPercentage(Math.max(0, percent));
    }, 1000);

    return () => clearInterval(timerId);
  }, [targetDate, totalDuration]);

  return (
    <div style={{ width: "100%", padding: "5px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "3px",
          color: "#d9534f",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Clock size={16} /> Thời gian giữ ghế còn lại:
        </span>
        <span>{timeLeft}</span>
      </div>

      <div
        style={{
          width: "100%",
          height: "6px",
          background: "#e0e0e0",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: percentage < 20 ? "#dc3545" : "#28a745",
            transition: "width 1s linear, background 0.5s ease",
          }}
        />
      </div>
    </div>
  );
};

export default CountdownTimer;
