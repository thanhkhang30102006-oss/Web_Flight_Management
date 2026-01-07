import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // 1. Import hook
import {
  Search,
  Plane,
  QrCode,
  CheckCircle,
  Printer,
  UserCheck,
  CircleCheckBig,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CheckInCounter.css";
import { getAirportInfo } from "../../../utils/AirportData";
import toast from "react-hot-toast";

const CheckInCounter = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const navigate = useNavigate();

  // 1. Hàm tìm kiếm vé
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setTicketData(null);
    setIsCheckedIn(false);
    console.log(query);
    try {
      const response = await fetch(`api/staff/check-in/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketID: query,
        }),
      });

      if (!response.ok) {
        throw new Error(t("checkin.error_network"));
      }

      const data = await response.json();
      await new Promise((r) => setTimeout(r, 800));
      const isAlreadyCheckedIn = data.ticketState === "be-checked";
      const assignedGate = data.gate
        ? data.gate
        : String(Math.floor(Math.random() * 5) + 1);
      // Giả lập tìm thấy vé
      const mockTicket = {
        ticketID: data.ticketID,
        flightNumber: data.flightNumber,
        passengerName: data.contactName,
        seatNumber: data.seatNumber,
        class: data.seatType,
        departure: data.departurePoint,
        arrive: data.arrivePoint,
        date: data.departureDay,
        time: data.departureTime,
        gate: assignedGate,
        status: data.ticketState,
        checkinState: isAlreadyCheckedIn ? "yes" : "no",
      };

      setTicketData(mockTicket);
      setIsCheckedIn(isAlreadyCheckedIn);
      toast.success("Đã tìm thấy vé!");
    } catch (error) {
      toast.error(t("checkin.error_not_found"));
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm Xác nhận Check-in
  const handleConfirmCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`api/staff/check-in/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketID: ticketData.ticketID,
          gate: ticketData.gate,
        }),
      });

      await new Promise((r) => setTimeout(r, 500)); // Delay xử lý
      setIsCheckedIn(true);
      toast.success(t("checkin.btn_success"));
    } catch (error) {
      toast.error(t("checkin.error_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container fade-in">
      {/* Search Box */}
      <div className="checkin-search-box">
        <h2 style={{ margin: 0, fontSize: "28px" }}>{t("checkin.title")}</h2>{" "}
        <p style={{ color: "#e8ecf1ff", marginBottom: "20px" }}>
          {t("checkin.subtitle")}
        </p>
        <form onSubmit={handleSearch} className="input-group-lg">
          <input
            type="text"
            className="input-lg"
            placeholder={t("checkin.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-search-lg" disabled={loading}>
            {loading ? t("checkin.searching") : <Search size={24} />}
          </button>
        </form>
      </div>

      {/* Result: Boarding Pass */}
      {ticketData && (
        <div className="boarding-pass-wrapper">
          <div className="boarding-pass">
            {/* Dấu đóng dấu Check-in */}
            {isCheckedIn && (
              <div className="status-stamp">{t("checkin.stamp")}</div>
            )}

            {/* Phần Trái */}
            <div className="pass-main">
              <div className="airline-header">
                <span className="brand-name">FlightHK</span>
                <span className="pass-type">
                  {ticketData.class} {t("checkin.class_suffix")}
                </span>
              </div>

              <div className="flight-route-large">
                <div style={{ textAlign: "left" }}>
                  <div className="city-code">{ticketData.departure}</div>
                  <div className="city-name">
                    {getAirportInfo(ticketData.departure).name}
                  </div>
                </div>
                <Plane size={32} className="flight-icon-large" />
                <div style={{ textAlign: "right" }}>
                  <div className="city-code">{ticketData.arrive}</div>
                  <div className="city-name">
                    {getAirportInfo(ticketData.arrive).name}
                  </div>
                </div>
              </div>

              <div className="pass-details-grid">
                <div className="detail-item">
                  <label>{t("checkin.label_passenger")}</label>
                  <span>{ticketData.passengerName}</span>
                </div>
                <div className="detail-item">
                  <label>{t("checkin.label_flight")}</label>
                  <span>{ticketData.flightNumber}</span>
                </div>
                <div className="detail-item">
                  <label>{t("checkin.label_date")}</label>
                  <span>{ticketData.date}</span>
                </div>
                <div className="detail-item">
                  <label>{t("checkin.label_time")}</label>
                  <span>{ticketData.departureTime}</span>
                </div>
                <div className="detail-item">
                  <label>{t("checkin.label_gate")}</label>
                  <span>{ticketData.gate}</span>
                </div>
                <div className="detail-item">
                  <label>{t("checkin.label_ticket_id")}</label>
                  <span style={{ fontSize: "14px" }}>
                    {ticketData.ticketID}
                  </span>
                </div>
              </div>
            </div>

            {/* Phần Phải (Cuống vé) */}
            <div className="pass-stub">
              <label
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {t("checkin.label_seat")}
              </label>
              <div className="seat-large">{ticketData.seatNumber}</div>

              <div className="barcode-area">
                <QrCode size={80} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="checkin-actions" style={{ justifyContent: "center" }}>
            {!isCheckedIn ? (
              <button
                className="btn-confirm"
                onClick={handleConfirmCheckIn}
                disabled={loading}
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <UserCheck size={24} />
                    {t("checkin.btn_confirm")}
                  </>
                )}
              </button>
            ) : (
              <button
                className="btn-confirm"
                style={{ background: "#1aff00ff" }}
              >
                <CircleCheckBig size={24} />
                {t("checkin.btn_success")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInCounter;
