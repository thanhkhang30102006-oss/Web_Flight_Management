// src/components/HomePage/main/FlightIndex.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ start, end }) {
  const map = useMap();
  React.useEffect(() => {
    if (start && end && start.lat !== 0) {
      const bounds = L.latLngBounds([start, end]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
}

function FlightList({ flights, onSelectFlight, loading, selectedId }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t("flight.loading", "Đang tải thông tin chuyến bay...")}</p>
      </div>
    );
  }

  return (
    <div className="flights-list">
      {flights.map((flight) => (
        <div
          key={flight.flightNumber}
          className={`flight-card ${selectedId === flight.flightNumber ? "active-card" : ""}`}
          onClick={() => onSelectFlight(flight)}
        >
          <div className="flight-header-info">
            <div className="flight-number">
              <strong>{flight.flightNumber}</strong>
              <span className="plane-type">{flight.planeType}</span>
            </div>
            <div
              className="flight-status"
              style={{
                color: getFlightColor(flight.flightState),
                background: `${getFlightColor(flight.flightState)}20`,
                border: `1px solid ${getFlightColor(flight.flightState)}`,
              }}
            >
              {getStatusText(flight.flightState, t)}
            </div>
          </div>

          <div className="flight-route">
            <div className="departure">
              <div className="airport-name">{flight.departurePoint}</div>
              <div className="time-info">
                <span className="time">{flight.departureTime.slice(0, 5)}</span>{" "}
                <span className="date">{formatDate(flight.departureDay)}</span>
              </div>
            </div>

            <div className="route-line">
              <div className="airplane-icon">✈</div>
              <div className="line"></div>
            </div>

            <div className="arrival">
              <div className="airport-code">{flight.arrivePoint}</div>
              <div className="seat-info">{flight.flightTotalSeat} ghế</div>
            </div>
          </div>
        </div>
      ))}
      {flights.length === 0 && (
        <p>
          {t("flight.noFlights", "Không có chuyến bay nào đang hoạt động.")}
        </p>
      )}
    </div>
  );
}

function FlightMap({ selectedFlight }) {
  const defaultCenter = [16.0, 106.0];
  const defaultZoom = 5;

  // Nếu có chuyến bay được chọn, lấy tọa độ
  const start = selectedFlight?.coordinates.departure;
  const end = selectedFlight?.coordinates.arrival;
  const pathColor = selectedFlight
    ? getFlightColor(selectedFlight.flightState)
    : "#3388ff";

  const { t } = useTranslation();

  return (
    <div className="flight-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%", borderRadius: "15px" }}
      >
        {/* Layer bản đồ miễn phí OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedFlight && start.lat !== 0 && (
          <>
            <MapUpdater start={start} end={end} />

            {/* Đường bay */}
            <Polyline
              positions={[
                [start.lat, start.lng],
                [end.lat, end.lng],
              ]}
              color={pathColor}
              weight={4}
              dashArray={
                selectedFlight.flightState === "delayed" ? "10, 10" : null
              } // Nét đứt nếu delay
            />

            {/* Marker Điểm đi */}
            <Marker position={[start.lat, start.lng]}>
              <Popup>
                <b>{selectedFlight.departurePoint}</b>
                <br />
                Khởi hành: {selectedFlight.departureTime}
              </Popup>
            </Marker>

            {/* Marker Điểm đến */}
            <Marker position={[end.lat, end.lng]}>
              <Popup>
                <b>{selectedFlight.arrivePoint}</b>
                <br />
                Máy bay: {selectedFlight.planeType}
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}

// Helper functions (giống file mới)
function getFlightColor(state) {
  switch (state) {
    case "active":
      return "#4CAF50";
    case "boarding":
      return "#2196F3";
    default:
      return "#757575";
  }
}

function getStatusText(state, t) {
  switch (state) {
    case "active":
      return t("flight.active", "Hoạt động");
    case "boarding":
      return t("flight.boarding", "Đang lên máy bay");
    default:
      return t("flight.unknown", "Không xác định");
  }
}

function formatTime(time) {
  return time.slice(0, 5);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

function calculateFlightDuration(departure, arrival) {
  const R = 6371; // km
  const dLat = ((arrival.lat - departure.lat) * Math.PI) / 180;
  const dLon = ((arrival.lng - departure.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((departure.lat * Math.PI) / 180) *
      Math.cos((arrival.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const duration = Math.round((distance / 800) * 60); // mins, avg 800km/h
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
}

export { FlightList, FlightMap };
