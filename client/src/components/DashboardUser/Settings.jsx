import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Lock,
  Info,
  Camera,
  Save,
  Github,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  Loader2,
  Check,
  Circle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./Settings.css";
import airplaneIcon from "../../assets/Image/airplane-plane-flight-white.svg";
const API_BASE_URL = "http://localhost:3001/api/user/";
const userData = localStorage.getItem("userData");
const loggedInUser = userData ? JSON.parse(userData) : null;
const passengerID = loggedInUser.id;
// Hàm validate (Copy từ LoginRegis)
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

const Settings = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  // State cho Profile
  const [profile, setProfile] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerMobile: "",
    passengerPassport: "",
    passengerNationality: "",
    passengerGender: true,
    passengerImage: "",
    passengerID: "",
  });
  useEffect(() => {});
  // State cho Password
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passCriteria, setPassCriteria] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
    isValid: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setProfile(result.data);
        } else {
          console.error("Lỗi lấy thông tin:", result.message);
        }
      } catch (error) {
        console.error("Lỗi kết nối server:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    // Xử lý riêng cho select box gender (convert string "true"/"false" sang boolean)
    if (name === "passengerGender") {
      setProfile({ ...profile, [name]: value === "true" });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (name === "newPassword") {
      const validationResult = validatePassword(value);
      setPassCriteria(validationResult);
    }
  };

  // Helper chuyển file sang Base64 để gửi lên server (Vì Controller nhận String)
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);

        // Cập nhật state để hiển thị preview ngay lập tức
        setProfile({ ...profile, passengerImage: base64 });
      } catch (error) {
        alert("Lỗi khi đọc file ảnh");
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passengerName: profile.passengerName,
          passengerGender: profile.passengerGender,
          passengerNationality: profile.passengerNationality,
          passengerEmail: profile.passengerEmail,
          passengerPassport: profile.passengerPassport,
          passengerMobile: profile.passengerMobile,
          passengerImage: profile.passengerImage, // Gửi chuỗi Base64
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Cập nhật thông tin thành công!");
        // Cập nhật lại state với dữ liệu mới từ server trả về (để đồng bộ)
        setProfile(result.data);
      } else {
        toast.error(result.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. GỌI API ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passCriteria.isValid) {
      toast.error(
        "Mật khẩu mới chưa đủ mạnh (cần 8 ký tự, hoa, thường, số, ký tự đặc biệt)!"
      );
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Reset criteria
        setPassCriteria({
          length: false,
          lower: false,
          upper: false,
          number: false,
          special: false,
          isValid: false,
        });
      } else {
        toast.error(result.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi đổi mật khẩu.");
    }
  };
  if (fetching) {
    return (
      <div className="flex justify-center items-center h-full text-white">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="settings-container animate-fade-in">
      {/* SIDEBAR MINI CHO SETTINGS */}
      <div className="settings-sidebar glass-panel">
        <h3>Cài đặt</h3>
        <button
          className={`settings-nav-btn ${
            activeSection === "profile" ? "active" : ""
          }`}
          onClick={() => setActiveSection("profile")}
        >
          <User size={18} /> Hồ sơ cá nhân
        </button>
        <button
          className={`settings-nav-btn ${
            activeSection === "security" ? "active" : ""
          }`}
          onClick={() => setActiveSection("security")}
        >
          <Lock size={18} /> Bảo mật
        </button>
        <button
          className={`settings-nav-btn ${
            activeSection === "about" ? "active" : ""
          }`}
          onClick={() => setActiveSection("about")}
        >
          <Info size={18} /> Về phần mềm
        </button>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="settings-content glass-panel">
        {/* --- TAB PROFILE --- */}
        {activeSection === "profile" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="section-title">Thông tin cá nhân</h2>
            <form onSubmit={handleSaveProfile} className="profile-form">
              {/* Avatar Upload */}
              <div className="avatar-section">
                <div className="avatar-info">
                  <p className="user-id">ID: {passengerID}</p>
                  <span className="role-badge">Hành khách</span>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label>
                    <User size={14} /> Họ và tên
                  </label>
                  <input
                    className="glass-input"
                    name="passengerName"
                    value={profile.passengerName || ""}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>
                    <Mail size={14} /> Email
                  </label>
                  <input
                    className="glass-input"
                    name="passengerEmail"
                    value={profile.passengerEmail || ""}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>
                    <Phone size={14} /> Số điện thoại
                  </label>
                  <input
                    className="glass-input"
                    name="passengerMobile"
                    value={profile.passengerMobile || ""}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>
                    <CreditCard size={14} /> Số Hộ Chiếu
                  </label>
                  <input
                    className="glass-input"
                    name="passengerPassport"
                    value={profile.passengerPassport || ""}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>
                    <Globe size={14} /> Quốc tịch
                  </label>
                  <input
                    className="glass-input"
                    name="passengerNationality"
                    value={profile.passengerNationality || ""}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Giới tính</label>
                  <select
                    className="glass-input"
                    name="passengerGender"
                    value={profile.passengerGender ? "true" : "false"}
                    onChange={handleProfileChange}
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {loading ? " Đang lưu..." : " Lưu thay đổi"}
              </button>
            </form>
          </motion.div>
        )}

        {/* --- TAB SECURITY --- */}
        {activeSection === "security" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="section-title">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="security-form">
              <div className="input-group">
                <br></br>
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="glass-input"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="input-group">
                <br></br>
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  className="glass-input"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>

              {/* 3. CHÈN UI VALIDATE MẬT KHẨU TẠI ĐÂY */}
              {passwords.newPassword && (
                <div className="password-criteria">
                  <ul>
                    <li className={passCriteria.length ? "valid" : "invalid"}>
                      {passCriteria.length ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>
                        {t("validation.min_length", "Tối thiểu 8 ký tự")}
                      </span>
                    </li>
                    <li className={passCriteria.upper ? "valid" : "invalid"}>
                      {passCriteria.upper ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>
                        {t("validation.uppercase", "Chữ in hoa (A-Z)")}
                      </span>
                    </li>
                    <li className={passCriteria.lower ? "valid" : "invalid"}>
                      {passCriteria.lower ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>
                        {t("validation.lowercase", "Chữ thường (a-z)")}
                      </span>
                    </li>
                    <li className={passCriteria.number ? "valid" : "invalid"}>
                      {passCriteria.number ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>{t("validation.number", "Số (0-9)")}</span>
                    </li>
                    <li className={passCriteria.special ? "valid" : "invalid"}>
                      {passCriteria.special ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      <span>
                        {t(
                          "validation.special_char",
                          "Ký tự đặc biệt (!@#...)"
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              <div className="input-group">
                <br></br>
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="glass-input"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <br></br>
              <br></br>

              <button type="submit" className="save-btn warning">
                Đổi mật khẩu
              </button>
            </form>
          </motion.div>
        )}

        {/* --- TAB ABOUT --- */}
        {activeSection === "about" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="about-section"
          >
            <div className="app-logo-large">
              <img
                src={airplaneIcon}
                alt="FlightHK Logo"
                className="sidebar-logo-img"
              ></img>
            </div>
            <h2>Flight Management System</h2>
            <p className="version">Version 1.0.0 (Beta)</p>
            <p className="description">
              Hệ thống quản lý vé máy bay trực tuyến, hỗ trợ đặt vé, tra cứu
              chuyến bay và quản lý thông tin hành khách tiện lợi.
            </p>

            <div className="links">
              <a
                href="https://github.com/thanhkhang30102006-oss/Web_Flight_Management"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                <Github size={20} /> Xem mã nguồn trên GitHub
              </a>
            </div>

            <div className="credits">
              <p>
                Developed by: <strong>ThanhKhang & TrungHieu</strong>
              </p>
              <p>
                © 2025 Vietnam - Korea University of Information and
                Communication Technology (VKU)
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
