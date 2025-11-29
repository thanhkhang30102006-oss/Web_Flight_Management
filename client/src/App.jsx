import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePageScript.jsx";
import FlightPage from "./components/HomePage/main/FlightScript.jsx";
import RegisterPage from "./pages/Register.jsx";
import LoginPage from "./pages/Login.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/flights" element={<FlightPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
