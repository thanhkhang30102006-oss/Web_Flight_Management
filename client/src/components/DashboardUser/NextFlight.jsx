import React, { useState } from "react";

/**
    useEffect call vé của khách hàng lấy dữ liệu
 */

function NextFlightCard(flight) {
  if (!flight.isHasFlight) {
    return (
      <div className="advertisement">
        <div className="content">
          <h3>Bạn chưa có chuyến đi nào sắp tới? 🌴</h3>
          <p>
            Đặt vé ngay hôm nay để nhận ưu đãi <strong>20%</strong> cho chặng
            bay nội địa.
          </p>
          <button className="btn-primary">Đặt vé ngay</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="next-flight-card">
        <div className="card-content">
          <div className="flight-header">
            <span className="badge-status">{flight.status}</span>
            <span className="flight-date">{flight.date}</span>
          </div>
          <div className="route-info">
            <div className="point">
              <h1>{flight.depart}</h1>
              <p>{flight.depTime}</p>
            </div>
            <div className="plane-icon">
              <span>✈️</span>
              <div className="dashed-line"></div>
              <p>{flight.flightNo}</p>
            </div>
            <div className="point">
              <h1>{flight.arrive}</h1>
              <p>{flight.arrTime}</p>
            </div>
          </div>
          <div className="flight-footer">
            <div className="detail-item">
              <span className="label">Ghế</span>
              <span className="value">{flight.seat}</span>
            </div>
          </div>
          <button className="btn-checkin">Check-in Online</button>{" "}
          {/** Chuyển hướng xem kiểm tra chuyến bay */}
        </div>
      </div>
    </>
  );
}

function StatsComponents() {
  return (
    <>
      {/**Thời tiết */}
      <div className="stats-column">
        <div className="stat-card weather-card">
          <div className="weather-info">
            <span className="temp">28°C</span>
            <span className="city">TP.HCM</span>
          </div>
          <div className="weather-icon">🌤️</div>
        </div>
      </div>
    </>
  );
}
