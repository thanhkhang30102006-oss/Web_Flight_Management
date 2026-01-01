import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Ticket,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { DB_TICKETS } from "../../data/staffMockData";

const BookingOperations = () => {
  // --- STATE QUẢN LÝ ---
  // Lưu DB_TICKETS vào state để có thể cập nhật trạng thái (Hủy/Khôi phục) trên UI
  const [tickets, setTickets] = useState(DB_TICKETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // State quản lý Modal (Popup)
  const [selectedTicket, setSelectedTicket] = useState(null);

  const itemsPerPage = 8;

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Tìm kiếm trên TẤT CẢ các trường (Dynamic Search)
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch = Object.values(ticket).some((val) => {
        // Kiểm tra nếu giá trị null hoặc undefined thì bỏ qua
        if (val === null || val === undefined) return false;

        // Chuyển giá trị về chuỗi (String) rồi so sánh
        return String(val).toLowerCase().includes(searchTermLower);
      });

      // 2. Lọc theo trạng thái
      const matchesStatus =
        filterStatus === "all" || ticket.ticketState === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const displayedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- LOGIC XỬ LÝ VÉ (HỦY / KHÔI PHỤC) ---
  const handleUpdateTicketStatus = (ticketID, newStatus) => {
    const updatedTickets = tickets.map((t) => {
      if (t.ticketID === ticketID) {
        return { ...t, ticketState: newStatus };
      }
      return t;
    });
    setTickets(updatedTickets);

    // Cập nhật lại vé đang xem trong modal để UI modal cũng đổi theo
    if (selectedTicket && selectedTicket.ticketID === ticketID) {
      setSelectedTicket({ ...selectedTicket, ticketState: newStatus });
    }
  };
  // --- XỬ LÝ CLICK RA NGOÀI MODAL (Overlay) ---
  const handleOverlayClick = (e) => {
    // Chỉ đóng nếu click chính xác vào lớp overlay
    if (e.target === e.currentTarget) {
      setSelectedTicket(null);
    }
  };
  return (
    <div
      className="glass-panel fade-in"
      style={{ minHeight: "600px", position: "relative" }}
    >
      {/* HEADER */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Quản lý vé & Đặt chỗ (Booking Ops)</h2>
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#e9eef6ff" }}
          >
            Tổng số vé trong hệ thống:{" "}
            <strong style={{ color: "#fff" }}>{tickets.length}</strong>
          </p>
        </div>
        <button
          className="btn-action primary"
          style={{
            background: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            color: "#60a5fa",
          }}
        >
          <Download size={18} /> Xuất báo cáo
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="table-toolbar">
        <div className="search-box-large">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo Ticket ID, Tên hành khách hoặc Số hiệu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={16} className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả vé</option>
            <option value="valid">Valid (Hợp lệ)</option>
            <option value="cancelled">Cancelled (Đã hủy)</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Hành khách</th>
              <th>Chuyến bay</th>
              <th>Ghế</th>
              <th>Ngày đặt</th>
              <th>Giá vé</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "center" }}>Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {displayedTickets.length > 0 ? (
              displayedTickets.map((ticket) => (
                <tr key={ticket.ticketID}>
                  <td>
                    <div className="flight-id-wrapper">
                      <div
                        className="plane-icon-box"
                        style={{
                          background: "rgba(16, 185, 129, 0.1)",
                          color: "#10b981",
                        }}
                      >
                        <Ticket size={14} />
                      </div>
                      <span className="id-highlight">{ticket.ticketID}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: "#f1f5f9" }}>
                    {ticket.passengerName}
                  </td>
                  <td>{ticket.flightNumber}</td>
                  <td>
                    <span className="seat-badge">{ticket.seatNumber}</span>
                  </td>
                  <td style={{ fontSize: "13px", color: "#ffffffff" }}>
                    {new Date(ticket.ticketBookTime).toLocaleDateString(
                      "vi-VN"
                    )}
                    <div style={{ fontSize: "11px", color: "#ffffffff" }}>
                      {new Date(ticket.ticketBookTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: "bold", color: "#4ade80" }}>
                    {parseInt(ticket.paymentPrice).toLocaleString()} đ
                  </td>
                  <td>
                    <span
                      className={`status-badge state-${ticket.ticketState}`}
                    >
                      {ticket.ticketState === "valid" ? "Hợp lệ" : "Đã hủy"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {/* NÚT XỬ LÝ DUY NHẤT: XEM CHI TIẾT */}
                    <button
                      className="action-icon-btn edit"
                      title="Xem chi tiết"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  Không tìm thấy vé nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <span className="page-info">
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>
          <div className="page-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="page-btn"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="page-btn"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL / POPUP CHI TIẾT VÉ --- */}
      {selectedTicket && (
        <div className="modal-overlay-custom" onClick={handleOverlayClick}>
          <div className="modal-content-glass">
            <div className="modal-header">
              <h3>
                Chi tiết vé:{" "}
                <span style={{ color: "#60a5fa" }}>
                  {selectedTicket.ticketID}
                </span>
              </h3>
              <button
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Cột 1: Thông tin chuyến bay */}
              <div className="info-section">
                <h4 className="section-title">Thông tin vé</h4>
                <div className="info-row">
                  <span className="label">Mã vé:</span>
                  <span className="value">{selectedTicket.ticketID}</span>
                </div>
                <div className="info-row">
                  <span className="label">Chuyến bay:</span>
                  <span className="value">{selectedTicket.flightNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ghế:</span>
                  <span className="value box-value">
                    {selectedTicket.seatNumber}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian đặt:</span>
                  <span className="value">{selectedTicket.ticketBookTime}</span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>

                  <span
                    className={`status-badge state-${selectedTicket.ticketState}`}
                  >
                    {selectedTicket.ticketState === "valid"
                      ? "Hợp lệ"
                      : "Đã hủy"}
                  </span>
                </div>
              </div>

              {/* Cột 2: Thông tin liên hệ */}
              <div className="info-section">
                <h4 className="section-title">Thông tin liên hệ</h4>
                <div className="info-row">
                  <span className="label">Họ tên:</span>
                  <span className="value highlight">
                    {selectedTicket.contactName || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">
                    {selectedTicket.contactEmail || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">SĐT:</span>
                  <span className="value">
                    {selectedTicket.contactPhone || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Hộ chiếu/CCCD:</span>
                  <span className="value">
                    {selectedTicket.contactPassport || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {/* Nút Khôi phục - Chỉ hiện nếu vé đang hủy hoặc muốn cho phép luôn */}
              {selectedTicket.ticketState === "cancelled" ? (
                <button
                  className="modal-action-btn restore"
                  onClick={() =>
                    handleUpdateTicketStatus(selectedTicket.ticketID, "valid")
                  }
                >
                  <CheckCircle size={16} /> Khôi phục vé
                </button>
              ) : (
                // Nút Hủy vé - Chỉ hiện nếu vé đang Valid
                <button
                  className="modal-action-btn cancel"
                  onClick={() =>
                    handleUpdateTicketStatus(
                      selectedTicket.ticketID,
                      "cancelled"
                    )
                  }
                >
                  <AlertCircle size={16} /> Hủy vé
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles Inline cho Modal (Bạn có thể chuyển vào file CSS) */}
      <style jsx>{`
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .state-valid {
          background-color: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .state-cancelled {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content-glass {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 600px;
          max-width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        .close-btn:hover {
          color: #fff;
        }

        .modal-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .section-title {
          font-size: 14px;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 5px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }
        .label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .value {
          font-size: 14px;
          color: #f1f5f9;
          font-weight: 500;
          word-break: break-all;
        }
        .highlight {
          color: #fbbf24;
        }
        .box-value {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }
        .state-valid {
          text-align: center;
        }
        .modal-footer {
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-action-btn.cancel {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
        .modal-action-btn.cancel:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .modal-action-btn.restore {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }
        .modal-action-btn.restore:hover {
          background: rgba(34, 197, 94, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingOperations;
