import React, { useState, useEffect } from "react";
import { Header } from "../components/DashboardUser/header";
import LeftSide from "../components/DashboardUser/FunctionBar";
import { NextFlightCard } from "../components/DashboardUser/NextFlight";
import FlightSchedule from "../components/DashboardUser/FlightSchedule";
import "./DashboardLayout.css";
import videoWallpaper from "../assets//videos/background-wallpaper-user1.mp4";
import Booking from "./BookingFlow";

function DashBoard() {
  const [nextFlight, setNextFlight] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const userDataString = localStorage.getItem("userData");
  const passenger = JSON.parse(userDataString);
  const passengerID = passenger.id;
  const passengerName = passenger.name;
  console.log("Check ID:", passengerID);
  return (
    <div className="dashboard-layout">
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
      </video>

      {/* Lớp phủ mờ (Overlay) để video không làm rối mắt */}
      <div className="video-overlay"></div>
      {/* Sidebar cố định bên trái */}
      <LeftSide currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Nội dung chính bên phải */}
      <main className="main-content">
        <Header />
        {/* Container cho các widget bên trong để căn lề đẹp hơn */}
        <div className="content-container">
          {activeTab === "home" && (
            <div className="animate-fade-in">
              <div className="widgets-row">
                <NextFlightCard
                  passengerID={passengerID}
                  passengerName={passengerName}
                />
                {/* <StatsComponents /> có thể để ở đây nếu muốn chia cột */}
              </div>
              <FlightSchedule />
            </div>
          )}

          {activeTab === "booking" && (
            <div className="animate-fade-in">
              {" "}
              {/* Nội dung Booking Flow mới */}
              <div className="booking-container">
                <Booking />
              </div>
            </div>
          )}
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
