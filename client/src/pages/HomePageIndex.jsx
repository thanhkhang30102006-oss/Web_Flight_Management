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

const DESTINATION_DATA = {
  // --- Miền Bắc ---
  "Hà Nội": {
    desc: "Thủ đô ngàn năm văn hiến, nơi hòa quyện giữa nét cổ kính của 36 phố phường và sự năng động của đô thị hiện đại. Đừng quên thử Phở và Cà phê trứng.",
    tempRange: [22, 29],
    weather: "Có mây",
    region: "Bắc",
  },
  "Hải Phòng": {
    desc: "Thành phố Cảng sầm uất với ẩm thực đường phố trứ danh (bánh đa cua, nem cua bể). Cửa ngõ ra đảo Cát Bà thơ mộng.",
    tempRange: [24, 30],
    weather: "Nắng đẹp",
    region: "Bắc",
  },
  "Vân Đồn": {
    desc: "Huyện đảo xinh đẹp thuộc Quảng Ninh, nổi tiếng với Bãi Dài hoang sơ và hải sản tươi sống. Điểm kết nối trực tiếp tới Vịnh Hạ Long.",
    tempRange: [23, 28],
    weather: "Gió nhẹ",
    region: "Bắc",
  },
  "Thanh Hóa": {
    desc: "Vùng đất địa linh nhân kiệt, nổi tiếng với bãi biển Sầm Sơn sôi động và khu bảo tồn thiên nhiên Pù Luông xanh mát.",
    tempRange: [25, 31],
    weather: "Nắng rực rỡ",
    region: "Bắc",
  },
  Vinh: {
    desc: "Thành phố đỏ anh hùng, quê hương của Bác Hồ. Điểm đến du lịch biển Cửa Lò và khám phá những di tích lịch sử hào hùng.",
    tempRange: [26, 32],
    weather: "Nắng nóng",
    region: "Bắc",
  },
  "Điện Biên Phủ": {
    desc: "Mảnh đất lịch sử với chiến thắng lừng lẫy năm châu. Khám phá đồi A1, hầm Đờ Cát và sắc hoa ban trắng rợp trời Tây Bắc.",
    tempRange: [20, 26],
    weather: "Mát mẻ",
    region: "Bắc",
  },

  // --- Miền Trung ---
  "Đà Nẵng": {
    desc: "Thành phố đáng sống nhất Việt Nam với bãi biển Mỹ Khê, Cầu Rồng phun lửa và Bà Nà Hills đường lên tiên cảnh.",
    tempRange: [26, 32],
    weather: "Nắng đẹp",
    region: "Trung",
  },
  Huế: {
    desc: "Cố đô trầm mặc, mộng mơ bên dòng sông Hương. Nơi lưu giữ nét văn hóa cung đình, nhã nhạc và ẩm thực cay nồng tinh tế.",
    tempRange: [25, 30],
    weather: "Mưa phùn",
    region: "Trung",
  },
  "Nha Trang": {
    desc: "Hòn ngọc viễn đông với những vịnh biển đẹp nhất thế giới. Thiên đường của lặn biển, VinWonders và tắm bùn khoáng nóng.",
    tempRange: [28, 33],
    weather: "Nắng vàng",
    region: "Trung",
  },
  "Quy Nhơn": {
    desc: "Thành phố thi ca bình yên với Eo Gió, Kỳ Co được ví như Maldives phiên bản Việt. Hải sản ngon rẻ bậc nhất miền Trung.",
    tempRange: [27, 32],
    weather: "Gió biển",
    region: "Trung",
  },
  "Quảng Nam": {
    desc: "Vùng đất di sản với Phố cổ Hội An lãng mạn đèn lồng và Thánh địa Mỹ Sơn huyền bí. Nơi giao thoa văn hóa đặc sắc.",
    tempRange: [26, 31],
    weather: "Nắng nhẹ",
    region: "Trung",
  },
  "Đồng Hới": {
    desc: "Vương quốc hang động với Phong Nha - Kẻ Bàng hùng vĩ. Trải nghiệm thám hiểm hang Sơn Đoòng lớn nhất thế giới.",
    tempRange: [24, 29],
    weather: "Mát mẻ",
    region: "Trung",
  },
  "Tuy Hòa": {
    desc: "Xứ sở hoa vàng trên cỏ xanh. Chiêm ngưỡng Gành Đá Đĩa độc đáo và ngọn hải đăng Đại Lãnh - nơi đón bình minh đầu tiên.",
    tempRange: [26, 31],
    weather: "Nắng gắt",
    region: "Trung",
  },

  // --- Tây Nguyên ---
  "Đà Lạt": {
    desc: "Thành phố ngàn hoa trong sương mù. Điểm hẹn hò lãng mạn với khí hậu se lạnh, những đồi thông và biệt thự Pháp cổ.",
    tempRange: [14, 22],
    weather: "Se lạnh",
    region: "Tây Nguyên",
  },
  "Buôn Ma Thuột": {
    desc: "Thủ phủ cà phê của Việt Nam. Cưỡi voi Bản Đôn, ngắm thác Dray Nur hùng vĩ và thưởng thức ly cà phê đậm đà.",
    tempRange: [22, 29],
    weather: "Nắng ráo",
    region: "Tây Nguyên",
  },
  Pleiku: {
    desc: "Đôi mắt Pleiku Biển Hồ đầy thơ mộng. Khám phá vẻ đẹp hoang sơ của đại ngàn và ẩm thực Phở khô Gia Lai độc đáo.",
    tempRange: [20, 27],
    weather: "Mát mẻ",
    region: "Tây Nguyên",
  },

  // --- Miền Nam ---
  "TP.HCM": {
    desc: "Hòn ngọc Viễn Đông sôi động, trung tâm kinh tế lớn nhất cả nước. Nơi hội tụ ẩm thực, mua sắm và giải trí thâu đêm suốt sáng.",
    tempRange: [30, 35],
    weather: "Nắng nóng",
    region: "Nam",
  },
  "Phú Quốc": {
    desc: "Thiên đường nghỉ dưỡng với những resort sang trọng, Bãi Sao cát trắng và cáp treo vượt biển dài nhất thế giới.",
    tempRange: [27, 31],
    weather: "Nắng đẹp",
    region: "Nam",
  },
  "Cần Thơ": {
    desc: "Thủ phủ miền Tây sông nước. Trải nghiệm chợ nổi Cái Răng tấp nập vào sáng sớm và vườn trái cây trĩu quả.",
    tempRange: [26, 32],
    weather: "Nắng ấm",
    region: "Nam",
  },
  "Côn Đảo": {
    desc: "Điểm du lịch tâm linh và nghỉ dưỡng hoang sơ. Khám phá lịch sử hào hùng và lặn ngắm san hô tại vùng biển trong vắt.",
    tempRange: [26, 30],
    weather: "Gió mạnh",
    region: "Nam",
  },
  "Rạch Giá": {
    desc: "Thành phố biển miền Tây yên bình, cửa ngõ ra đảo Nam Du và Phú Quốc. Thưởng thức bún cá Kiên Giang nức tiếng.",
    tempRange: [27, 32],
    weather: "Nắng nhẹ",
    region: "Nam",
  },
  "Cà Mau": {
    desc: "Cực Nam của Tổ quốc. Chinh phục cột mốc tọa độ quốc gia, len lỏi qua những rừng đước bạt ngàn và thưởng thức cua Cà Mau.",
    tempRange: [26, 31],
    weather: "Mưa rào",
    region: "Nam",
  },
};

