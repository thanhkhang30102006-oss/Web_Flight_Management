import { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const sendInfo = async () => {};
  return (
    <>
      <div className="form-div">
        <h1>Đăng Nhập</h1>
        <form className="form-group" onSubmit={sendInfo}>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerName"
              placeholder="Nhập đẩy đủ tên người dùng"
              value={formData.passengerName}
              onChange={handleChange}
              required
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
              required
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
              required
            ></input>
          </div>
          <div className="input-wrapper password-wrapper">
            <span className="input-icon"></span>
            <input
              type={showPass ? "text" : "password"}
              name="passengerPassword"
              placeholder="Nhập mật khẩu của người dùng"
              value={formData.passengerPassword}
              onChange={handleChange}
              required
            ></input>
            <span
              className="toggle-password"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>
        </form>
      </div>
    </>
  );
}
export default Login;
