import React, { useState, useMemo } from "react";
import "./Homepage.css"; // Import the CSS file
import { useTranslation } from "react-i18next";
import {
  Shield,
  Clock,
  CreditCard,
  Headphones,
  MapPin,
  X,
  Star,
  CloudSun,
  Sun,
  Wind,
  CloudRain,
} from "lucide-react";
import videoWallpaper from "../assets/videos/background-wallpaper.webm"; // Import your video
import { t } from "i18next";
import { AnimatePresence, motion } from "framer-motion";

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
          flights.length === 0 && (
            <p className="no-results">Chưa có kết quả nào.</p>
          )
        )}
      </div>
    </>
  );
}

const DESTINATION_CONFIG = {
  hanoi: { temp: [22, 29], type: "cloudy", region: "north" },
  haiphong: { temp: [24, 30], type: "sunny", region: "north" },
  vandon: { temp: [23, 28], type: "windy", region: "north" },
  thanhhoa: { temp: [25, 31], type: "hot", region: "north" },
  vinh: { temp: [26, 32], type: "hot", region: "north" },
  dienbien: { temp: [20, 26], type: "cool", region: "north" },
  danang: { temp: [26, 32], type: "sunny", region: "central" },
  hue: { temp: [25, 30], type: "rainy", region: "central" },
  nhatrang: { temp: [28, 33], type: "sunny", region: "central" },
  quynhon: { temp: [27, 32], type: "windy", region: "central" },
  quangnam: { temp: [26, 31], type: "sunny", region: "central" },
  donghoi: { temp: [24, 29], type: "cool", region: "central" },
  tuyhoa: { temp: [26, 31], type: "hot", region: "central" },
  dalat: { temp: [14, 22], type: "foggy", region: "highlands" },
  buonmathuot: { temp: [22, 29], type: "sunny", region: "highlands" },
  pleiku: { temp: [20, 27], type: "cool", region: "highlands" },
  hcm: { temp: [30, 35], type: "hot", region: "south" },
  phuquoc: { temp: [27, 31], type: "sunny", region: "south" },
  cantho: { temp: [26, 32], type: "sunny", region: "south" },
  condao: { temp: [26, 30], type: "windy", region: "south" },
  rachgia: { temp: [27, 32], type: "sunny", region: "south" },
  camau: { temp: [26, 31], type: "rainy", region: "south" },
};

const getWeatherIcon = (type) => {
  switch (type) {
    case "sunny":
    case "hot":
      return <Sun size={20} className="text-yellow-500" />;
    case "rainy":
      return <CloudRain size={20} className="text-blue-500" />;
    case "windy":
      return <Wind size={20} className="text-gray-500" />;
    case "cool":
    case "foggy":
      return <CloudSun size={20} className="text-blue-400" />;
    default:
      return <CloudSun size={20} className="text-orange-400" />;
  }
};

