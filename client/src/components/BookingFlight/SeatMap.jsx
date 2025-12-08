import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SeatMap.css";
import { useLocation, useNavigate } from "react-router-dom";
const SeatMap = ({
  liveSelections = {},
  pendingSeats = [],
  mySocketID = null,
  seats = [],
  selectedSeats = [],
  occupiedSeats = [],
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

  const priceEconomy = flightSelected.finalPrice?.economy || 0;
  const priceBusiness = flightSelected.finalPrice?.business || 0;

  const [totalPrice, setTotalPrice] = useState(0);
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
          const isSold = occupiedSeats.includes(seatId);
          const isPending = pendingSeats.includes(seatId);
          const holderSocketId = liveSelections[seatId];
          const type = seatInfo?.seatType || defaultType;

          // 5. Xác định Trạng thái
          // - Kiểm tra xem ghế có bị occupied trong DB không
          const isOccupied =
            seatInfo?.seatState === "occupied" ||
            seatInfo?.seatState === "booked";

          // - Kiểm tra xem người dùng có đang chọn ghế này không (Client state)
          const isSelected = selectedSeats.some((s) => s.id === seatId);
          const isHeldByOther = holderSocketId && holderSocketId !== mySocketID;
          const isDisabled = isSold || isPending || isHeldByOther;
          // 2. Logic xác định class màu sắc
          let additionalClass = "";
          // Logic xác định trạng thái hiển thị (text)
          let statusText = "Trống"; // Mặc định
          let statusColorClass = "text-green";
          if (isOccupied) {
            statusText = "Đã bán";
            statusColorClass = "text-red";
          } else if (holderSocketId && holderSocketId === mySocketID) {
            statusText = "Đang chọn (Tôi)";
            statusColorClass = "text-green";
          } else if (holderSocketId) {
            statusText = "Đang được chọn (Khách khác)";
            statusColorClass = "text-orange";
          }
          const typeText = type === "business" ? "Thương gia" : "Phổ thông";
          const currentPrice =
            type === "business" ? priceBusiness : priceEconomy;

          // Nếu có người đang chọn (Realtime)
          if (isSold) additionalClass = "occupied";
          else if (isPending) additionalClass = "pending";
          else if (holderSocketId) {
            if (holderSocketId === mySocketID) {
              additionalClass = "selected personal"; // Vàng (Của mình)
            } else {
              additionalClass = "selected"; // Xanh (Của người khác)
            }
          }
          return (
            <button
              key={seatId}
              // Class kết hợp: seat-item + loại ghế + trạng thái
              className={`seat-item ${defaultType} ${additionalClass}`}
              // Khi click, truyền cả ID và Type để cha xử lý tính tiền
              onClick={() => onSeatClick(seatId, type)}
              disabled={isDisabled}
            >
              {/* --- PHẦN MỚI THÊM: TOOLTIP --- */}
              <div className="seat-tooltip">
                <div className="tooltip-header">
                  <span className="tooltip-seat-id">{seatId}</span>
                </div>

                <div className="tooltip-body">
                  <div className="tooltip-row">
                    <span className="label">Hạng:</span>
                    <span className="value">{typeText}</span>
                  </div>

                  <div className="tooltip-row">
                    <span className="label">Trạng thái:</span>
                    <span className={`value status ${statusColorClass}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="tooltip-row price-row">
                    <span className="label">Giá:</span>
                    <span className="value price">
                      {currentPrice.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default SeatMap;
