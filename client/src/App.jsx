import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePageScript.jsx";
import FlightPage from "./components/HomePage/main/FlightScript.jsx";
import LoginSignupPage from "./pages/Login.jsx";
import DashBoard from "./pages/Dashboard.jsx";
import Booking from "./pages/BookingFlow.jsx";
import BookingPage from "./components/BookingFlight/BookingPage.jsx";
import PaymentPage from "./components/BookingFlight/PaymentPage.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/flights" element={<FlightPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/loginsignup" element={<LoginSignupPage />} />
      <Route path="/user" element={<DashBoard />} />
      <Route path="/user/booking-details" element={<BookingPage />} />
      <Route path="/user/payment" element={<PaymentPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
