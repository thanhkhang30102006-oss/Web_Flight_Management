import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import airPlane from "../../../assets/Image/airplane-plane-flight-white.svg";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLink, setActiveLink] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Update active link based on current location
    const path = location.pathname;
    if (path === "/" || path === "/home") {
      setActiveLink("homepage");
    } else if (path === "/flights") {
      setActiveLink("flight");
    } else if (path === "/about-us") {
      setActiveLink("introduction");
    } else {
      setActiveLink(null);
    }
  }, [location]);

  const handleNavigation = (route, id) => {
    navigate(route);
    setActiveLink(id);
  };
  const handleSearch = () => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch === "merry christmas") {
      navigate("/ChristmasTree");
    } else {
      // Logic tìm kiếm thông thường (nếu có)
      console.log("Đang tìm kiếm:", searchTerm);
    }
  };

  // Xử lý khi nhấn phím Enter trong ô input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header
      className={`header ${isScrolled ? "header-scrolled" : ""}`}
      style={{ backgroundColor: "#3399FF" }}
    >
      <div className="left">
        <img src={airPlane} className="logo" alt="FlightHK Logo" />
        <h3 className="logo-text">FlightHK</h3>
      </div>
      <div className="middle">
        <ul className="listFunc">
          <li
            className={`list-item ${activeLink === "homepage" ? "active" : ""}`}
            onClick={() => handleNavigation("/", "homepage")}
          >
            {t("header.home")}
          </li>
          <li
            className={`list-item ${activeLink === "flight" ? "active" : ""}`}
            onClick={() => handleNavigation("/flights", "flight")}
          >
            {t("header.flight", "Chuyến bay")}
          </li>
          <li
            className={`list-item ${
              activeLink === "introduction" ? "active" : ""
            }`}
            onClick={() => handleNavigation("/about-us", "introduction")}
          >
            {t("header.about", "Giới thiệu")}
          </li>
        </ul>
      </div>
      <div className="right">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t("header.search", "Tìm kiếm...")}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-button" onClick={handleSearch}>
            {t("header.searchBtn", "Tìm")}
          </button>
        </div>

        {/* Auth buttons + Language Switcher */}

        <div className="auth-and-lang">
          <button
            className="neon-capsule-btn"
            onClick={() => navigate("/loginsignup")}
          >
            {t("header.logsign", "Log/Sign")}
          </button>

          <LanguageSwitcher className="theme-light" />
        </div>
      </div>
    </header>
  );
}

export default Header;
