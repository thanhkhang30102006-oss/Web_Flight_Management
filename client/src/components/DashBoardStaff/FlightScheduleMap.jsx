import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Map as MapIcon,
  BarChart2,
} from "lucide-react";
import { FlightList, FlightMap } from "../HomePage/main/FlightIndex";
import "./FlightScheduleMap.css";

// 1. Dữ liệu tọa độ (Copy từ FlightScript để map hoạt động)
const airportCoords = {
  HAN: { lat: 21.2187, lng: 105.8042, name: "Nội Bài (Hà Nội)" },
  HPH: { lat: 20.8193, lng: 106.7333, name: "Cát Bi (Hải Phòng)" },
  VDO: { lat: 21.1167, lng: 107.4167, name: "Vân Đồn (Quảng Ninh)" },
  THD: { lat: 19.9017, lng: 105.4678, name: "Thọ Xuân (Thanh Hóa)" },
  VII: { lat: 18.73, lng: 105.67, name: "Vinh (Nghệ An)" },
  DIN: { lat: 21.3972, lng: 103.0078, name: "Điện Biên Phủ (Điện Biên)" },
  DAD: { lat: 16.0544, lng: 108.2022, name: "Đà Nẵng" },
  CXR: { lat: 12.0, lng: 109.2167, name: "Cam Ranh (Khánh Hòa)" },
  HUI: { lat: 16.4, lng: 107.7, name: "Phú Bài (Huế)" },
  UIH: { lat: 13.955, lng: 109.0422, name: "Phù Cát (Bình Định)" },
  VCL: { lat: 15.4061, lng: 108.7056, name: "Chu Lai (Quảng Nam)" },
  VDH: { lat: 17.515, lng: 106.5906, name: "Đồng Hới (Quảng Bình)" },
  TBB: { lat: 13.0494, lng: 109.3336, name: "Tuy Hòa (Phú Yên)" },
  DLI: { lat: 11.7506, lng: 108.3736, name: "Liên Khương (Đà Lạt)" },
  BMV: { lat: 12.6681, lng: 108.12, name: "Buôn Ma Thuột (Đắk Lắk)" },
  PXU: { lat: 14.0044, lng: 108.0172, name: "Pleiku (Gia Lai)" },
  SGN: { lat: 10.8231, lng: 106.6297, name: "Tân Sơn Nhất (TP.HCM)" },
  PQC: { lat: 10.2272, lng: 103.9675, name: "Phú Quốc (Kiên Giang)" },
  VCA: { lat: 10.0851, lng: 105.7117, name: "Cần Thơ" },
  VCS: { lat: 8.7325, lng: 106.6289, name: "Côn Đảo (Bà Rịa - Vũng Tàu)" },
  VKG: { lat: 9.9597, lng: 105.1339, name: "Rạch Giá (Kiên Giang)" },
  CAH: { lat: 9.1756, lng: 105.1794, name: "Cà Mau" },
};

const calculateArrivalTime = (depTime) => {
  if (!depTime) return "00:00";
  const [hours, minutes] = depTime.split(":").map(Number);
  let arrHours = hours + 2;
  let arrMinutes = minutes + 15;
  if (arrMinutes >= 60) {
    arrHours += 1;
    arrMinutes -= 60;
  }
  if (arrHours >= 24) arrHours -= 24;
  return `${arrHours.toString().padStart(2, "0")}:${arrMinutes.toString().padStart(2, "0")}`;
};

