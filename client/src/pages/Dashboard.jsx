import React, { useState, useEffect } from "react";
import { Header } from "../components/DashboardUser/header";
import LeftSide from "../components/DashboardUser/FunctionBar";
import { NextFlightCard } from "../components/DashboardUser/NextFlight";
import FlightSchedule from "../components/DashboardUser/FlightSchedule";
import "./DashboardLayout.css";
import videoWallpaper from "../assets//videos/background-wallpaper-user1.mp4";

const MOCK_USER_BOOKINGS = [
  {
    id: "BK-001",
    flightNumber: "VN-192",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDay: "12/12/2025",
    departureTime: "08:30",
    planeType: "Boeing 787-9 Dreamliner",
    seat: "12A",
    gate: "04",
    flightState: "ontime",
    status: "upcoming",
  },
  {
    id: "BK-002",
    flightNumber: "VJ-512",
    departurePoint: "HAN",
    arrivePoint: "DAD",
    departureDay: "05/10/2025",
    departureTime: "14:00",
    planeType: "Airbus A320",
    seat: "20D",
    gate: "11",
    flightState: "completed",
    status: "completed",
  },
];

function DashBoard() {
  const [nextFlight, setNextFlight] = useState(null);
  useEffect(() => {
    // Tìm chuyến bay có status là "upcoming" đầu tiên
    const upcoming = MOCK_USER_BOOKINGS.find(
      (flight) => flight.status === "upcoming"
    );
    setNextFlight(upcoming || null);
  }, []);
  return (
    <div className="dashboard-layout">
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
        {/* Có thể thêm source mp4 để backup nếu cần */}
        {/* <source src={videoWallpaperMp4} type="video/mp4" /> */}
      </video>

      {/* Lớp phủ mờ (Overlay) để video không làm rối mắt */}
      <div className="video-overlay"></div>
      {/* Sidebar cố định bên trái */}
      <LeftSide />

      {/* Nội dung chính bên phải */}
      <main className="main-content">
        <Header />

        {/* Container cho các widget bên trong để căn lề đẹp hơn */}
        <div className="content-container">
          <div className="widgets-row">
            <NextFlightCard flight={nextFlight} />
            {/* <StatsComponents /> có thể để ở đây nếu muốn chia cột */}
          </div>
          <FlightSchedule />
        </div>
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9999,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={() => setNextFlight(null)}
            style={{
              padding: "5px 10px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Test: Không vé
          </button>
          <button
            onClick={() => setNextFlight(MOCK_USER_BOOKINGS[0])}
            style={{
              padding: "5px 10px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Test: Có vé
          </button>
        </div>
      </main>
    </div>
  );
}

export default DashBoard;
