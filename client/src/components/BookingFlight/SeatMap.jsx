import React from "react";
import "./SeatMap.css"; // File CSS ở bước 2

const SeatMap = ({ selectedSeats, onSeatClick, occupiedSeats = [] }) => {
  // Cấu hình: 6 ghế/hàng, 10 hàng
  const rows = 10;
  const colLabels = ["A", "B", "C", "", "D", "E", "F"]; // "" là lối đi

  return (
    <div className="seat-map-container">
      {/* Màn hình / Đầu máy bay */}
      <div className="cockpit-indicator">Đầu máy bay</div>

      <div className="seat-grid">
        {/* Hàng chữ cái A B C ... */}
        {colLabels.map((col, i) => (
          <div key={`head-${i}`} className="col-label">
            {col}
          </div>
        ))}

        {/* Render từng hàng ghế */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {colLabels.map((col, colIndex) => {
              // Xử lý lối đi
              if (col === "") {
                return (
                  <div key={`aisle-${rowIndex}`} className="aisle-number">
                    {rowIndex + 1}
                  </div>
                );
              }

              const seatId = `${rowIndex + 1}${col}`;
              const isOccupied = occupiedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              return (
                <button
                  key={seatId}
                  className={`seat-item ${isOccupied ? "occupied" : ""} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => !isOccupied && onSeatClick(seatId)}
                  disabled={isOccupied}
                >
                  {/* Icon ghế đơn giản hoặc để trống */}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Chú thích */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="box available"></span> Trống
        </div>
        <div className="legend-item">
          <span className="box occupied"></span> Đã bán
        </div>
        <div className="legend-item">
          <span className="box selected"></span> Đang chọn
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
