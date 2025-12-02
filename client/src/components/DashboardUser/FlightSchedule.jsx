import React, { useState } from "react";
import { Calendar } from "react-calendar";
import { format, isSameDay } from "date-fns";
import "react-calendar/dist/Calendar.css";

const myFlights = [
  {
    id: 1,
    date: new Date(2025, 11, 12), // Lưu ý: Tháng 12 trong JS là 11 (0-index)
    route: "Hà Nội (HAN) ➝ Tokyo (NRT)",
    airline: "Vietnam Airlines",
    time: "08:30 - 15:30",
    status: "confirmed", // confirmed, delayed, cancelled
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Vietnam_Airlines_Logo.svg/1200px-Vietnam_Airlines_Logo.svg.png",
  },
  {
    id: 2,
    date: new Date(2025, 11, 15),
    route: "Tokyo (NRT) ➝ Hà Nội (HAN)",
    airline: "JAL Japan Airlines",
    time: "10:00 - 14:00",
    status: "delayed",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Japan_Airlines_Logo_%282011%29.svg/1200px-Japan_Airlines_Logo_%282011%29.svg.png",
  },
];
{
  /**Dữ liệu giả để edit lịch bay*/
}

const FlightSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 12));

  const flightsOnDate = myFlights.filter((flight) =>
    isSameDay(flight.date, selectedDate)
  );

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasFlight = myFlights.some((flight) =>
        isSameDay(flight.date, date)
      );
      if (hasFlight) return <div className="dot-marker"></div>;
    }
    return null;
  };

  return (
    <div className="schedule-container">
      {/* CỘT TRÁI: LỊCH */}
      <div className="calendar-wrapper">
        <h3 className="schedule-title">Lịch trình bay</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="vi-VN" // Chuyển sang tiếng Việt
          tileContent={tileContent} // Thêm chấm đỏ
          className="custom-calendar"
        />
      </div>

      {/* CỘT PHẢI: CHI TIẾT */}
      <div className="event-list-wrapper">
        <h3 className="date-header">
          {format(selectedDate, "EEEE, 'ngày' d 'tháng' M", { locale: vi })}
        </h3>

        <div className="flight-list">
          {flightsOnDate.length > 0 ? (
            flightsOnDate.map((flight) => (
              <div key={flight.id} className={`flight-item ${flight.status}`}>
                <div className="airline-logo">
                  <img src={flight.logo} alt="airline" />
                </div>
                <div className="flight-info">
                  <h4>{flight.route}</h4>
                  <p className="time">{flight.time}</p>
                  <span className="airline-name">{flight.airline}</span>
                </div>
                <div className="flight-status">
                  {flight.status === "confirmed" && (
                    <span className="tag green">Đúng giờ</span>
                  )}
                  {flight.status === "delayed" && (
                    <span className="tag yellow">Hoãn</span>
                  )}
                  {flight.status === "cancelled" && (
                    <span className="tag red">Hủy</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>😴 Không có chuyến bay nào hôm nay.</p>
              <button className="btn-small">Đặt vé ngay</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
