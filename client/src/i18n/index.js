// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import vi from "./vi.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi }
    },
    lng: localStorage.getItem("language") || "vi", 
    fallbackLng: "vi",
    interpolation: { escapeValue: false }
  });

export default i18n;