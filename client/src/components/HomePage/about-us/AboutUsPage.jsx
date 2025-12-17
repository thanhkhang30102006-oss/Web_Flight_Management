// src/pages/AboutUsPage.jsx (hoặc đường dẫn tương ứng của bạn)
import React from "react";
import Header from "../header/header.jsx";
import Footer from "../footer/footer.jsx";
import "./AboutUsPage.css";
import { Code, Server, Heart, Coffee, MapPin, X } from "lucide-react";
import videoWallpaper from "../../../assets/videos/background-video-about-us.webm";
import ThanhKhang from "../../../assets/Image/ThanhKhangDepTrai.png";
import TrungHieu from "../../../assets/Image/TrungHieuCute.png";
import Team from "../../../assets/Image/Team.jpg";
import VKU from "../../../assets/Image/VKU.png";

// --- DỮ LIỆU ---
const TIMELINE_DATA = [
  {
    date: "10/2025",
    title: "Khởi động dự án",
    desc: "Lên ý tưởng và phân tích yêu cầu hệ thống.",
    color: "#3b82f6",
  },
  {
    date: "11/2025",
    title: "Database & API",
    desc: "Thiết kế CSDL và xây dựng các API cốt lõi (Backend).",
    color: "#10b981",
  },
  {
    date: "12/2025",
    title: "UI/UX Design",
    desc: "Thiết kế giao diện người dùng và trải nghiệm (Frontend).",
    color: "#f59e0b",
  },
  {
    date: "01/2026",
    title: "Tích hợp & Test",
    desc: "Ghép nối hệ thống, kiểm thử và sửa lỗi.",
    color: "#ef4444",
  },
  {
    date: "Current",
    title: "Triển khai",
    desc: "Hoàn thiện và báo cáo đồ án.",
    color: "#8b5cf6",
  },
];

export default function AboutUsPage() {
  return (
    <>
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
      </video>
      <div className="about-us-video-overlay"></div>{" "}
      {/* Dùng lại lớp overlay cũ cho đồng bộ */}
      <Header />
      <main className="about-snap-container">
        {/* --- SECTION 1: THE TEAM --- */}
        <section className="about-section team-section">
          <div className="team-container">
            {/* CỘT TRÁI: HÀ ĐIỀN TRUNG HIẾU */}
            <div className="team-member">
              <div className="giant-name trunghieu">
                <span>TRUNG</span>
                <span>HIEU</span>
              </div>
              {/* Thay ảnh thật của bạn (ảnh tách nền PNG là đẹp nhất) */}
              <img src={TrungHieu} alt="Trung Hiếu" className="member-photo" />
              <div className="member-info">
                <span className="member-role">FRONTEND DEVELOPER</span>
                <h2 className="member-fullname">Hà Điền Trung Hiếu</h2>
                <p className="member-hobbies">
                  <Code size={16} style={{ marginRight: 5 }} /> ReactJS, UI/UX
                  Design
                  <br />
                  <Coffee size={16} style={{ marginRight: 5 }} /> Cà phê & Âm
                  nhạc
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: PHAN THANH KHANG */}
            <div className="team-member">
              <div className="giant-name thanhkhang">
                <span>THANH</span>
                <span>KHANG</span>
              </div>{" "}
              {/* Thay ảnh thật của bạn (ảnh tách nền PNG là đẹp nhất) */}
              <img
                src={ThanhKhang}
                alt="Thanh Khang"
                className="member-photo"
              />
              <div className="member-info">
                <span className="member-role">BACKEND DEVELOPER</span>
                <h2 className="member-fullname">Phan Thanh Khang</h2>
                <p className="member-hobbies">
                  <Server size={16} style={{ marginRight: 5 }} /> NodeJS,
                  Database
                  <br />
                  <Heart size={16} style={{ marginRight: 5 }} /> Game & Thể thao
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: JOURNEY --- */}
        <section className="about-section journey-section">
          <h2 className="section-title">Hành Trình Của Chúng Tôi</h2>
          <div className="timeline-wrapper">
            <div className="timeline-inner">
              <div className="timeline-line"></div>
              <div className="timeline-arrow"></div>

              {TIMELINE_DATA.map((item, index) => (
                <div
                  key={index}
                  className="timeline-point"
                  style={{
                    borderColor: item.color,
                    backgroundColor: item.color,
                  }}
                >
                  <div className="point-tooltip">
                    <span className="point-date" style={{ color: item.color }}>
                      {item.date}
                    </span>
                    <strong
                      style={{
                        fontSize: "1.2rem",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      {item.title}
                    </strong>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "#555",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 3: SUPPORT & VKU --- */}
        <section className="about-section support-wrapper">
          <h2 className="section-title" style={{ marginBottom: 50 }}>
            Sự Hỗ Trợ Đặc Biệt
          </h2>
          <div className="support-container">
            {/* ẢNH BẠN BÈ */}
            <div className="support-card">
              <img src={Team} alt="Team" className="support-img" />
              <div className="support-overlay">
                <h3 className="support-title">Bạn Bè & Đồng Đội</h3>{" "}
                <p className="support-desc">
                  Cảm ơn những người bạn đã luôn đồng hành, góp ý và hỗ trợ
                  chúng tôi hoàn thiện sản phẩm này.
                </p>
              </div>
            </div>
            {/* DẤU X Ở GIỮA */}
            <div className="support-separator">
              <X size={600} />
            </div>
            {/* ẢNH VKU */}
            <div className="support-card">
              <img src={VKU} alt="VKU" className="support-img" />
              <div className="support-overlay">
                <h3 className="support-title">VKU</h3>
                <p className="support-desc">
                  <MapPin size={18} /> Vietnam-Korea University
                  <br />
                  Nơi ươm mầm tri thức và đam mê công nghệ của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: FOOTER (Snap cuối cùng) --- */}

        <section
          className="about-section"
          style={{ height: "auto", padding: 0, minHeight: "auto" }}
        >
          <Footer />
        </section>
      </main>
    </>
  );
}
