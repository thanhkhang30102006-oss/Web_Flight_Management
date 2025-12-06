import React, { useState } from "react";
import FlightSearchForm from "../components/BookingFlight/FlightSearchForm"; // Đổi đường dẫn cho đúng file của bạn
import FlightResults from "../components/BookingFlight/FlightResults";
import "./Booking.css"; // Import CSS chung

function Booking() {
  const [isSearched, setIsSearched] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = (params) => {
    console.log("Searching with:", params);
    setSearchParams(params);
    setIsSearched(true); // Kích hoạt hiển thị kết quả
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
      <FlightResults searchTriggered={isSearched} params={searchParams} />
    </div>
  );
}

export default Booking;
