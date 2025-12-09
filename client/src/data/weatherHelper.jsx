import { Sun, Cloud, CloudRain, CloudLightning, Snowflake } from "lucide-react";

export const AIRPORT_COORDS = {
  HAN: { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  DAD: { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  SGN: { name: "TP.HCM", lat: 10.8231, lon: 106.6297 },
};

export const getWeatherIcon = (code) => {
  if (code <= 1) return <Sun size={24} color="#facc15" />; // Nắng
  if (code <= 3) return <Cloud size={24} color="#94a3b8" />; // Mây
  if (code <= 65) return <CloudRain size={24} color="#60a5fa" />; // Mưa
  if (code <= 95) return <CloudLightning size={24} color="#f59e0b" />; // Dông
  return <Snowflake size={24} color="#bae6fd" />;
};
