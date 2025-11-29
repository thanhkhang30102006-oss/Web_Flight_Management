import { useState } from "react";
function FormSignUp() {
  const [formData, setFormData] = useState({
    passengerName: "",
    passengerGender: "",
    passengerNationallity: "",
    passengerPassport: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerImage: "",
    passengerAccountName: "",
    passengerPassword: "",
  });

  return (
    <>
      <div className="form-div">
        <h1>Đăng Ký</h1>
        <form className="form-group" onSubmit={sendInfo}>
          <h3 className="section-title">Thông tin cá nhân</h3>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerName"
              placeholder="Nhập đẩy đủ tên người dùng"
            ></input>
          </div>
          <div className="check-box">
            <label htmlFor="male">
              <input type="radio" name="passengerGender"></input>Nam
            </label>

            <label htmlFor="female">
              <input type="radio" name="passengerGender"></input>Nữ
            </label>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerNationality"
              placeholder="Nhập quốc tịch của người dùng"
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerPassport"
              placeholder="Nhập đẩy đủ số hộ chiếu"
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="email"
              name="passengerEmail"
              placeholder="Nhập email của người dùng"
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="tel"
              name="passengerMobile"
              placeholder="Nhập số điện thoại"
            ></input>
          </div>
          <h3 className="section-title">Thông tin tài khoản</h3>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerAccountName"
              placeholder="Nhập tên người dùng muốn đặt cho tài khoản"
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="password"
              name="passengerPassword"
              placeholder="Nhập mật khẩu của người dùng"
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="password"
              name="passengerRePassword"
              placeholder="Nhập lại mật khẩu"
            ></input>
          </div>
          <button type="submit">Đăng ký</button>
        </form>
      </div>
    </>
  );
}