const getWeatherIcon = (type) => {
  if (type.includes("Nắng"))
    return <Sun size={20} className="text-yellow-500" />;
  if (type.includes("mưa"))
    return <CloudRain size={20} className="text-blue-500" />;
  return <CloudSun size={20} className="text-blue-400" />;
};

const DestinationPopup = ({ destination, onClose }) => {
  if (!destination) return null;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    destination.name + " Vietnam"
  )}&t=&z=11&ie=UTF8&iwloc=&output=embed`;

  const detail = useMemo(() => {
    // 1. Tìm trong DB có sẵn không
    const staticData = DESTINATION_DATA[destination.name];

    // 2. Random Rating (từ 4.5 đến 5.0)
    const randomRating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);

    // 3. Xử lý dữ liệu (Nếu không có trong DB thì random generic)
    if (staticData) {
      // Random nhiệt độ trong khoảng cho phép của thành phố đó
      const currentTemp = Math.floor(
        Math.random() *
          (staticData.tempRange[1] - staticData.tempRange[0] + 1) +
          staticData.tempRange[0]
      );

      return {
        ...staticData,
        rating: randomRating,
        temp: currentTemp,
      };
    }
    return {
      desc: `Khám phá vẻ đẹp tiềm ẩn của ${destination.name}. Một điểm đến mới lạ đang chờ bạn trải nghiệm.`,
      weather: "Nhiều mây",
      temp: Math.floor(Math.random() * (32 - 25) + 25), // Random 25-32 độ
      region: "Việt Nam",
      rating: randomRating,
    };
  }, [destination]);
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
              <h2>{destination.name}</h2>
              <div className="rating-badge">
                <Star size={16} fill="#FFD700" stroke="#FFD700" />
                <span>{detail.rating}/5</span>
              </div>
            </div>

            <p className="modal-desc">{detail.desc}</p>

            <div className="modal-details">
              <div className="detail-item">
                {getWeatherIcon(detail.weather)}
                <div>
                  <strong>Thời tiết</strong>
                  <p>
                    {detail.temp}°C - {detail.weather}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <MapPin size={20} className="text-red-500" />
                <div>
                  <strong>Vị trí</strong>
                  <p>Miền {detail.region}</p>
                </div>
              </div>
            </div>

            <button className="btn-book-now">
              Đặt vé đi {destination.name}
            </button>
          </div>

          {/* Cột phải: Bản đồ (Giả lập Vector Map) */}
          <div className="modal-map">
            {/* Overlay giả lập hiệu ứng tô màu vùng (Visual trick) */}
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
            <div className="map-label">Bản đồ khu vực</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
const getRegion = (name) => {
  const north = [
    "Hà Nội",
    "Hải Phòng",
    "Vân Đồn",
    "Thanh Hóa",
    "Vinh",
    "Điện Biên Phủ",
  ];
  const central = [
    "Đà Nẵng",
    "Huế",
    "Nha Trang",
    "Quy Nhơn",
    "Quảng Nam",
    "Đồng Hới",
    "Tuy Hòa",
  ];
  if (north.includes(name)) return "Bắc";
  if (central.includes(name)) return "Trung";
  return "Nam";
};

function TopRating() {
  const [selectedDest, setSelectedDest] = useState(null);
  const destinations = [
    {
      name: "Hà Nội",
      img: "https://plus.unsplash.com/premium_photo-1691960159290-6f4ace6e6c4c?q=80&w=1171&auto=format&fit=crop",
    },
    {
      name: "Hải Phòng",
      img: "https://xdcs.cdnchinhphu.vn/446259493575335936/2023/3/31/dia-diem-chup-anh-dep-o-hai-phong-3-16802347951501757542860.jpg",
    },
    {
      name: "Vân Đồn",
      img: "https://cdn.tgdd.vn/Files/2021/07/15/1368384/tong-hop-day-du-kinh-nghiem-du-lich-van-don-quang-ninh-202206070951246909.jpg",
    },
    {
      name: "Thanh Hóa",
      img: "https://cdn.nhandan.vn/images/4655dea7deebadd3e7b51fbe3a4f19d5debfb428da2d7886ce9028169019d82bd1a7ea749d6c13f68a7e671e4e0b4d35/thanhhoa.jpg",
    },
    {
      name: "Vinh",
      img: "https://statics.vinwonders.com/Vinh-City-01_1704067275.jpg",
    },
    {
      name: "Điện Biên Phủ",
      img: "https://dulichdienbien.vietnaminfo.net/DataFiles/2022/07/Files/20220718-094447-2Bh47TQT.jpg",
    },

    // --- Miền Trung (7 địa điểm) ---
    {
      name: "Đà Nẵng",
      img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA",
    },
    {
      name: "Huế",
      img: "https://media.vietravel.com/images/Content/dia-diem-du-lich-hue-01.jpg",
    },
    {
      name: "Nha Trang",
      img: "https://vpt-en.b-cdn.net/wp-content/uploads/n/16/Nha-trang.jpg.webp",
    },
    {
      name: "Quy Nhơn",
      img: "https://static-images.vnncdn.net/files/publish/2022/7/22/280762356-359581132902753-2117815975823559575-n-1225.jpg",
    },
    {
      name: "Quảng Nam",
      img: "https://blisshoian.com/wp-content/uploads/2024/12/quang-nam-province-10.webp",
    },
    {
      name: "Đồng Hới",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Cổng_thành_cổ_Quảng_Bình_-_panoramio.jpg",
    },
    {
      name: "Tuy Hòa",
      img: "https://static.vinwonders.com/production/Nghinh-Phong-Square.jpg",
    },

    // --- Tây Nguyên (3 địa điểm) ---
    {
      name: "Đà Lạt",
      img: "https://hitour.vn/storage/images/upload/tour-du-lich-da-lat-2-ngay-1-dem-750.webp",
    },
    {
      name: "Buôn Ma Thuột",
      img: "https://longvanlimousine.vn/wp-content/uploads/2024/12/du-lich-buon-ma-thuot.jpg",
    },
    {
      name: "Pleiku",
      img: "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1572039106-1648118522379.png",
    },
    // --- Miền Nam (6 địa điểm) ---
    {
      name: "TP.HCM",
      img: "https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/30/tphcm-1-1751245519173693919081.jpg",
    },
    {
      name: "Phú Quốc",
      img: "https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/23/phu-quoc-17506756503251936667562.jpg",
    },
    {
      name: "Cần Thơ",
      img: "https://ik.imagekit.io/tvlk/blog/2025/05/canh-dep-can-tho-1-1024x683.png?tr=q-70,c-at_max,w-1000,h-600",
    },
    {
      name: "Côn Đảo",
      img: "https://cdn11.dienmaycholon.vn/filewebdmclnew/DMCL21/Picture/News/News_expe_14013/14013.png?version=130237",
    },
    {
      name: "Rạch Giá",
      img: "https://saigonrachgiahotel.vn/files/images/news/news00002.png",
    },
    {
      name: "Cà Mau",
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
              <p>{dest.name}</p>
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
