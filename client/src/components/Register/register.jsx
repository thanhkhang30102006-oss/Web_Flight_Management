import { useState } from "react";
function FormSignUp() {
  const [formData, setFormData] = useState({
    passengerName: "",
    passengerGender: 1,
    passengerNationality: "",
    passengerPassport: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerImage: "",
    passengerAccountName: "",
    passengerPassword: "",
    passengerRePassword: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "passengerGender" ? Number(value) : value,
    }));
  };
  const sendInfo = () => {};
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
              value={formData.passengerName}
              onChange={handleChange}
            ></input>
          </div>
          <div className="check-box">
            <label htmlFor="male">
              <input
                type="radio"
                name="passengerGender"
                id="male"
                value={1}
                checked={formData.passengerGender === 1}
                onChange={handleChange}
              ></input>
              Nam
            </label>

            <label htmlFor="female">
              <input
                type="radio"
                name="passengerGender"
                id="female"
                value={0}
                checked={formData.passengerGender === 0}
                onChange={handleChange}
              ></input>
              Nữ
            </label>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerNationality"
              placeholder="Nhập quốc tịch của người dùng"
              value={formData.passengerNationality}
              onChange={handleChange}
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerPassport"
              placeholder="Nhập đẩy đủ số hộ chiếu"
              value={formData.passengerPassport}
              onChange={handleChange}
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="email"
              name="passengerEmail"
              placeholder="Nhập email của người dùng"
              value={formData.passengerEmail}
              onChange={handleChange}
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="tel"
              name="passengerMobile"
              placeholder="Nhập số điện thoại"
              value={formData.passengerMobile}
              onChange={handleChange}
            ></input>
          </div>
          <h3 className="section-title">Thông tin tài khoản</h3>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerAccountName"
              placeholder="Nhập tên người dùng muốn đặt cho tài khoản"
              value={formData.passengerAccountName}
              onChange={handleChange}
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="password"
              name="passengerPassword"
              placeholder="Nhập mật khẩu của người dùng"
              value={formData.passengerPassword}
              onChange={handleChange}
            ></input>
          </div>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="password"
              name="passengerRePassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.passengerRePassword}
              onChange={handleChange}
            ></input>
          </div>
          <button type="submit">Đăng ký</button>
          <div
            style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}
          >
            <span>Đã có tài khoản? </span>
            <a
              href="/login"
              style={{
                color: "blue",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Đăng nhập
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
export default FormSignUp;
