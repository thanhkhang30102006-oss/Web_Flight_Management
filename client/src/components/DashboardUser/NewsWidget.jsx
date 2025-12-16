import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  ArrowRight,
  CloudSun,
  Plane,
  Globe,
  Loader2,
} from "lucide-react";
import axios from "axios";
import "./NewsWidget.css";

const NewsWidget = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const API_KEY = "b4659bb287a9401da544cc0bd862cad8";
  // Topic airline, weather, ...
  const topics =
    '(aviation OR airline OR "vietnam airlines" OR vietjet OR bamboo OR airport OR flight OR storm OR typhoon OR weather)';
  // Location VietNam, Sea.
  const locations =
    '(Vietnam OR "Ho Chi Minh" OR "Ha Noi" OR "Da Nang" OR "South East Asia" OR ASEAN OR Singapore OR Thailand OR Bangkok OR Indonesia OR Malaysia)';
  const API_URL = `https://newsapi.org/v2/everything?q=${topics} AND ${locations}&language=vi&sortBy=publishedAt&pageSize=4&apiKey=${API_KEY}`;
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);

        // Map dữ liệu từ API sang cấu trúc của giao diện bạn đã có
        const formattedNews = response.data.articles.map((article, index) => ({
          id: index,
          // Tự động gán category dựa trên tiêu đề (Logic đơn giản)
          category:
            article.title.toLowerCase().includes("storm") ||
            article.title.toLowerCase().includes("weather")
              ? "Weather"
              : "Aviation",
          title: article.title,
          date: new Date(article.publishedAt).toLocaleDateString("vi-VN"),
          // Nếu không có ảnh thì dùng ảnh placeholder
          image:
            article.urlToImage ||
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600",
          summary: article.description || "Bấm để xem chi tiết tin tức này...",
          content: article.content || article.description,
          url: article.url, // Link gốc bài báo
        }));

        setNewsData(formattedNews);
      } catch (err) {
        console.error("Lỗi lấy tin tức:", err);
        // Nếu lỗi (hết lượt free, lỗi mạng), fallback về dữ liệu giả để giao diện không trống
        setError(true);
        setNewsData(MOCK_FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Helper chọn icon theo category
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Weather":
        return <CloudSun size={14} />;
      case "Aviation":
        return <Plane size={14} />;
      default:
        return <Globe size={14} />;
    }
  };

  if (loading) {
    return (
      <div
        className="news-widget-container"
        style={{
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  return (
    <div className="news-widget-container">
      <h3 className="section-header">
        Tin tức & Cập nhật{" "}
        {error && (
          <span style={{ fontSize: "12px", color: "orange" }}>
            (Chế độ Offline)
          </span>
        )}
      </h3>
      <div className="news-grid">
        {newsData.map((item) => (
          <motion.div
            key={item.id}
            className="news-card glass-panel"
            whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            onClick={() => setSelectedNews(item)}
          >
            <div className="card-image">
              <img src={item.image} alt={item.title} />
              <span className={`category-badge ${item.category.toLowerCase()}`}>
                {getCategoryIcon(item.category)} {item.category}
              </span>
            </div>
            <div className="card-content">
              <div className="card-date">
                <Calendar size={12} /> {item.date}
              </div>
              <h4 className="card-title">{item.title}</h4>
              <p className="card-summary">{item.summary}</p>
              <div className="read-more">
                Xem chi tiết <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- POPUP MODAL --- */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            className="news-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              className="news-modal glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua modal
            >
              <button
                className="close-btn"
                onClick={() => setSelectedNews(null)}
              >
                <X size={24} />
              </button>

              <div className="modal-header-image">
                <img src={selectedNews.image} alt={selectedNews.title} />
                <div className="modal-overlay-gradient"></div>
                <div className="modal-title-block">
                  <span
                    className={`category-badge large ${selectedNews.category.toLowerCase()}`}
                  >
                    {selectedNews.category}
                  </span>
                  <h2>{selectedNews.title}</h2>
                  <div className="modal-meta">
                    <span>
                      <Calendar size={14} /> {selectedNews.date}
                    </span>
                    <span>•</span>
                    <span>Global News</span>
                  </div>
                </div>
              </div>

              <div className="modal-body custom-scrollbar">
                <p className="modal-intro">{selectedNews.summary}</p>
                <hr className="modal-divider" />
                <p className="modal-text">
                  {selectedNews.content
                    ? selectedNews.content.split("[+")[0]
                    : "Không có nội dung chi tiết."}
                </p>

                {/* Nút xem bài gốc vì API free thường cắt bớt nội dung */}
                {selectedNews.url && (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-read-source"
                  >
                    Đọc toàn bộ bài viết tại nguồn gốc <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MOCK_FALLBACK_DATA = [
  {
    id: 1,
    category: "Aviation",
    title: "Vietnam Airlines mở thêm đường bay thẳng đến Châu Âu",
    date: "15/12/2025",
    image:
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=600",
    summary: "Để đáp ứng nhu cầu du lịch tăng cao, hãng hàng không quốc gia...",
    content: "Nội dung chi tiết...",
    url: "#",
  },
  // ... thêm 3 tin nữa giống mock cũ
];

export default NewsWidget;
