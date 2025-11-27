import React, { useState } from "react";

function SimpleInfo() {
  return (
    <div className="introduce">
      <h1>FlightHK – Nơi mọi chuyến bay trở nên đơn giản hơn.</h1>
      <text>
        Từ tra cứu vé, lịch trình đến cập nhật trạng thái chuyến bay, tất cả chỉ
        trong một nền tảng duy nhất.
      </text>
    </div>
  );
}

function FastChecking() {
  const [formData, setFormData] = useState({
    departure: "",
    arrive: "",
    departureDay: "",
    typeNumber: 1,
  });
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Xử lý  thông tin tìm chuyến bay

    try {
      const response = await fetch(`/api/flights/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error: ", error);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <>
      <div className="info-container">
        <div className="type">
          <ul>
            <li>Một chiều</li>
          </ul>
        </div>
        <form className="form-group" onSubmit={handleSubmit}>
          <div className="box">
            <label htmlFor="departure">Từ</label>
            <input
              type="text"
              name="departure"
              placeholder="Sân bay khởi hành"
              onChange={handleChange}
              value={formData.departure}
            ></input>
          </div>
          <div className="box">
            <label htmlFor="arrive">Đến</label>
            <input
              type="text"
              name="arrive"
              placeholder="Sân bay đến"
              onChange={handleChange}
              value={formData.arrive}
            ></input>
          </div>
          <div className="box">
            <label htmlFor="day">Ngày đi</label>
            <input
              type="date"
              name="departureDay"
              placeholder="mm/dd/yyyy"
              onChange={handleChange}
              value={formData.departureDay}
            ></input>
          </div>
          <div className="box">
            <label htmlFor="passenger">Hành khách</label>
            <select
              name="typeNumber"
              onChange={handleChange}
              value={formData.typeNumber}
            >
              <option id="one-passenger" value={1}>
                1 người
              </option>
              <option id="couple" value={2}>
                2 người
              </option>
            </select>
          </div>
          <button type="submit">Tìm chuyến bay</button>
        </form>
      </div>
      <div className="flight-box"></div>
    </>
  );
}

function TopRating() {
  // Hàm này xử lý nạp động dữ liệu địa điểm
}

function AboutUs() {
  return (
    <>
      <h1>TẠI SAO CHỌN CHÚNG TÔI</h1>
      <div className="box-container">
        <div className="mini-box">
          <img></img>
          <h3>An Toàn & Bảo Mật</h3>
          <p>Thông tin của bạn được và bảo vệ tuyệt đối</p>
        </div>
        <div className="mini-box">
          <img></img>
          <h3>Đặt Vé Nhanh Chóng</h3>
          <p>Chỉ mất 3 phút để hoàn tất đặt vé của bạn</p>
        </div>
        <div className="mini-box">
          <img></img>
          <h3>Thanh Toán Đa Dạng</h3>
          <p>Hỗ trợ nhiều hình thức thanh toán tiện lợi</p>
        </div>
        <div className="mini-box">
          <img></img>
          <h3>Hỗ Trợ 24/7</h3>
          <p>Đội ngũ chăm sóc khách hàng luôn sẵn sàng</p>
        </div>
      </div>
    </>
  );
}
export { SimpleInfo, FastChecking, TopRating, AboutUs };
