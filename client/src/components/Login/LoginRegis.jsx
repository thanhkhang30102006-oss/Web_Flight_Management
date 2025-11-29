import React, { useState, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./LoginRegis.css";
import { useTranslation } from "react-i18next"; // 1. Import hook
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Globe,
  CreditCard,
  KeyRound,
  Smartphone,
  LogIn,
  UserPlus,
  Check,
  Circle,
  X,
} from "lucide-react";

// Hàm tiện ích validate (giữ nguyên logic của bạn)
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

const LoginRegis = () => {
  // Background Particles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: { color: { value: "#10100aff" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        push: { quantity: 2 },
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    particles: {
      color: { value: "#fbe18bff" },
      links: {
        color: "#ffeba7",
        distance: 175, // khoang cach cua particles
        enable: true,
        opacity: 0.5,
        width: 1, // do rong
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 2,
        straight: false,
      },
      number: { density: { enable: true, area: 700 }, value: 80 }, // số lượng trong 1 khu vuc
      opacity: { value: 0.75 },
      shape: { type: "square" },
      size: { value: { min: 2, max: 4 } }, // kich co cua 1 parti
    },
    detectRetina: true,
  };
  const { t } = useTranslation();
  // State để điều khiển việc lật thẻ (Login <-> Register)
  const [isLoginView, setIsLoginView] = useState(true);

  // --- LOGIC ĐĂNG NHẬP ---
  const [loginData, setLoginData] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerPassword: "",
  });
  const [showLoginPass, setShowLoginPass] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Login Data:", loginData);
    // Gọi API đăng nhập ở đây
  };

  // --- LOGIC ĐĂNG KÝ ---
  const [registerData, setRegisterData] = useState({
    passengerName: "",
    passengerGender: 1,
    passengerNationality: "",
    passengerPassport: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerAccountName: "",
    passengerPassword: "",
    passengerRePassword: "",
  });

  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegRePass, setShowRegRePass] = useState(false);
  const [isMatch, setIsMatch] = useState(true);
  const [passCriteria, setPassCriteria] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
    isValid: false,
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: name === "passengerGender" ? Number(value) : value,
    }));

    // Check khớp mật khẩu ngay khi nhập lại mật khẩu
    if (name === "passengerRePassword") {
      setIsMatch(value === registerData.passengerPassword);
    }
  };

  // Xử lý riêng cho input mật khẩu để validate realtime
  const handleRegisterPasswordChange = (e) => {
    const val = e.target.value;
    setRegisterData((prev) => ({ ...prev, passengerPassword: val }));

    const validationResult = validatePassword(val);
    setPassCriteria(validationResult);

    if (registerData.passengerRePassword) {
      setIsMatch(registerData.passengerRePassword === val);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!passCriteria.isValid || !isMatch) {
      alert("Vui lòng kiểm tra lại mật khẩu!");
      return;
    }
    console.log("Register Data:", registerData);
    // Gọi API đăng ký ở đây
  };

  // Hàm chuyển đổi form
  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="auth-body">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
      />
      <div className="section-wrapper">
        {/* Nút chuyển đổi phía trên */}
        <div className="toggle-switch-container">
          <div
            className={`toggle-item ${isLoginView ? "active" : ""}`}
            onClick={() => setIsLoginView(true)}
            title={t("auth.login_title")}
          >
            <LogIn size={24} strokeWidth={2.5} />
          </div>

          <div
            className={`toggle-item ${!isLoginView ? "active" : ""}`}
            onClick={() => setIsLoginView(false)}
            title={t("auth.register_title")}
          >
            <UserPlus size={24} strokeWidth={2.5} />
          </div>

          {/* Thanh trượt nền (Indicator) */}
          <div
            className={`slider-indicator ${!isLoginView ? "slide-right" : ""}`}
          ></div>
        </div>

        {/* Khung 3D xoay */}
        <div
          className={`card-3d-wrapper ${!isLoginView ? "show-register" : ""}`}
        >
          {/* --- MẶT TRƯỚC: LOGIN --- */}
          <div className="card-front">
            <h2>{t("auth.login_title")}</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="passengerName"
                  placeholder={t("placeholder.username")}
                  value={loginData.passengerName}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="passengerEmail"
                  placeholder={t("placeholder.email")}
                  value={loginData.passengerEmail}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="passengerMobile"
                  placeholder={t("placeholder.phone")}
                  value={loginData.passengerMobile}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="input-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  type={showLoginPass ? "text" : "password"}
                  name="passengerPassword"
                  placeholder={t("placeholder.password")}
                  value={loginData.passengerPassword}
                  onChange={handleLoginChange}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                >
                  {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <button type="submit" className="btn-submit">
                {t("auth.login_button")}
              </button>
              <div className="switch-text">
                {t("auth.no_account")}{" "}
                <a onClick={toggleView}>{t("auth.register_now")}</a>
              </div>
            </form>
          </div>

          {/* --- MẶT SAU: REGISTER --- */}
          <div className="card-back">
            <h2>{t("auth.register_title")}</h2>
            <form onSubmit={handleRegisterSubmit}>
              <h3 className="section-title">{t("auth.personal_info")}</h3>

              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="passengerName"
                  placeholder={t("placeholder.fullname")}
                  value={registerData.passengerName}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="gender-group">
                <label className="gender-label">
                  <input
                    type="radio"
                    name="passengerGender"
                    value={1}
                    checked={registerData.passengerGender === 1}
                    onChange={handleRegisterChange}
                  />
                  {t("auth.male")}
                </label>
                <label className="gender-label">
                  <input
                    type="radio"
                    name="passengerGender"
                    value={0}
                    checked={registerData.passengerGender === 0}
                    onChange={handleRegisterChange}
                  />
                  {t("auth.female")}
                </label>
              </div>

              <div className="input-wrapper">
                <Globe size={18} className="input-icon" />
                <input
                  type="text"
                  name="passengerNationality"
                  placeholder={t("placeholder.nationality")}
                  value={registerData.passengerNationality}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="input-wrapper">
                <CreditCard size={18} className="input-icon" />
                <input
                  type="text"
                  name="passengerPassport"
                  placeholder={t("placeholder.passport")}
                  value={registerData.passengerPassport}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="passengerEmail"
                  placeholder={t("placeholder.email")}
                  value={registerData.passengerEmail}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="input-wrapper">
                <Smartphone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="passengerMobile"
                  placeholder={t("placeholder.phone")}
                  value={registerData.passengerMobile}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <h3 className="section-title">{t("auth.account_info")}</h3>

              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="passengerAccountName"
                  placeholder={t("placeholder.account_name")}
                  value={registerData.passengerAccountName}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showRegPass ? "text" : "password"}
                  name="passengerPassword"
                  placeholder={t("placeholder.password")}
                  value={registerData.passengerPassword}
                  onChange={handleRegisterPasswordChange}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowRegPass(!showRegPass)}
                >
                  {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              {/* Validate UI */}
              {registerData.passengerPassword && (
                <div className="password-criteria">
                  <ul>
                    <li className={passCriteria.length ? "valid" : "invalid"}>
                      {passCriteria.length ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.min_length")}</span>
                    </li>

                    <li className={passCriteria.upper ? "valid" : "invalid"}>
                      {passCriteria.upper ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.uppercase")}</span>
                    </li>

                    <li className={passCriteria.lower ? "valid" : "invalid"}>
                      {passCriteria.lower ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.lowercase")}</span>
                    </li>

                    <li className={passCriteria.number ? "valid" : "invalid"}>
                      {passCriteria.number ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.number")}</span>
                    </li>

                    <li className={passCriteria.special ? "valid" : "invalid"}>
                      {passCriteria.special ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.special_char")}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="input-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  type={showRegRePass ? "text" : "password"}
                  name="passengerRePassword"
                  placeholder={t("placeholder.re_password")}
                  value={registerData.passengerRePassword}
                  onChange={handleRegisterChange}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowRegRePass(!showRegRePass)}
                >
                  {showRegRePass ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {!isMatch && registerData.passengerRePassword && (
                <small
                  style={{
                    color: "#ff4444",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  {t("validation.password_mismatch")}{" "}
                </small>
              )}

              <button type="submit" className="btn-submit">
                {t("auth.register_button")}{" "}
              </button>
              <div className="switch-text">
                {t("auth.have_account")}{" "}
                <a onClick={toggleView}>{t("auth.login_now")}</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegis;
