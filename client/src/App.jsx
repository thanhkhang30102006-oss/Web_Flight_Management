import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePageScript.jsx";
import FlightPage from "./components/HomePage/main/FlightScript.jsx";
import LoginSignupPage from "./pages/Login.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/flights" element={<FlightPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/loginsignup" element={<LoginSignupPage />} />
    </Routes>
  );
}
