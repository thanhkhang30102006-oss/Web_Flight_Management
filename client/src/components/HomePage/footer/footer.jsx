import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../header/LanguageSwitcher";
import airPlane from "../../../assets/Image/airplane-plane-flight-blue.svg";

import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import "./footer.css";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="flight-footer">
      <div className="footer-container">
        {/* Phần trên: 4 cột */}
        <div className="footer-grid">
          {/* Cột 1: Logo + Giới thiệu ngắn */}
          <div className="footer-col">
            <div className="footer-logo">
              <img src={airPlane} className="logo" alt="FlightHK Logo" />
              <h3>FlightHK</h3>
            </div>
            <p className="footer-desc">
              {t(
                "footer.desc",
                "Hệ thống quản lý chuyến bay – Nhanh chóng • An toàn • Tiết kiệm"
              )}
            </p>
            <div className="social-links">
              <a
                href="https://www.facebook.com/hieu77491/"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/hiufumi.marisa/"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="footer-col">
            <h4>{t("footer.contact", "Liên Hệ Với Chúng Tôi")}</h4>
            <ul className="contact-list">
              <li>
                <Mail size={18} /> hieuhdt.24it@vku.udn.vn
              </li>
              <li>
                <Mail size={18} /> khangpt.24it@vku.udn.vn
              </li>
              <li>
                <Phone size={18} /> 0123 456 789
              </li>
              <li>
                <MapPin size={18} />{" "}
                {t(
                  "footer.university",
                  "Đại học Công nghệ Thông tin & Truyền thông Việt – Hàn, Đà Nẵng"
                )}
              </li>
            </ul>
          </div>

          {/* Cột 3: Thành viên nhóm */}
          <div className="footer-col">
            <h4>{t("footer.team", "Nhóm Phát Triển")}</h4>
            <div className="team-members">
              <div className="member">
                <strong>Trung Hiếu</strong>
                <br />
                <small>hieuhdt.24it@vku.udn.vn</small>
              </div>
              <div className="member">
                <strong>Thanh Khang</strong>
                <br />
                <small>khangpt.24it@vku.udn.vn</small>
              </div>
            </div>
          </div>

          {/* Cột 4: Quick Links + Ngôn ngữ */}
          <div className="footer-col">
            <h4>{t("footer.other", "Khác")}</h4>
            <ul className="footer-links">
              <li>
                <a href="#">{t("footer.terms", "Điều khoản dịch vụ")}</a>
              </li>
              <li>
                <a href="#">{t("footer.privacy", "Chính sách bảo mật")}</a>
              </li>
              <li>
                <a href="#">{t("footer.support", "Hỗ trợ khách hàng")}</a>
              </li>
              <li>
                <a href="#">{t("footer.aboutUs", "Về chúng tôi")}</a>
              </li>
            </ul>

            {/* Dùng chung LanguageSwitcher từ Header */}
          </div>
        </div>

        {/* Phần dưới: Copyright */}
        <div className="footer-bottom">
          <p>
            © 2025 <strong>FlightHK</strong> –{" "}
            {t("footer.project", "Đồ án môn học Lập trình Web")}
            <br />
            {t("footer.developedBy", "Phát triển bởi")}{" "}
            <strong>Trung Hiếu</strong> & <strong>Thanh Khang</strong> – VKU
            24JIT
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
