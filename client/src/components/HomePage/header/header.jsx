import React from "react";
import airPlane from "./assets/Image/airplane-plane-flight.svg";
import { useNavigate } from "react-route-dom";
function Header() {
  const navigate = useNavigate();
  return (
    <header>
      <div class="left">
        <img src={airPlane} className="logo" alt="AirPlane Logo"></img>
        <h3>FlightHK</h3>
      </div>
      <div class="middle">
        <ul className="listFunc">
          <li id="homepage">Trang chủ</li>
          <li id="plane">Máy bay</li>
          <li id="introduction">Giới thiệu</li>
        </ul>
      </div>
      <div class="right">
        <div class="search-bar"></div>
        <ul>
          <li id="sign-in">
            <button id="sign-in-button" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          </li>
          <li id="sign-up">
            <button id="sign-up-button" onClick={() => navigate("register")}>
              Đăng ký
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
