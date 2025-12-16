import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  RefreshCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { DB_TICKETS } from "../../data/staffMockData";

const BookingOperations = () => {
  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'valid' | 'cancelled'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredTickets = useMemo(() => {
    return DB_TICKETS.filter((ticket) => {
      // 1. Tìm kiếm đa trường (ID, Tên, Chuyến bay)
      const matchesSearch =
        ticket.ticketID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Lọc theo trạng thái
      const matchesStatus =
        filterStatus === "all" || ticket.ticketState === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

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

  return (
    <div className="glass-panel fade-in" style={{ minHeight: "600px" }}>
      {/* HEADER */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Quản lý vé & Đặt chỗ (Booking Ops)</h2>
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#e9eef6ff" }}
          >
            Tổng số vé trong hệ thống:{" "}
            <strong style={{ color: "#fff" }}>{DB_TICKETS.length}</strong>
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
                        { hour: "2-digit", minute: "2-digit" }
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "5px",
                      }}
                    >
                      <button
                        className="action-icon-btn edit"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {ticket.ticketState === "valid" && (
                        <button
                          className="action-icon-btn delete"
                          title="Hoàn vé / Hủy"
                        >
                          <RefreshCcw size={16} />
                        </button>
                      )}
                    </div>
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

      {/* FOOTER: Pagination */}
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
    </div>
  );
};

export default BookingOperations;