const FlightScheduleMap = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 1. Fetch dữ liệu (Giống FlightManagement)
  useEffect(() => {
    const getFlights = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:3001/api/staff/flightmanagement/showflight"
        );
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        // Map thêm tọa độ và giờ đến (nếu thiếu) để dùng cho Map và Timeline
        const enhancedData = (Array.isArray(data) ? data : []).map(
          (flight) => ({
            ...flight,
            arriveTime:
              flight.arriveTime || calculateArrivalTime(flight.departureTime),
            coordinates: {
              departure: airportCoords[flight.departurePoint] || {
                lat: 0,
                lng: 0,
              },
              arrival: airportCoords[flight.arrivePoint] || { lat: 0, lng: 0 },
            },
          })
        );

        setFlights(enhancedData);
      } catch (err) {
        console.error(err);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    getFlights();
  }, []);

  // 2. Lọc danh sách bên trái (Theo từ khóa)
  const filteredListFlights = useMemo(() => {
    return flights.filter(
      (f) =>
        f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.departurePoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.arrivePoint.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flights, searchTerm]);

  // 3. Lọc danh sách Timeline (Theo ngày chọn)
  const timelineFlights = useMemo(() => {
    return flights.filter((f) => {
      // So sánh chuỗi ngày (giả sử departureDay là "2025-12-29T...")
      const flightDate = f.departureDay ? f.departureDay.split("T")[0] : "";
      return flightDate === selectedDate;
    });
  }, [flights, selectedDate]);

  // Helper tính vị trí bar trên timeline (0 - 100%)
  const calculateBarPosition = (startTime, endTime) => {
    const timeToMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const startMin = timeToMin(startTime);
    let endMin = timeToMin(endTime);
    if (endMin < startMin) endMin += 1440; // Qua ngày hôm sau

    const left = (startMin / 1440) * 100 - 1;
    const width = ((endMin - startMin) / 1440) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="glass-panel schedule-map-container fade-in">
      {/* HEADER QUẢN LÝ */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Điều Phối & Lịch Trình Bay </h2>
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#dfe6f0ff" }}
          >
            Theo dõi vị trí và tiến độ thời gian thực
          </p>
        </div>
      </div>

      {/* PHẦN 1: SPLIT VIEW (LIST + MAP) */}
      <div className="split-view-container">
        {/* CỘT TRÁI: DANH SÁCH */}
        <div className="left-panel-list">
          <div className="list-header">
            <div className="search-box-large" style={{ width: "100%" }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm chuyến bay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="list-content custom-scrollbar">
            <FlightList
              flights={filteredListFlights}
              loading={loading}
              onSelectFlight={setSelectedFlight}
              selectedId={selectedFlight?.flightNumber}
            />
          </div>
        </div>

        {/* CỘT PHẢI: BẢN ĐỒ */}
        <div className="right-panel-map">
          <FlightMap selectedFlight={selectedFlight} />
          {/* Chú thích map overlay */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.9)",
              padding: "5px 10px",
              borderRadius: 8,
              color: "#333",
              fontSize: 12,
              zIndex: 999,
            }}
          >
            <MapIcon size={14} style={{ display: "inline", marginRight: 5 }} />
            Bản đồ trực tuyến
          </div>
        </div>
      </div>

      {/* PHẦN 2: TIMELINE / GANTT CHART */}
      <div className="bottom-panel-timeline">
        <div className="timeline-controls">
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: 0,
            }}
          >
            <BarChart2 size={20} color="#3b82f6" /> Lịch trình bay trong ngày
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarIcon size={16} />
            <input
              type="date"
              className="date-picker-custom"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="gantt-chart-wrapper custom-scrollbar">
          {/* Thước đo giờ */}
          <div className="time-ruler-horizontal">
            {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((h) => (
              <div
                key={h}
                className="time-mark"
                style={{ left: `${(h / 24) * 0}%` }}
              >
                {h}h
              </div>
            ))}
          </div>

          <div className="flight-rows-container">
            {/* Kẻ dọc mờ */}
            <div className="vertical-grid-lines">
              {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((h) => (
                <div
                  key={h}
                  className="v-line"
                  style={{ left: `${(h / 24) * 0}%` }}
                ></div>
              ))}
            </div>

            {/* Các thanh chuyến bay */}
            {timelineFlights.length > 0 ? (
              timelineFlights.map((flight) => {
                const style = calculateBarPosition(
                  flight.departureTime,
                  flight.arriveTime
                );
                const startHour = parseInt(
                  flight.departureTime.split(":")[0],
                  10
                );
                // Nếu >= 12h thì tooltip bên trái, ngược lại bên phải
                const tooltipPos = startHour >= 12 ? "left" : "right";
                return (
                  <div key={flight.flightNumber} className="gantt-flight-bar">
                    <div
                      className={`flight-progress-bar ${flight.flightState}`}
                      style={{
                        left: style.left,
                        width: style.width,
                      }}
                      onClick={() => setSelectedFlight(flight)}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                        {flight.flightNumber}
                      </span>
                      <div className={`bar-custom-tooltip ${tooltipPos}`}>
                        {flight.departureTime} - {flight.arriveTime}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                Không có chuyến bay nào trong ngày {selectedDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightScheduleMap;
