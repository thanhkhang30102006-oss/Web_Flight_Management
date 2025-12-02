import { useState, useEffect } from "react";
function NotificationDropDown() {
  return (
    <div className="noti-dropdown">
      <div className="noti-header">
        <h4>Thông báo</h4>
        <span>Đánh dấu đã đọc</span>
      </div>

      <div className="noti-list">
        {/* Item mẫu 1 */}
        <div className="noti-item unread">
          <div className="noti-icon">✈️</div>
          <div className="noti-content">
            <p>
              <strong>Chuyến bay VN123</strong> sắp cất cánh trong 2 giờ tới.
            </p>
            <span className="time">10 phút trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Header() {
  const [showNoti, setShowNoti] = useState(false);
  return (
    <>
      {/*Greeting part */}
      <h1 className="greeting">Xin chào, Khang </h1> {/*Gọi lấy dữ liệu tên*/}
      <div className="right">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t("header.search", "Tìm kiếm...")}
            className="search-input"
          />
          <button className="search-button">
            {t("header.searchBtn", "Tìm")}
          </button>
        </div>

        {/* Notification part*/}
        <div className="notification-wrapper">
          {/** icon cái chuông khi bấm hiện thanh thông báo */}
          <button className="btn-icon" onClick={() => setShowNoti(!showNoti)}>
            {/** icon chuông ở đây */}
          </button>
          {showNoti && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                zIndex: 100,
              }}
            >
              <NotificationDropDown />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
