import React, { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import { useTranslation } from "react-i18next";
import { isSameDay } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "./FlightSchedule.css";

const dbFlights = [
  {
    id: 1,
    date: new Date(2025, 11, 12),
    route: "HAN ➝ NRT",
    airline: "Vietnam Airlines",
    startTime: "08:30",
    endTime: "12:30",
    status: "confirmed",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Vietnam_Airlines_Logo.svg/1200px-Vietnam_Airlines_Logo.svg.png",
  },
  {
    id: 2,
    date: new Date(2025, 11, 12),
    route: "SGN ➝ DAD",
    airline: "Vietjet Air",
    startTime: "16:15",
    endTime: "20:45",
    status: "delayed",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Vietnam_Airlines_Logo.svg/1200px-Vietnam_Airlines_Logo.svg.png",
  },
];

const FlightSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 12));
  const [localFlights, setLocalFlights] = useState([]);
  const { t, i18n } = useTranslation();
  const calendarLocale = i18n.language === "vi" ? "vi-VN" : "en-US";
  // Hàm đổi giờ (HH:mm) thành phút (0 -> 1440)
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    const flightsOnDate = dbFlights.filter((f) =>
      isSameDay(f.date, selectedDate)
    );

    const formattedFlights = flightsOnDate.map((flight) => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      let duration = endMinutes - startMinutes;
      if (duration < 0) duration += 1440;

      return {
        ...flight,
        leftPos: (startMinutes / 1440) * 100,
        widthPos: (duration / 1440) * 100,
      };
    });
    setLocalFlights(formattedFlights);
  }, [selectedDate]);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasFlight = dbFlights.some((f) => isSameDay(f.date, date));
      if (hasFlight) return <div className="dot-marker"></div>;
    }
    return null;
  };

  return (
    <div className="schedule-layout">
      {/* CỘT TRÁI: CALENDAR */}
      <div className="glass-panel calendar-section">
        <h3 className="panel-title">{t("flight_schedule.title")}</h3>{" "}
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale={calendarLocale}
          tileContent={tileContent}
          className="custom-calendar"
        />
      </div>

      {/* CỘT PHẢI: TIMELINE */}
      <div className="glass-panel timeline-section">
        <div className="timeline-header">
          <h3>{t("flight_schedule.timeline_title")}</h3>
          <p className="hint">{t("flight_schedule.hint")}</p>
        </div>

        <div className="timeline-container">
          {/* Thước đo thời gian */}
          <div className="time-ruler">
            {[0, 4, 8, 12, 16, 20, 24].map((hour) => (
              <div
                key={hour}
                className="ruler-mark"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <span>{hour}h</span>
              </div>
            ))}
          </div>

          {/* Khu vực chứa Bar */}
          <div className="timeline-track-area">
            {localFlights.length > 0 ? (
              localFlights.map((flight, index) => (
                <div
                  key={index}
                  className={`flight-bar-item ${flight.status}`}
                  style={{
                    left: `${flight.leftPos}%`,
                    width: `${flight.widthPos}%`,
                    top: `${index * 60 + 100}px`, // Xếp chồng theo chiều dọc
                  }}
                >
                  <span className="bar-label">
                    {flight.startTime} - {flight.endTime}
                  </span>
                  {/* POPUP TOOLTIP (Ẩn mặc định, hiện khi Hover) */}
                  <div className="flight-tooltip">
                    <div className="tooltip-header">
                      <img src={flight.logo} alt="logo" />
                      <span className="airline-name">{flight.airline}</span>
                    </div>
                    <div className="tooltip-body">
                      <div className="tooltip-route">{flight.route}</div>
                      <div className="tooltip-time">
                        {flight.startTime} - {flight.endTime}
                      </div>
                      <div className={`tooltip-status ${flight.status}`}>
                        {t(`flight_schedule.status.${flight.status}`)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">{t("flight_schedule.empty")}</div>
            )}

            {/* Kẻ mờ chia giờ */}
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="grid-line"
                style={{ left: `${(i / 24) * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSchedule;