const DestinationPopup = ({ destination, onClose }) => {
  if (!destination) return null;
  const destName = t(`home.destinations.${destination.id}.name`);
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    destName + " Vietnam"
  )}&t=&z=11&ie=UTF8&iwloc=&output=embed`;

  const detail = useMemo(() => {
    // 1. Tìm trong DB có sẵn không
    const config = DESTINATION_CONFIG[destination.id];

    // 2. Random Rating (từ 4.5 đến 5.0)
    const randomRating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);

    // 3. Xử lý dữ liệu (Nếu không có trong DB thì random generic)
    if (config) {
      const currentTemp = Math.floor(
        Math.random() * (config.temp[1] - config.temp[0] + 1) + config.temp[0]
      );

      return {
        // Lấy text từ file translation
        desc: t(`home.destinations.${destination.id}.desc`),
        weatherText: t(`home.popup.weatherStatus.${config.type}`),
        regionText: t(`home.popup.regions.${config.region}`),

        rating: randomRating,
        temp: currentTemp,
        type: config.type,
      };
    }
    return {
      desc: "...",
      weatherText: "...",
      regionText: "...",
      temp: 30,
      rating: randomRating,
      type: "sunny",
    };
  }, [destination, t]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()} // Ngăn click xuyên qua đóng modal
      >
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-layout">
          {/* Cột trái: Thông tin */}
          <div className="modal-info">
            <div className="modal-header">
              <h2>{destName}</h2>
              <div className="rating-badge">
                <Star size={16} fill="#FFD700" stroke="#FFD700" />
                <span>{detail.rating}/5</span>
              </div>
            </div>

            <p className="modal-desc">{detail.desc}</p>

            <div className="modal-details">
              <div className="detail-item">
                {getWeatherIcon(detail.type)}
                <div>
                  <strong>{t("home.popup.weather")}</strong>
                  <p>
                    {detail.temp}°C - {detail.weatherText}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <MapPin size={20} className="text-red-500" />
                <div>
                  <strong>{t("home.popup.location")}</strong>
                  <p>{t("home.popup.region", { region: detail.regionText })}</p>
                </div>
              </div>
            </div>

            <button className="btn-book-now">
              {t("home.popup.bookBtn", { name: destName })}{" "}
            </button>
          </div>

          {/* Cột phải: Bản đồ (Giả lập Vector Map) */}
          <div className="modal-map">
            <div className="map-vector-overlay"></div>
            <iframe
              title="map"
              src={mapUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, filter: "contrast(1.1) saturate(1.2)" }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <div className="map-label">{t("home.popup.mapLabel")}</div>{" "}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function TopRating() {
  const [selectedDest, setSelectedDest] = useState(null);
  const destinations = [
    {
      id: "hanoi",
      img: "https://plus.unsplash.com/premium_photo-1691960159290-6f4ace6e6c4c?q=80&w=1171&auto=format&fit=crop",
    },
    {
      id: "haiphong",
      img: "https://xdcs.cdnchinhphu.vn/446259493575335936/2023/3/31/dia-diem-chup-anh-dep-o-hai-phong-3-16802347951501757542860.jpg",
    },
    {
      id: "vandon",
      img: "https://cdn.tgdd.vn/Files/2021/07/15/1368384/tong-hop-day-du-kinh-nghiem-du-lich-van-don-quang-ninh-202206070951246909.jpg",
    },
    {
      id: "thanhhoa",
      img: "https://cdn.nhandan.vn/images/4655dea7deebadd3e7b51fbe3a4f19d5debfb428da2d7886ce9028169019d82bd1a7ea749d6c13f68a7e671e4e0b4d35/thanhhoa.jpg",
    },
    {
      id: "vinh",
      img: "https://statics.vinwonders.com/Vinh-City-01_1704067275.jpg",
    },
    {
      id: "dienbien",
      img: "https://dulichdienbien.vietnaminfo.net/DataFiles/2022/07/Files/20220718-094447-2Bh47TQT.jpg",
    },
    {
      id: "danang",
      img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA",
    },
    {
      id: "hue",
      img: "https://media.vietravel.com/images/Content/dia-diem-du-lich-hue-01.jpg",
    },
    {
      id: "nhatrang",
      img: "https://vpt-en.b-cdn.net/wp-content/uploads/n/16/Nha-trang.jpg.webp",
    },
    {
      id: "quynhon",
      img: "https://static-images.vnncdn.net/files/publish/2022/7/22/280762356-359581132902753-2117815975823559575-n-1225.jpg",
    },
    {
      id: "quangnam",
      img: "https://blisshoian.com/wp-content/uploads/2024/12/quang-nam-province-10.webp",
    },
    {
      id: "donghoi",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Cổng_thành_cổ_Quảng_Bình_-_panoramio.jpg",
    },
    {
      id: "tuyhoa",
      img: "https://static.vinwonders.com/production/Nghinh-Phong-Square.jpg",
    },
    {
      id: "dalat",
      img: "https://hitour.vn/storage/images/upload/tour-du-lich-da-lat-2-ngay-1-dem-750.webp",
    },
    {
      id: "buonmathuot",
      img: "https://longvanlimousine.vn/wp-content/uploads/2024/12/du-lich-buon-ma-thuot.jpg",
    },
    {
      id: "pleiku",
      img: "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1572039106-1648118522379.png",
    },
    {
      id: "hcm",
      img: "https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/30/tphcm-1-1751245519173693919081.jpg",
    },
    {
      id: "phuquoc",
      img: "https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/23/phu-quoc-17506756503251936667562.jpg",
    },
    {
      id: "cantho",
      img: "https://ik.imagekit.io/tvlk/blog/2025/05/canh-dep-can-tho-1-1024x683.png?tr=q-70,c-at_max,w-1000,h-600",
    },
    {
      id: "condao",
      img: "https://cdn11.dienmaycholon.vn/filewebdmclnew/DMCL21/Picture/News/News_expe_14013/14013.png?version=130237",
    },
    {
      id: "rachgia",
      img: "https://saigonrachgiahotel.vn/files/images/news/news00002.png",
    },
    {
      id: "camau",
      img: "https://vietnamtouristvn.com/thumbs/670x500x1/upload/product/cantho2-7480.jpg",
    },
  ];

  return (
    <>
      <div className="top-rating">
        <h2>{t("topRating")}</h2>
        <div className="destinations-grid">
          {destinations.map((dest, i) => (
            <div
              key={i}
              className="destination-card"
              onClick={() => setSelectedDest(dest)} // Bắt sự kiện click
              style={{ cursor: "pointer" }}
            >
              <img src={dest.img} alt={dest.name} />
              <p>{t(`home.destinations.${dest.id}.name`)}</p>{" "}
            </div>
          ))}
        </div>
      </div>
      {/* Hiển thị Popup khi có địa điểm được chọn */}
      <AnimatePresence>
        {selectedDest && (
          <DestinationPopup
            destination={selectedDest}
            onClose={() => setSelectedDest(null)}
          />
        )}
      </AnimatePresence>
    </>
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
