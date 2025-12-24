import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePageScript.jsx";
import FlightPage from "./components/HomePage/main/FlightScript.jsx";
import AboutUsPage from "./components/HomePage/about-us/AboutUsPage";
import LoginSignupPage from "./pages/Login.jsx";
import DashBoard from "./pages/Dashboard.jsx";
import Booking from "./pages/BookingFlow.jsx";
import BookingPage from "./components/BookingFlight/BookingPage.jsx";
import PaymentPage from "./components/BookingFlight/PaymentPage.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BookSuccess from "./components/BookingFlight/BookingSuccess.jsx";
import SeatMapChange from "./components/SeatMapChangeSeat/SeatMapChange.jsx";
import FlightSeatDetail from "./components/DashBoardStaff/FlightSeatDetail.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/flights" element={<FlightPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/loginsignup" element={<LoginSignupPage />} />
      <Route path="/user" element={<DashBoard />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/user/booking-details" element={<BookingPage />} />
      <Route path="/user/booking-success" element={<BookSuccess />} />
      <Route path="/user/payment" element={<PaymentPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/seat-change" element={<SeatMapChange />} />
      <Route
        path="/staff/flight-seats/:flightNumber"
        element={<FlightSeatDetail />}
      />
    </Routes>
  );
}
