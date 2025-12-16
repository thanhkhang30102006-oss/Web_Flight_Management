import React, { useState } from "react";
import Header from "../components/HomePage/header/header.jsx";
import videoWallpaper from "../assets/videos/background-wallpaper.webm";
import airplaneIcon from "../assets/Image/airplane-plane-flight-white_fly.svg";
import {
  SimpleInfo,
  FastChecking,
  TopRating,
  AboutUs,
} from "./HomePageIndex.jsx";
import "./Homepage.css";
import Footer from "../components/HomePage/footer/footer.jsx";

const travelSlides = [
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1400",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400",
  "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1400",
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1400",
];

export default function HomePage() {
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [isFlying, setIsFlying] = useState(false);

  // Auto slide
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % travelSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goPrev = () =>
    setSlideIndex((i) => (i - 1 + travelSlides.length) % travelSlides.length);
  const goNext = () => setSlideIndex((i) => (i + 1) % travelSlides.length);

  // Effect Flight
  const handleSearch = (e) => {
    e.preventDefault();
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 3000);
  };

  return (
    <>
      {/* Video Background */}
      <video className="background-video" autoPlay muted loop playsInline>
        <source src={videoWallpaper} type="video/webm" />
      </video>

      {/* Overlay tối nhẹ để chữ dễ đọc */}
      <div className="homepage-video-overlay"></div>
      {/* Header cố định */}
      <Header />

      {/* Nội dung chính - Scroll snap từng phần */}
      <main className="main-snap-container">
        {/* Section 1: Hero + Slider ảnh du lịch */}
        <section className="snap-section hero">
          <SimpleInfo />

          {/* Slider ảnh du lịch đẹp phía sau */}
          <div className="travel-slider">
            {travelSlides.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Du lịch ${index + 1}`}
                className={`travel-slide ${
                  index === slideIndex ? "active" : ""
                }`}
              />
            ))}
            <button
              className="slider-arrow left"
              onClick={goPrev}
              aria-label="Previous slide"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 12H4M4 12L10 18M4 12L10 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="slider-arrow right"
              onClick={goNext}
              aria-label="Next slide"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12H20M20 12L14 6M20 12L14 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* Các section còn lại */}
        <section className="snap-section">
          <FastChecking setIsFlying={setIsFlying} />{" "}
          {isFlying && (
            <img src={airplaneIcon} alt="flying" className="flying-plane" />
          )}
        </section>
        <section className="snap-section">
          <TopRating />
        </section>
        <section className="snap-section">
          <AboutUs />
        </section>
        <section className="snap-section">
          <Footer />
        </section>
      </main>
    </>
  );
}
