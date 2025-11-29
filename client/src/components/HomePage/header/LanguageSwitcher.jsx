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
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage("vi")}
        className={`lang-btn ${currentLang === "vi" ? "active" : ""}`}
      >
        VI
      </button>
      <span className="separator">|</span>
      <button
        onClick={() => changeLanguage("en")}
        className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
      >
        EN
      </button>
    </div>
  );
}
