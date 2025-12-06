import React from "react";
import "./SeatMap.css";

const SeatMap = ({ selectedSeats, onSeatClick, occupiedSeats = [] }) => {
  const colLabels = ["A", "B", "C", "", "D", "E", "F"];

  // Cấu hình số hàng
  const businessRows = 2; // 2 hàng đầu là thương gia
  const economyRows = 8; // 8 hàng sau là phổ thông
  const totalRows = businessRows + economyRows;

  // Hàm render một hàng ghế
  const renderRow = (rowIndex, type) => {
    return (
      <React.Fragment key={rowIndex}>
        {colLabels.map((col) => {
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

          // Kiểm tra xem ghế này có trong danh sách đang chọn không
          // Lưu ý: selectedSeats bây giờ là mảng object [{id: '1A', ...}] nên phải dùng .some
          const isSelected = selectedSeats.some((s) => s.id === seatId);

          return (
            <button
              key={seatId}
              className={`seat-item ${type} ${isOccupied ? "occupied" : ""} ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => !isOccupied && onSeatClick(seatId, type)} // Truyền thêm type (business/economy)
              disabled={isOccupied}
            >
              {/* Có thể thêm icon vương miện cho ghế thương gia nếu muốn */}
            </button>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <div className="seat-map-container">
      <div className="cockpit-indicator">Đầu máy bay</div>

      <div className="seat-grid">
        {/* Header Cột A B C... */}
        {colLabels.map((col, i) => (
          <div key={`head-${i}`} className="col-label">
            {col}
          </div>
        ))}

        {/* --- KHU VỰC THƯƠNG GIA --- */}
        <div className="class-divider">Hạng Thương Gia</div>
        {Array.from({ length: businessRows }).map((_, i) =>
          renderRow(i, "business")
        )}

        {/* --- KHU VỰC PHỔ THÔNG --- */}
        <div className="class-divider" style={{ marginTop: 20 }}>
          Hạng Phổ Thông
        </div>
        {Array.from({ length: economyRows }).map((_, i) =>
          renderRow(i + businessRows, "economy")
        )}
      </div>

      {/* Chú thích */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="box available"></span> Phổ thông
        </div>
        <div className="legend-item">
          <span className="box business"></span> Thương gia
        </div>
        <div className="legend-item">
          <span className="box occupied"></span> Đã bán
        </div>
        <div className="legend-item">
          <span className="box selected"></span>
          <span className="box selected business"></span> Đang chọn
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
