import React, { useState } from "react";
import FlightSearchForm from "../components/BookingFlight/FlightSearchForm";
import FlightResults from "../components/BookingFlight/FlightResults";
import BookingPage from "../components/BookingFlight/BookingPage";
import { useTranslation } from "react-i18next";
import "./Booking.css"; // Import CSS chung

function Booking() {
  const { t } = useTranslation();
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
        <h2 style={{ color: "white", margin: 0 }}> {t("booking.pageTitle")}</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>
          {t("booking.pageSubtitle")}
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
