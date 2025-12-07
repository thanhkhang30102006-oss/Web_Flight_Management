import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./SeatMap.css";
import { useLocation, useNavigate } from "react-router-dom";
const SeatMap = ({
  liveSelections = {},
  mySocketID = null,
  seats = [],
  selectedSeats = [],
  onSeatClick,
  flightSelected = [],
}) => {
  const { t } = useTranslation();
  const colLabels = ["A", "B", "C", "", "D", "E", "F"];

  // Cấu hình số hàng
  const flightTotalSeat = flightSelected.flightTotalSeat;
  const businessSeats = (flightTotalSeat / 5) * 1;
  const economySeats = (flightTotalSeat / 5) * 4;

  const businessRows = businessSeats / 6;
  const economyRows = economySeats / 6;

  const seatDatabaseMap = useMemo(() => {
    return seats.reduce((acc, seat) => {
      acc[seat.seatNumber] = seat;
      return acc;
    }, {});
  }, [seats]);
  // Hàm render một hàng ghế
  const renderRow = (rowIndex, defaultType) => {
    return (
      <React.Fragment key={rowIndex}>
        {colLabels.map((col) => {
          // 1. Xử lý lối đi
          if (col === "") {
            return (
              <div key={`aisle-${rowIndex}`} className="aisle-number">
                {rowIndex + 1}
              </div>
            );
          }

          // 2. Xác định ID ghế (seatNumber)
          const seatId = `${rowIndex + 1}${col}`;
          // 3. Lấy thông tin ghế từ DB map
          const seatInfo = seatDatabaseMap[seatId];

          const type = seatInfo?.seatType || defaultType;

          // 5. Xác định Trạng thái
          // - Kiểm tra xem ghế có bị occupied trong DB không
          const isOccupied =
            seatInfo?.seatState === "occupied" ||
            seatInfo?.seatState === "booked";

          // - Kiểm tra xem người dùng có đang chọn ghế này không (Client state)
          const isSelected = selectedSeats.some((s) => s.id === seatId);

          const holderSocketId = liveSelections[seatId];

          // 2. Logic xác định class màu sắc
          let additionalClass = "";

          // if (isOccupied) {
          //   additionalClass = "occupied";
          // }
          // Nếu có người đang chọn (Realtime)
          if (holderSocketId) {
            if (holderSocketId === mySocketID) {
              additionalClass = "selected personal";
            } else {
              additionalClass = "selected";
            }
          }
          return (
            <button
              key={seatId}
              // Class kết hợp: seat-item + loại ghế + trạng thái
              className={`seat-item ${defaultType} ${additionalClass}`}
              // Khi click, truyền cả ID và Type để cha xử lý tính tiền
              onClick={() => !isOccupied && onSeatClick(seatId, type)}
              disabled={isOccupied}
              title={`${seatId} - ${type} - ${
                seatInfo?.seatState || "available"
              }`}
            >
              {/* Nếu là ghế thương gia, có thể thêm icon đặc biệt */}
            </button>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <div className="seat-map-container">
      {t("bookingPage.seatMap.cockpit", "Đầu máy bay")}
      <div className="seat-grid">
        {/* Header Cột A B C... */}
        {colLabels.map((col, i) => (
          <div key={`head-${i}`} className="col-label">
            {col}
          </div>
        ))}

        {/* --- KHU VỰC THƯƠNG GIA --- */}
        <div className="class-divider">
          {t("bookingPage.seatMap.businessClass", "Hạng Thương Gia")}
        </div>
        {Array.from({ length: businessRows }).map((_, i) =>
          renderRow(i, "business")
        )}

        {/* --- KHU VỰC PHỔ THÔNG --- */}
        <div className="class-divider" style={{ marginTop: 20 }}>
          {t("bookingPage.seatMap.economyClass", "Hạng Phổ Thông")}{" "}
        </div>
        {Array.from({ length: economyRows }).map((_, i) =>
          renderRow(i + businessRows, "economy")
        )}
      </div>

      {/* Chú thích */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="box available"></span>
          {t("bookingPage.seatMap.legend.economy", "Phổ thông")}
        </div>
        <div className="legend-item">
          <span className="box business"></span>
          {t("bookingPage.seatMap.legend.business", "Thương gia")}
        </div>
        <div className="legend-item">
          <span className="box occupied"></span>
          {t("bookingPage.seatMap.legend.occupied", "Đã bán")}
        </div>
        <div className="legend-item">
          <span className="box selected"></span>
          <span className="box selected business"></span>
          {t(
            "bookingPage.seatMap.legend.selected.another",
            "Đang chọn của khách hàng khác"
          )}
        </div>
        <div className="legend-item">
          <span className="box pending"></span>
          {t("bookingPage.seatMap.legend.pending", "Đang giữ")}
        </div>
        <div className="legend-item">
          <span className="box selected personal"></span>
          <span className="box selected business personal"></span>
          {t(
            "bookingPage.seatMap.legend.selected.personal",
            "Đang chọn của mình"
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
