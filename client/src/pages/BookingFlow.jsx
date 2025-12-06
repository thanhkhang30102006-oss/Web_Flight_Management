import React, { useState } from "react";
import FlightSearchForm from "../components/BookingFlight/FlightSearchForm";
import FlightResults from "../components/BookingFlight/FlightResults";
import BookingPage from "../components/BookingFlight/BookingPage";
import "./Booking.css"; // Import CSS chung

function Booking() {
  const [isSearched, setIsSearched] = useState(false);
  const [flights, setFlights] = useState([]);
  const handleSearch = (data) => {
    setFlights(data);
    setIsSearched(true);
  };

  return (
    <div className="booking-container">
      {/* Header tiêu đề */}
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ color: "white", margin: 0 }}>Đặt vé máy bay</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>
          Tìm kiếm chuyến bay giá tốt nhất cho hành trình của bạn
        </p>
      </div>

      {/* Form tìm kiếm */}
      <FlightSearchForm onSearch={handleSearch} />

      {/* Kết quả tìm kiếm (Truyền params xuống nếu muốn lọc thật) */}
      <FlightResults searchTriggered={isSearched} flights={flights} />
    </div>
  );
}

export default Booking;
