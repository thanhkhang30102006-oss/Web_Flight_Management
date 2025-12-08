import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

const CountdownTimer = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState("--:--");
  // Dùng ref để đảm bảo onExpire chỉ được gọi 1 lần
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    // Nếu không có targetDate thì không chạy
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      // 1. Xử lý khi hết giờ
      if (distance <= 0) {
        setTimeLeft("00:00");

        // Chỉ gọi onExpire nếu chưa từng gọi trước đó
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          if (onExpire) onExpire();
        }
        return false; // Dừng timer
      }

      // 2. Tính toán hiển thị
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const m = minutes < 10 ? "0" + minutes : minutes;
      const s = seconds < 10 ? "0" + seconds : seconds;

      setTimeLeft(`${m}:${s}`);
      return true;
    };

    // Chạy ngay lần đầu để hiển thị luôn
    const shouldRun = calculateTimeLeft();

    let timerId;
    if (shouldRun) {
      timerId = setInterval(() => {
        const keepRunning = calculateTimeLeft();
        if (!keepRunning) clearInterval(timerId);
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [targetDate]); // Bỏ onExpire ra khỏi dependency để tránh re-render loop

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "#fff7ed",
        border: "1px solid #f97316",
        borderRadius: "8px",
        padding: "6px 12px",
        color: "#ea580c",
        fontWeight: "bold",
        fontSize: "16px",
        boxShadow: "0 2px 4px rgba(249, 115, 22, 0.1)",
      }}
    >
      <Clock size={18} />
      <span>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
