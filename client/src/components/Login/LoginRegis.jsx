import React, { useState, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./LoginRegis.css";
import { useTranslation } from "react-i18next";
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
  Briefcase,
  ShieldCheck,
  Badge,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
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
  // State để điều khiển lật thẻ

  // --- STATE QUẢN LÝ ---
  const [isLoginView, setIsLoginView] = useState(true);
  const [userRole, setUserRole] = useState("passenger"); // passenger | staff | admin
  const [showPass, setShowPass] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getTitle = () => {
    if (userRole === "passenger") return t("auth.login_title");
    if (userRole === "staff") return "Staff Portal";
    return "Admin Portal";
  };
  // --- LOGIC ĐĂNG NHẬP ---
  const [passengerLogin, setPassengerLogin] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerPassword: "",
  });

  // --- 2. STATE RIÊNG CHO STAFF/ADMIN ---
  const [staffLogin, setStaffLogin] = useState({
    staffID: "",
    staffPassword: "",
  });

  const handleRoleChange = (newRole) => {
    if (newRole === userRole) return;

    setIsAnimating(true);

    setTimeout(() => {
      setUserRole(newRole);
      setShowPass(false);

      if (newRole !== "passenger") {
        setIsLoginView(true);
      }

      setIsAnimating(false);
    }, 400);
  };
  const handlePassengerChange = (e) => {
    const { name, value } = e.target;
    setPassengerLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffLogin((prev) => ({ ...prev, [name]: value }));
  };

  //const [showLoginPass, setShowLoginPass] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    let apiEndpoint = "";
    let redirectPath = "";
    let payload = {};

    // --- TÁCH BIỆT LOGIC PAYLOAD ---
    if (userRole === "passenger") {
      apiEndpoint = "api/user/login";
      redirectPath = "/user";

      // Dữ liệu chuẩn của Passenger
      payload = {
        passengerName: passengerLogin.passengerName,
        passengerEmail: passengerLogin.passengerEmail,
        passengerMobile: passengerLogin.passengerMobile,
        passengerPassword: passengerLogin.passengerPassword,
      };
    } else {
      // Logic cho Staff và Admin (Dùng chung cấu trúc staffID)
      apiEndpoint =
        userRole === "staff" ? "api/staff/loginStaff" : "api/admin/login";
      redirectPath =
        userRole === "staff" ? "/staff-dashboard" : "/admin-dashboard";

      // Dữ liệu chuẩn của Staff/Admin
      payload = {
        staffID: staffLogin.staffID,
        staffPassword: staffLogin.staffPassword,
      };
    }

    console.log(`Đang đăng nhập role: ${userRole}`);
    console.log("Payload gửi đi:", payload);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Đăng nhập thất bại");
      } else {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userData", JSON.stringify(data.user));

        alert(`Đăng nhập thành công!`);
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login error", error);
      alert("Lỗi kết nối Server");
    }
  };

  // const handleLoginSubmit = async (e) => {
  //   e.preventDefault();
  //   let apiEndpoint = "";
  //   let redirectPath = "";
  //   let payload = {};

  //   console.log("Login Data:", loginData);
  //   const response = await fetch(`api/user/login`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(loginData),

  //     credentials: "include",
  //   });
  //   const data = await response.json();
  //   if (!response.ok) {
  //     alert(data.message || "Đăng nhập thất bại");
  //     return;
  //   } else {
  //     const accessToken = data.accessToken;
  //     localStorage.setItem("accessToken", accessToken);
  //     console.log("Đăng nhập thành công!");
  //     localStorage.setItem("userData", JSON.stringify(data.user));
  //     navigate("/user");
  //   }
  // };

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
  const toggleView = () => setIsLoginView(!isLoginView);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!passCriteria.isValid || !isMatch) {
      alert("Vui lòng kiểm tra lại mật khẩu!");
      return;
    }

    const response = await fetch(`api/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Request failed");
    else {
      // Chuyển hướng qua login
      alert("Đăng ký thành công");
      toggleView();
    }
  };

  // Hàm chuyển đổi form

  return (
    <div className="auth-body">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
      />
      <div className="section-wrapper">
        <div className="form-column">
          {/* Nút chuyển đổi phía trên */}
          <div
            className={`toggle-switch-container ${
              userRole !== "passenger" ? "hidden-toggle" : ""
            }`}
          >
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
              className={`slider-indicator ${
                !isLoginView ? "slide-right" : ""
              }`}
            ></div>
          </div>

          {/* Khung 3D xoay */}
          <div
            className={`card-3d-wrapper ${
              isAnimating
                ? "role-switching"
                : !isLoginView
                ? "show-register"
                : ""
            }`}
          >
            {/* --- MẶT TRƯỚC: LOGIN --- */}
            <div className="card-front">
              <h2>{getTitle()}</h2>

              <form onSubmit={handleLoginSubmit}>
                {/* --- INPUT CHO PASSENGER (Dung passengerLogin) --- */}
                {userRole === "passenger" ? (
                  <>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="passengerName"
                        placeholder={t("placeholder.username")}
                        value={passengerLogin.passengerName}
                        onChange={handlePassengerChange}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="passengerEmail"
                        placeholder={t("placeholder.email")}
                        value={passengerLogin.passengerEmail}
                        onChange={handlePassengerChange}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        name="passengerMobile"
                        placeholder={t("placeholder.phone")}
                        value={passengerLogin.passengerMobile}
                        onChange={handlePassengerChange}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <KeyRound size={18} className="input-icon" />
                      <input
                        type={showPass ? "text" : "password"}
                        name="passengerPassword"
                        placeholder={t("placeholder.password")}
                        value={passengerLogin.passengerPassword}
                        onChange={handlePassengerChange}
                        required
                      />
                      <span
                        className="toggle-password"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                    <div className="switch-text">
                      {t("auth.no_account")}{" "}
                      <a onClick={toggleView}>{t("auth.register_now")}</a>
                    </div>
                  </>
                ) : (
                  /* --- INPUT CHO STAFF/ADMIN (Dùng staffLogin) --- */
                  <>
                    <div className="input-wrapper">
                      <Badge size={18} className="input-icon" />
                      <input
                        type="text"
                        name="staffID"
                        placeholder={t("placeholder.usernamestaff")}
                        value={staffLogin.staffID}
                        onChange={handleStaffChange}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <KeyRound size={18} className="input-icon" />
                      <input
                        type={showPass ? "text" : "password"}
                        name="staffPassword" // Tên trường riêng
                        placeholder={t("placeholder.passwordprivate")}
                        value={staffLogin.staffPassword}
                        onChange={handleStaffChange}
                        required
                      />
                      <span
                        className="toggle-password"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </>
                )}
                <button type="submit" className="btn-submit">
                  {t("auth.login_button")}
                </button>
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

                      <li
                        className={passCriteria.special ? "valid" : "invalid"}
                      >
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
        {/* === CỘT PHẢI: SIDEBAR CHỌN ROLE (Code Mới) === */}
        <div className="role-sidebar">
          {/* Nút Passenger */}
          <div
            className={`role-item ${userRole === "passenger" ? "active" : ""}`}
            onClick={() => handleRoleChange("passenger")}
            data-title={t("auth.data-title.passenger")}
          >
            <User size={22} />
          </div>

          {/* Nút Staff */}
          <div
            className={`role-item ${userRole === "staff" ? "active" : ""}`}
            onClick={() => handleRoleChange("staff")}
            data-title={t("auth.data-title.staff")}
          >
            <Briefcase size={22} />
          </div>

          {/* Nút Admin */}
          <div
            className={`role-item ${userRole === "admin" ? "active" : ""}`}
            onClick={() => handleRoleChange("admin")}
            data-title={t("auth.data-title.admin")}
          >
            <ShieldCheck size={22} />
          </div>
        </div>
        {/* === HẾT CỘT PHẢI === */}
      </div>
    </div>
  );
};

export default LoginRegis;
