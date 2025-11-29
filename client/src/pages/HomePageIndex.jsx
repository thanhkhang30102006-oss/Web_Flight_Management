import React, { useState } from "react";
import "./Homepage.css"; // Import the CSS file
import { useTranslation } from "react-i18next";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";
import videoWallpaper from "../assets/videos/background-wallpaper.webm"; // Import your video
import { t } from "i18next";

function SimpleInfo() {
  const { t } = useTranslation();
  return (
    <div className="simple-info">
      <h1 className="simple-info-title">{t("hero.title")}</h1>
      <p className="simple-info-text">{t("hero.desc")}</p>
    </div>
  );
}

function FastChecking({ setIsFlying }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    departure: "",
    arrive: "",
    departureDay: "",
    typeNumber: 1,
  });
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearch, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setFlights([]);
    // Bật hiệu ứng máy bay
    setIsFlying?.(true);

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      setFlights(data);
      console.log("Kết quả tìm kiếm:", data);

      // Ở đây bạn có thể redirect hoặc lưu kết quả vào context/store
      // ví dụ: navigate(`/flights?data=${encodeURIComponent(JSON.stringify(data))}`)
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setTimeout(() => setIsFlying?.(false), 3000);
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="fast-checking-container">
        <div className="type">
          <ul className="flight-type-list">
            <li className="flight-type-item active">
              {t("fastChecking.oneWay")}
            </li>
          </ul>
        </div>

        <form className="flight-form" onSubmit={handleSubmit}>
          <div className="form-box">
            <label className="form-label">{t("fastChecking.from")}</label>
            <input
              type="text"
              name="departure"
              placeholder={t("fastChecking.fromdesc")}
              className="form-input"
              required
              value={formData.departure}
              onChange={handleChange}
            />
          </div>
          <div className="form-box">
            <label className="form-label">{t("fastChecking.to")}</label>
            <input
              type="text"
              name="arrive"
              placeholder={t("fastChecking.todesc")}
              className="form-input"
              required
              value={formData.arrive}
              onChange={handleChange}
            />
          </div>
          <div className="form-box">
            <label className="form-label">{t("fastChecking.depart")}</label>
            <input
              type="date"
              name="departureDay"
              className="form-input"
              required
              value={formData.departureDay}
              onChange={handleChange}
            />
          </div>
          <div className="form-box">
            <label className="form-label">{t("fastChecking.passengers")}</label>
            <select
              name="typeNumber"
              className="form-select"
              value={formData.typeNumber}
              onChange={handleChange}
            >
              {t("fastChecking.passengerOptions", { returnObjects: true }).map(
                (option, i) => (
                  <option key={i} value={i + 1}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          <button type="submit" className="form-button">
            {t("fastChecking.search")}
          </button>
        </form>
      </div>
      <div className="flight-container">
        {isLoading && <p>Đang tìm kiếm chuyến bay...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {flights.length > 0 ? (
          <div className="flight-box">
            {flights.map((flight) => {
              return (
                <div key={flight.flightNumber} className="flight-card">
                  <div className="flight-header">{flight.flightNumber}</div>
                  <div className="flight-body">
                    <div className="flight-info">
                      <div className="plane-type">{flight.planeType}</div>
                      <div className="departure-point">
                        {flight.departurePoint}
                      </div>
                      <div className="arrive-point">{flight.arrivePoint}</div>
                      <div className="total-seat">{flight.flightTotalSeat}</div>
                      <div className="flight-state">{flight.flightState}</div>
                    </div>
                    <div className="time">
                      <p>Ngày: {flight.departureDay}</p>
                      <p>Giờ: {flight.departureTime}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          hasSearch &&
          !isLoading &&
          flights.length === 0 && <p>Chưa có kết quả nào.</p>
        )}
      </div>
    </>
  );
}

function TopRating() {
  const destinations = [
    {
      name: "Paris",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    },
    {
      name: "Tokyo",
      img: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800",
    },
    {
      name: "New York",
      img: "https://plus.unsplash.com/premium_photo-1714051660720-888e8454a021?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Dubai",
      img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    },
    {
      name: "Bali",
      img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800",
    },
    {
      name: "London",
      img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Sydney",
      img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
    },
    {
      name: "Maldives",
      img: "https://images.unsplash.com/photo-1576158831003-d41033ec31fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Santorini",
      img: "https://plus.unsplash.com/premium_photo-1661964149725-fbf14eabd38c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Ha Noi",
      img: "https://plus.unsplash.com/premium_photo-1691960159290-6f4ace6e6c4c?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Da Lat",
      img: "https://images.unsplash.com/photo-1609424360486-c5b2636741d1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Phu Quoc",
      img: "https://images.unsplash.com/photo-1746292448726-9e75b5f1067d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Bangkok",
      img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
    },
    {
      name: "Seoul",
      img: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800",
    },
    {
      name: "Singapore",
      img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
    },
    {
      name: "Agra",
      img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="top-rating">
      <h2>{t("topRating")}</h2>
      <div className="destinations-grid">
        {destinations.map((dest, i) => (
          <div key={i} className="destination-card">
            <img src={dest.img} alt={dest.name} />
            <p>{dest.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutUs() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: t("about.security"),
      desc: t("about.securityDesc"),
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: t("about.fast"),
      desc: t("about.fastDesc"),
    },
    {
      icon: <CreditCard className="w-10 h-10" />,
      title: t("about.payment"),
      desc: t("about.paymentDesc"),
    },
    {
      icon: <Headphones className="w-10 h-10" />,
      title: t("about.support"),
      desc: t("about.supportDesc"),
    },
  ];

  return (
    <section className="about-us-new py-20">
      <div className="container mx-auto px-6 text-center">
        {/* Tiêu đề chính */}
        <h2 className="about-title">{t("about.title")}</h2>

        {/* Tiêu đề phụ */}
        <p className="about-subtitle">{t("about.subtitle")}</p>

        <div className="features-grid">
          {features.map((item, index) => (
            <div key={index} className="feature-card">
              <div className="icon-circle">{item.icon}</div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { SimpleInfo, FastChecking, TopRating, AboutUs };
