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

  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);

  const [passCriteria, setPassCriteria] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
    isValid: false,
  });
  const [isMatch, setIsMatch] = useState(true);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "passengerGender" ? Number(value) : value,
    }));
    if (name === "passengerRePassword") {
      setIsMatch(value === formData.passengerPassword);
    }
  };
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, passengerPassword: val });

    const validationResult = validatePassword(val);
    setPassCriteria(validationResult);

    if (formData.passengerRePassword) {
      setIsMatch(formData.passengerRePassword === val);
    }
  };
  const sendInfo = async () => {};
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
              required
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
              required
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
          <h3 className="section-title">Thông tin tài khoản</h3>
          <div className="input-wrapper">
            <span className="input-icon"></span>
            <input
              type="text"
              name="passengerAccountName"
              placeholder="Nhập tên người dùng muốn đặt cho tài khoản"
              value={formData.passengerAccountName}
              onChange={handlePasswordChange}
            ></input>
          </div>
          <div className="input-wrapper password-wrapper">
            <span className="input-icon"></span>
            <input
              type={showPass ? "text" : "password"}
              name="passengerPassword"
              placeholder="Nhập mật khẩu của người dùng"
              value={formData.passengerPassword}
              onChange={handlePasswordChange}
              required
            ></input>
            <span
              className="toggle-password"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>
          {formData.passengerPassword && (
            <div className="password-criteria">
              <p>Mật khẩu cần có:</p>
              <ul>
                <li className={passCriteria.length ? "valid" : "invalid"}>
                  {passCriteria.length ? "✅" : "○"} Tối thiểu 8 ký tự
                </li>
                <li className={passCriteria.upper ? "valid" : "invalid"}>
                  {passCriteria.upper ? "✅" : "○"} Chữ hoa (A-Z)
                </li>
                <li className={passCriteria.lower ? "valid" : "invalid"}>
                  {passCriteria.lower ? "✅" : "○"} Chữ thường (a-z)
                </li>
                <li className={passCriteria.number ? "valid" : "invalid"}>
                  {passCriteria.number ? "✅" : "○"} Số (0-9)
                </li>
                <li className={passCriteria.special ? "valid" : "invalid"}>
                  {passCriteria.special ? "✅" : "○"} Ký tự đặc biệt (!@#...)
                </li>
              </ul>
            </div>
          )}
          <div className="input-wrapper password-wrapper">
            <span className="input-icon"></span>
            <input
              type="password"
              name="passengerRePassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.passengerRePassword}
              onChange={handleChange}
              required
            ></input>
            <span
              className="toggle-password"
              onClick={() => setShowRePass(!showRePass)}
            >
              {showRePass ? "🙈" : "👁️"}
            </span>
            {!isMatch && formData.passengerRePassword && (
              <small style={{ color: "red", marginLeft: "10px" }}>
                Mật khẩu không khớp!
              </small>
            )}
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

function checkPassword(password, repassword) {
  if (password === repassword) return true;
  else return false;
}
function validatePassword(password) {
  const minLength = /.{8,}/;
  const hasLower = /[a-z]/;
  const hasUpper = /[A-Z]/;
  const hasNumber = /[0-9]/;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

  return {
    length: minLength.test(password),
    lower: hasLower.test(password),
    upper: hasUpper.test(password),
    number: hasNumber.test(password),
    special: hasSpecial.test(password),
    isValid:
      minLength.test(password) &&
      hasLower.test(password) &&
      hasUpper.test(password) &&
      hasNumber.test(password) &&
      hasSpecial.test(password),
  };
}

export default FormSignUp;
