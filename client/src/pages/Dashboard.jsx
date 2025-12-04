import React from "react";
import { Header } from "../components/DashboardUser/Header";
import LeftSide from "../components/DashboardUser/FunctionBar";
import {
  NextFlightCard,
  StatsComponents,
} from "../components/DashboardUser/NextFlight";
import FlightSchedule from "../components/DashboardUser/FlightSchedule";
import "./DashboardLayout.css";
import videoWallpaper from "../assets//videos/background-wallpaper-user1.mp4";
function DashBoard() {
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
            <NextFlightCard />
            {/* <StatsComponents /> có thể để ở đây nếu muốn chia cột */}
          </div>
          <FlightSchedule />
        </div>
      </main>
    </div>
  );
}

export default DashBoard;
