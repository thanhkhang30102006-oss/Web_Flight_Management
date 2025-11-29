// src/components/HomePage/main/FlightIndex.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

function FlightList({ flights, onSelectFlight, loading }) {
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
          className="flight-card"
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
              }}
            >
              {getStatusText(flight.flightState, t)}
            </div>
          </div>

          <div className="flight-route">
            <div className="departure">
              <div className="airport-name">{flight.departurePoint}</div>
              <div className="time-info">
                <span className="time">{formatTime(flight.departureTime)}</span>
                <span className="date">{formatDate(flight.departureDay)}</span>
              </div>
            </div>

            <div className="route-line">
              <div className="airplane-icon">✈️</div>
              <div className="line"></div>
              <div className="duration">
                {calculateFlightDuration(
                  flight.coordinates.departure,
                  flight.coordinates.arrival
                )}
              </div>
            </div>

            <div className="arrival">
              <div className="airport-name">{flight.arrivePoint}</div>
              <div className="seat-info">
                <span className="seats">
                  💺 {flight.flightTotalSeat} {t("flight.seats", "ghế")}
                </span>
              </div>
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

function FlightMap({
  mapRef,
  selectedFlight,
  flightPaths,
  setFlightPaths,
  map,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedFlight && map) {
      // Xóa paths cũ
      flightPaths.forEach((path) => path.setMap?.(null));
      setFlightPaths([]);

      const newPaths = [];

      // Polyline route
      const flightPath = new window.google.maps.Polyline({
        path: [
          selectedFlight.coordinates.departure,
          selectedFlight.coordinates.arrival,
        ],
        geodesic: true,
        strokeColor: getFlightColor(selectedFlight.flightState),
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [
          {
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              strokeColor: getFlightColor(selectedFlight.flightState),
            },
            offset: "50%",
          },
        ],
      });
      flightPath.setMap(map);
      newPaths.push(flightPath);

      // Markers và InfoWindows (giống file mới)
      const departureMarker = new window.google.maps.Marker({
        position: selectedFlight.coordinates.departure,
        map,
        title: `${t("flight.departure", "Khởi hành")}: ${
          selectedFlight.departurePoint
        }`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(
              '<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="15" fill="#4CAF50" stroke="white" stroke-width="3"/><text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">D</text></svg>'
            ),
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      const arrivalMarker = new window.google.maps.Marker({
        position: selectedFlight.coordinates.arrival,
        map,
        title: `${t("flight.arrival", "Đến")}: ${selectedFlight.arrivePoint}`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(
              '<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="15" fill="#F44336" stroke="white" stroke-width="3"/><text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">A</text></svg>'
            ),
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      const planeMarker = new window.google.maps.Marker({
        position: selectedFlight.coordinates.departure, // Giả sử vị trí hiện tại
        map,
        title: `${t("flight.flight", "Chuyến bay")} ${
          selectedFlight.flightNumber
        }`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(
              `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg"><path d="M15,3 L18,12 L27,12 L24,15 L27,18 L18,18 L15,27 L12,18 L3,18 L6,15 L3,12 L12,12 Z" fill="${getFlightColor(
                selectedFlight.flightState
              )}" stroke="white" stroke-width="1"/></svg>`
            ),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      newPaths.push(departureMarker, arrivalMarker, planeMarker);

      // Info windows
      const departureInfo = new window.google.maps.InfoWindow({
        content: `<div style="padding:10px;"><h3>${t(
          "flight.departure",
          "Điểm khởi hành"
        )}</h3><p><strong>${selectedFlight.departurePoint}</strong></p><p>${t(
          "flight.time",
          "Thời gian"
        )}: ${formatTime(selectedFlight.departureTime)}</p><p>${t(
          "flight.date",
          "Ngày"
        )}: ${formatDate(selectedFlight.departureDay)}</p></div>`,
      });

      const arrivalInfo = new window.google.maps.InfoWindow({
        content: `<div style="padding:10px;"><h3>${t(
          "flight.arrival",
          "Điểm đến"
        )}</h3><p><strong>${selectedFlight.arrivePoint}</strong></p><p>${t(
          "flight.plane",
          "Máy bay"
        )}: ${selectedFlight.planeType}</p><p>${t("flight.seats", "Số ghế")}: ${
          selectedFlight.flightTotalSeat
        }</p></div>`,
      });

      departureMarker.addListener("click", () => {
        arrivalInfo.close();
        departureInfo.open(map, departureMarker);
      });
      arrivalMarker.addListener("click", () => {
        departureInfo.close();
        arrivalInfo.open(map, arrivalMarker);
      });

      setFlightPaths(newPaths);

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(selectedFlight.coordinates.departure);
      bounds.extend(selectedFlight.coordinates.arrival);
      map.fitBounds(bounds);
      setTimeout(() => {
        if (map.getZoom() > 8) map.setZoom(8);
      }, 100);
    }
  }, [selectedFlight, map]);

  return <div id="flight-map" ref={mapRef} className="flight-map"></div>;
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
