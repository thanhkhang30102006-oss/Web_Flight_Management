import React, { useState, useEffect } from "react";
import "./FlightPage.css";

const FlightPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [map, setMap] = useState(null);
  const [flightPaths, setFlightPaths] = useState([]);

  // Mock data cho demo (thay thế bằng API thực)
  const mockFlights = [
    {
      id: "VN101",
      airline: "Vietnam Airlines",
      from: "HAN",
      to: "SGN",
      fromCity: "Hà Nội",
      toCity: "TP.HCM",
      departure: "08:30",
      arrival: "10:45",
      status: "On Time",
      aircraft: "Boeing 787",
      gate: "A12",
      coordinates: {
        from: { lat: 21.2187, lng: 105.8042 },
        to: { lat: 10.8231, lng: 106.6297 },
      },
    },
    {
      id: "VJ205",
      airline: "VietJet Air",
      from: "SGN",
      to: "DAD",
      fromCity: "TP.HCM",
      toCity: "Đà Nẵng",
      departure: "14:20",
      arrival: "15:35",
      status: "Boarding",
      aircraft: "Airbus A321",
      gate: "B08",
      coordinates: {
        from: { lat: 10.8231, lng: 106.6297 },
        to: { lat: 16.0544, lng: 108.1022 },
      },
    },
    {
      id: "QH1420",
      airline: "Bamboo Airways",
      from: "HAN",
      to: "PQC",
      fromCity: "Hà Nội",
      toCity: "Phú Quốc",
      departure: "16:45",
      arrival: "18:30",
      status: "Delayed",
      aircraft: "Boeing 737",
      gate: "C15",
      coordinates: {
        from: { lat: 21.2187, lng: 105.8042 },
        to: { lat: 10.2272, lng: 103.9675 },
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFlights(mockFlights);
      setLoading(false);
    }, 1000);

    // Initialize Google Maps
    initializeMap();
  }, []);

  const initializeMap = () => {
    if (window.google) {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("flight-map"),
        {
          zoom: 6,
          center: { lat: 16.0, lng: 106.0 }, // Center of Vietnam
          mapTypeId: "terrain",
        }
      );
      setMap(mapInstance);
    }
  };

  const showFlightRoute = (flight) => {
    if (!map) return;

    // Clear existing paths
    flightPaths.forEach((path) => path.setMap(null));
    setFlightPaths([]);

    const flightPath = new window.google.maps.Polyline({
      path: [flight.coordinates.from, flight.coordinates.to],
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });

    flightPath.setMap(map);

    // Add markers
    const departureMarker = new window.google.maps.Marker({
      position: flight.coordinates.from,
      map: map,
      title: `${flight.fromCity} (${flight.from})`,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    });

    const arrivalMarker = new window.google.maps.Marker({
      position: flight.coordinates.to,
      map: map,
      title: `${flight.toCity} (${flight.to})`,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    // Add animated plane icon
    const planeIcon = {
      path: "M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145 l-71.345-23.599l-2.001,13.069l-2.057-13.529l-71.278,22.928l-5.762-23.984l64.097-59.271l-8.913-51.359l0.858-114.43 l-21.945-11.584l-189.358,88.759l-0.858,20.884l32.262,1.715l-6.176,38.043l-26.086,0.858l-5.762-23.127l-95.071-131.185 l131.185,95.071l23.127,5.762l-0.858,26.086l-38.043,6.176l-1.715-32.262l-20.884,0.858l-88.759,189.358l11.584,21.945 l114.43-0.858C361.426,430.724,362.205,430.724,362.985,430.724z",
      scale: 0.1,
      strokeColor: "blue",
      strokeWeight: 2,
      fillColor: "blue",
      fillOpacity: 0.8,
      rotation: 0,
    };

    const planeMarker = new window.google.maps.Marker({
      position: flight.coordinates.from,
      map: map,
      icon: planeIcon,
      title: `Flight ${flight.id}`,
    });

    setFlightPaths([flightPath, departureMarker, arrivalMarker, planeMarker]);
    setSelectedFlight(flight);

    // Fit bounds to show entire route
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(flight.coordinates.from);
    bounds.extend(flight.coordinates.to);
    map.fitBounds(bounds);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "On Time":
        return "#28a745";
      case "Boarding":
        return "#007bff";
      case "Delayed":
        return "#dc3545";
      case "Departed":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div className="flight-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin chuyến bay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-page">
      <div className="flight-header">
        <h1>Thông Tin Chuyến Bay</h1>
        <p>Theo dõi các chuyến bay đang hoạt động và sắp khởi hành</p>
      </div>

      <div className="flight-content">
        <div className="flights-panel">
          <div className="flights-header">
            <h2>Chuyến Bay Hôm Nay</h2>
            <div className="flight-stats">
              <span className="stat">
                <strong>{flights.length}</strong> chuyến bay
              </span>
            </div>
          </div>

          <div className="flights-list">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className={`flight-card ${
                  selectedFlight?.id === flight.id ? "selected" : ""
                }`}
                onClick={() => showFlightRoute(flight)}
              >
                <div className="flight-header-info">
                  <div className="flight-number">
                    <strong>{flight.id}</strong>
                    <span className="airline">{flight.airline}</span>
                  </div>
                  <div
                    className="flight-status"
                    style={{ color: getStatusColor(flight.status) }}
                  >
                    {flight.status}
                  </div>
                </div>

                <div className="flight-route">
                  <div className="route-info">
                    <div className="departure">
                      <div className="airport-code">{flight.from}</div>
                      <div className="city-name">{flight.fromCity}</div>
                      <div className="time">{flight.departure}</div>
                    </div>

                    <div className="route-line">
                      <div className="airplane-icon">✈️</div>
                      <div className="line"></div>
                    </div>

                    <div className="arrival">
                      <div className="airport-code">{flight.to}</div>
                      <div className="city-name">{flight.toCity}</div>
                      <div className="time">{flight.arrival}</div>
                    </div>
                  </div>
                </div>

                <div className="flight-details">
                  <span className="aircraft">{flight.aircraft}</span>
                  <span className="gate">Cổng {flight.gate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-panel">
          <div className="map-header">
            <h2>Bản Đồ Đường Bay</h2>
            {selectedFlight && (
              <p>
                Hiển thị: {selectedFlight.id} - {selectedFlight.fromCity} →{" "}
                {selectedFlight.toCity}
              </p>
            )}
          </div>
          <div id="flight-map" className="flight-map"></div>
        </div>
      </div>
    </div>
  );
};

export default FlightPage;
