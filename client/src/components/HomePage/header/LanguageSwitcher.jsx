import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const currentLang = i18n.resolvedLanguage || "vi";

  return (
    <div className="lang-toggle-container">
      <div
        className={`lang-item ${currentLang === "vi" ? "active" : ""}`}
        onClick={() => changeLanguage("vi")}
      >
        VI
      </div>

      <div
        className={`lang-item ${currentLang === "en" ? "active" : ""}`}
        onClick={() => changeLanguage("en")}
      >
        EN
      </div>

      <div
        className={`lang-slider ${currentLang === "en" ? "slide-right" : ""}`}
      ></div>
    </div>
  );
}
