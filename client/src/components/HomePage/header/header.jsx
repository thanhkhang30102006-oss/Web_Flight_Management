import React from "react";
import airPlane from "../../../assets/Image/airplane-plane-flight.svg";
import { useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();
  return (
    <header>
      <div className="left">
        <img src={airPlane} className="logo" alt="AirPlane Logo"></img>
        <h3>FlightHK</h3>
      </div>
      <div className="middle">
        <ul className="listFunc">
          <li id="homepage">Trang chủ</li>
          <li id="plane">Máy bay</li>
          <li id="introduction">Giới thiệu</li>
        </ul>
      </div>
      <div className="right">
        <div className="search-bar"></div>
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
