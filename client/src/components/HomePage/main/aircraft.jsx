import React from "react";
function AirCraft() {
  // Đối với danh sách các chuyến bay cần nạp dữ liệu từ database vào + slider
  return (
    <>
      <div className="air-craft-text">
        <h1>Aircraft</h1>
        <text>Luôn cập nhật tình trạng các chuyến bay theo thời gian thực</text>
      </div>
      <div className="list-aircraft"></div>
    </>
  );
}
export { AirCraft };
