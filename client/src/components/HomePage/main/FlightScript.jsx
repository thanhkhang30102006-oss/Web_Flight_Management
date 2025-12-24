// src/components/HomePage/main/FlightScript.jsx
import React, { useState, useEffect, useRef } from "react";
import Header from "../header/header.jsx"; // Import chung
import Footer from "../footer/footer.jsx"; // Import chung
import videoWallpaper from "../../../assets/videos/background-wallpaper.webm";
import "./FlightPage.css";
import { useTranslation } from "react-i18next";
import { FlightList, FlightMap } from "./FlightIndex.jsx";
// Hardcode airport coords (mở rộng nếu cần)
const airportCoords = {
  // --- Miền Bắc (6 sân bay) ---
  HAN: { lat: 21.2187, lng: 105.8042, name: "Nội Bài (Hà Nội)" },
  HPH: { lat: 20.8193, lng: 106.7333, name: "Cát Bi (Hải Phòng)" },
  VDO: { lat: 21.1167, lng: 107.4167, name: "Vân Đồn (Quảng Ninh)" },
  THD: { lat: 19.9017, lng: 105.4678, name: "Thọ Xuân (Thanh Hóa)" },
  VII: { lat: 18.73, lng: 105.67, name: "Vinh (Nghệ An)" },
  DIN: { lat: 21.3972, lng: 103.0078, name: "Điện Biên Phủ (Điện Biên)" },

  // --- Miền Trung (7 sân bay) ---
  DAD: { lat: 16.0544, lng: 108.2022, name: "Đà Nẵng" },
  CXR: { lat: 12.0, lng: 109.2167, name: "Cam Ranh (Khánh Hòa)" },
  HUI: { lat: 16.4, lng: 107.7, name: "Phú Bài (Huế)" },
  UIH: { lat: 13.955, lng: 109.0422, name: "Phù Cát (Bình Định)" },
  VCL: { lat: 15.4061, lng: 108.7056, name: "Chu Lai (Quảng Nam)" },
  VDH: { lat: 17.515, lng: 106.5906, name: "Đồng Hới (Quảng Bình)" },
  TBB: { lat: 13.0494, lng: 109.3336, name: "Tuy Hòa (Phú Yên)" },

  // --- Tây Nguyên (3 sân bay) ---
  DLI: { lat: 11.7506, lng: 108.3736, name: "Liên Khương (Đà Lạt)" },
  BMV: { lat: 12.6681, lng: 108.12, name: "Buôn Ma Thuột (Đắk Lắk)" },
  PXU: { lat: 14.0044, lng: 108.0172, name: "Pleiku (Gia Lai)" },

  // --- Miền Nam (6 sân bay) ---
  SGN: { lat: 10.8231, lng: 106.6297, name: "Tân Sơn Nhất (TP.HCM)" },
  PQC: { lat: 10.2272, lng: 103.9675, name: "Phú Quốc (Kiên Giang)" },
  VCA: { lat: 10.0851, lng: 105.7117, name: "Cần Thơ" },
  VCS: { lat: 8.7325, lng: 106.6289, name: "Côn Đảo (Bà Rịa - Vũng Tàu)" },
  VKG: { lat: 9.9597, lng: 105.1339, name: "Rạch Giá (Kiên Giang)" },
  CAH: { lat: 9.1756, lng: 105.1794, name: "Cà Mau" },
};

const MOCK_FLIGHTS = [
  {
    flightNumber: "VN002",
    departurePoint: "HAN",
    arrivePoint: "SGN",
    departureDay: "2025-12-29",
    departureTime: "20:00:00",
    planeType: "Airbus A350",
    flightTotalSeat: 300,
    flightState: "active",
  },
  {
    flightNumber: "QH203",
    departurePoint: "DAD",
    arrivePoint: "SGN",
    departureDay: "2025-12-21",
    departureTime: "19:15:00",
    planeType: "Embraer 190",
    flightTotalSeat: 90,
    flightState: "delayed", // Thêm trạng thái delayed
  },
  {
    flightNumber: "VJ154",
    departurePoint: "SGN",
    arrivePoint: "HAN",
    departureDay: "2025-12-30",
    departureTime: "08:30:00",
    planeType: "Airbus A321",
    flightTotalSeat: 200,
    flightState: "boarding",
  },
  {
    flightNumber: "VN123",
    departurePoint: "HPH",
    arrivePoint: "PQC",
    departureDay: "2025-12-25",
    departureTime: "14:10:00",
    planeType: "Boeing 787",
    flightTotalSeat: 280,
    flightState: "active",
  },
];

// const getAirportCode = (point) => point.match(/\(([^)]+)\)/)?.[1] || "";

export default function FlightScript() {
  const { t } = useTranslation();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  // const [flightPaths, setFlightPaths] = useState([]);
  // const [map, setMap] = useState(null);
  // const mapRef = useRef(null);

  // Load Google Maps script động (giống file cũ)
  useEffect(() => {
    // Giả lập call API
    setTimeout(() => {
      // Map thêm tọa độ vào dữ liệu chuyến bay
      const enhancedData = MOCK_FLIGHTS.map((flight) => ({
        ...flight,
        coordinates: {
          departure: airportCoords[flight.departurePoint] || { lat: 0, lng: 0 },
          arrival: airportCoords[flight.arrivePoint] || { lat: 0, lng: 0 },
        },
      }));
      setFlights(enhancedData);
      setLoading(false);
    }, 800); // Delay nhẹ cho giống thật
  }, []);

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
  };

  return (
    <>
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
      </video>
      <div className="flight-video-overlay"></div>

      <Header />

      <main className="flight-page">
        <section className="hero">
          <div className="simple-info">
            <h1 className="simple-info-title">
              {t("flight.title", "Thông Tin Chuyến Bay")}
            </h1>
            <p className="simple-info-text">
              {t(
                "flight.desc",
                "Theo dõi các chuyến bay đang hoạt động và sắp khởi hành"
              )}
            </p>
          </div>
        </section>
        <div className="flight-content">
          <div className="flights-panel">
            <h2>{t("flight.list", "Danh Sách Chuyến Bay")}</h2>
            <FlightList
              flights={flights}
              onSelectFlight={handleSelectFlight}
              loading={loading}
              selectedId={selectedFlight?.flightNumber}
            />
          </div>

          <div className="map-panel">
            <h2>{t("flight.map", "Bản Đồ Đường Bay")}</h2>
            {selectedFlight ? (
              <div className="selected-flight-info">
                <p>
                  <strong>{t("flight.showing", "Đang hiển thị")}:</strong>{" "}
                  <span style={{ color: "#3399FF" }}>
                    {selectedFlight.flightNumber}
                  </span>{" "}
                </p>
                <p>
                  {selectedFlight.departurePoint} ➝ {selectedFlight.arrivePoint}
                </p>
              </div>
            ) : (
              <p className="map-instruction">
                {t(
                  "flight.instruction",
                  "Nhấp vào chuyến bay để xem đường bay trên bản đồ"
                )}
              </p>
            )}
            <FlightMap selectedFlight={selectedFlight} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
