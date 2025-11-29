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
  HAN: { lat: 21.2187, lng: 105.8042 }, // Hà Nội
  SGN: { lat: 10.8231, lng: 106.6297 }, // TP.HCM
  DAD: { lat: 16.0544, lng: 108.1022 }, // Đà Nẵng
  PQC: { lat: 10.2272, lng: 103.9675 }, // Phú Quốc
  CXR: { lat: 12.2273, lng: 109.1968 }, // Nha Trang
  VCA: { lat: 10.0851, lng: 105.7117 }, // Cần Thơ
  // Thêm sân bay khác nếu cần
};

const getAirportCode = (point) => point.match(/\(([^)]+)\)/)?.[1] || "";

export default function FlightScript() {
  const { t } = useTranslation();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  // Load Google Maps script động (giống file cũ)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=geometry`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 16.0, lng: 106.0 }, // Trung tâm VN
        mapTypeId: "hybrid",
      });
      setMap(mapInstance);
    };

    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch("/api/flights");
      const data = await response.json();

      // Thêm coordinates
      const enhancedData = data.map((flight) => ({
        ...flight,
        coordinates: {
          departure: airportCoords[getAirportCode(flight.departurePoint)] || {
            lat: 0,
            lng: 0,
          },
          arrival: airportCoords[getAirportCode(flight.arrivePoint)] || {
            lat: 0,
            lng: 0,
          },
        },
      }));

      const today = new Date(2025, 10, 29);
      const filtered = enhancedData.filter(
        (f) =>
          ["active", "boarding"].includes(f.flightState) &&
          new Date(f.departureDay) >= today
      );

      setFlights(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching flights:", error);
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
  };

  return (
    <>
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
      </video>
      <div className="video-overlay"></div>

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
            />
          </div>

          <div className="map-panel">
            <h2>{t("flight.map", "Bản Đồ Đường Bay")}</h2>
            {selectedFlight ? (
              <div className="selected-flight-info">
                <p>
                  <strong>{t("flight.showing", "Đang hiển thị")}:</strong>{" "}
                  {selectedFlight.flightNumber}
                </p>
                <p>
                  {selectedFlight.departurePoint} → {selectedFlight.arrivePoint}
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
            <FlightMap
              mapRef={mapRef}
              selectedFlight={selectedFlight}
              flightPaths={flightPaths}
              setFlightPaths={setFlightPaths}
              map={map}
            />

            {selectedFlight && (
              <div className="map-legend">
                <h3>{t("flight.legend", "Chú thích")}:</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-icon departure">D</span>
                    <span>{t("flight.departure", "Điểm khởi hành")}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon arrival">A</span>
                    <span>{t("flight.arrival", "Điểm đến")}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon plane">✈️</span>
                    <span>{t("flight.plane", "Máy bay")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
