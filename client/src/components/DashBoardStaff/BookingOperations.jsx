import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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

const BookingOperations = () => {
  const { t, i18n } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // State quản lý Modal (Popup)
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      // Thay URL này bằng đường dẫn API thực tế của bạn
      const response = await fetch(`api/staff/ticket-business/list`);
      if (!response.ok) {
        throw new Error("Lỗi kết nối mạng hoặc API sai đường dẫn");
      }
      const apiResponse = await response.json();

      if (apiResponse.success) {
        setTickets(apiResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error(t("booking_ops.msg.error_network"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const itemsPerPage = 8;

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchTermLower = searchTerm.toLowerCase();
      const searchFields = [
        ticket.ticketID,
        ticket.passengerName,
        ticket.flightNumber,
        ticket.seatNumber,
      ];
      const matchesSearch = searchFields.some((val) => {
        if (val === null || val === undefined) return false;
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
  // Hiện thông tin khách hàng chi tiết
  const handleViewDetail = async (ticket) => {
    try {
      setModalLoading(true);
      setSelectedTicket(ticket);

      const response = await fetch("/api/staff/ticket-business/info-personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketID: ticket.ticketID }),
      });

      const resData = await response.json();

      if (resData.success) {
        setSelectedTicket(resData);
      } else {
        toast.error(t("booking_ops.msg.error_fetch_detail"));
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết vé:", error);
      toast.error(t("booking_ops.msg.error_network"));
    } finally {
      setModalLoading(false);
    }
  };
  // --- LOGIC XỬ LÝ VÉ (HỦY / KHÔI PHỤC) ---
  const handleUpdateTicketStatus = async (ticketID, actionType) => {
    const confirmMsg =
      actionType === "cancel"
        ? t("booking_ops.msg.confirm_cancel")
        : t("booking_ops.msg.confirm_restore");

    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint =
        actionType === "cancel"
          ? "/api/staff/ticket-business/cancel"
          : "/api/staff/ticket-business/restore";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketID: ticketID }),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(resData.message || t("booking_ops.msg.action_success"));
        fetchData();
        setSelectedTicket(null); // Đóng modal
      } else {
        toast.error(resData.message || t("booking_ops.msg.action_fail"));
      }
    } catch (error) {
      console.error(`Lỗi ${actionType} vé:`, error);
      toast.error(t("booking_ops.msg.error_network"));
    }
  };
  // --- XỬ LÝ CLICK RA NGOÀI MODAL (Overlay) ---
  const handleOverlayClick = (e) => {
    // Chỉ đóng nếu click chính xác vào lớp overlay
    if (e.target === e.currentTarget) {
      setSelectedTicket(null);
    }
  };
  const formatCurrency = (val) =>
    new Intl.NumberFormat(i18n.language === "vi" ? "vi-VN" : "en-US").format(
      val
    );
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(
      i18n.language === "vi" ? "vi-VN" : "en-US"
    );
  };

  return (
    <div
      className="glass-panel fade-in"
      style={{ minHeight: "600px", position: "relative" }}
    >
      {/* HEADER */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t("booking_ops.title")}</h2>{" "}
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#e9eef6ff" }}
          >
            {t("booking_ops.total_tickets")}:{" "}
            <strong style={{ color: "#fff" }}>{tickets.length}</strong>
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="table-toolbar">
        <div className="search-box-large">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t("booking_ops.search_placeholder")}
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
            <option value="all">{t("booking_ops.filter_all")}</option>
            <option value="valid">{t("booking_ops.filter_valid")}</option>
            <option value="cancelled">
              {t("booking_ops.filter_cancelled")}
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>{t("booking_ops.table.ticket_id")}</th>
              <th>{t("booking_ops.table.passenger")}</th>
              <th>{t("booking_ops.table.flight")}</th>
              <th>{t("booking_ops.table.seat")}</th>
              <th>{t("booking_ops.table.date")}</th>
              <th>{t("booking_ops.table.price")}</th>
              <th>{t("booking_ops.table.status")}</th>
              <th style={{ textAlign: "center" }}>
                {t("booking_ops.table.action")}
              </th>
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
                  <td>
                    <span style={{ fontSize: "13px", color: "#ffffff" }}>
                      {ticket.ticketBookTime
                        ? new Date(ticket.ticketBookTime).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </span>
                    <div style={{ fontSize: "11px", color: "#e9e9e9ff" }}>
                      {ticket.ticketBookTime
                        ? new Date(ticket.ticketBookTime).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : ""}
                    </div>
                  </td>
                  <td style={{ fontWeight: "bold", color: "#4ade80" }}>
                    {ticket.price
                      ? parseInt(ticket.price).toLocaleString()
                      : parseInt(
                          ticket.paymentPrice || 0
                        ).toLocaleString()}{" "}
                    đ
                  </td>
                  <td>
                    <span
                      className={`status-badge state-${ticket.ticketState}`}
                    >
                      {ticket.ticketState === "valid"
                        ? t("booking_ops.status.valid")
                        : t("booking_ops.status.cancelled")}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {/* NÚT XỬ LÝ DUY NHẤT: XEM CHI TIẾT */}
                    <button
                      className="action-icon-btn edit"
                      title="Xem chi tiết"
                      onClick={() => handleViewDetail(ticket)}
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
                  {t("booking_ops.msg.no_data")}{" "}
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
            {t("booking_ops.pagination")}
            <strong>{currentPage}</strong> / {totalPages}
          </span>
          <div className="page-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="page-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="page-btn"
            >
              <ChevronRight size={20} />
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
                {t("booking_ops.modal.title")}:{" "}
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
                <h4 className="section-title">
                  {t("booking_ops.modal.section_info")}
                </h4>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_code")}:
                  </span>
                  <span className="value">{selectedTicket.ticketID}</span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_flight")}:
                  </span>
                  <span className="value">{selectedTicket.flightNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_seat")}:
                  </span>
                  <span className="value box-value">
                    {selectedTicket.seatNumber}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_time")}:
                  </span>
                  <span className="value">
                    {formatDate(selectedTicket.ticketBookTime)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_status")}:
                  </span>
                  <span
                    className={`status-badge state-${selectedTicket.ticketState === "valid" ? "valid" : "cancelled"}`}
                  >
                    {selectedTicket.ticketState === "valid"
                      ? t("booking_ops.status.valid")
                      : t("booking_ops.status.cancelled")}
                  </span>
                </div>
              </div>

              {/* Cột 2: Thông tin liên hệ */}
              <div className="info-section">
                <h4 className="section-title">
                  {t("booking_ops.modal.section_contact")}
                </h4>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_name")}:
                  </span>
                  <span className="value highlight">
                    {selectedTicket.contactName || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_email")}:
                  </span>
                  <span className="value">
                    {selectedTicket.contactEmail || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_phone")}:
                  </span>
                  <span className="value">
                    {selectedTicket.contactPhone || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">
                    {t("booking_ops.modal.lbl_passport")}:
                  </span>
                  <span className="value">
                    {selectedTicket.contactPassport || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedTicket.ticketState === "cancelled" ? (
                <button
                  className="modal-action-btn restore"
                  onClick={() =>
                    handleUpdateTicketStatus(selectedTicket.ticketID, "restore")
                  }
                >
                  <CheckCircle size={16} /> {t("booking_ops.modal.btn_restore")}
                </button>
              ) : (
                <button
                  className="modal-action-btn cancel"
                  onClick={() =>
                    handleUpdateTicketStatus(selectedTicket.ticketID, "cancel")
                  }
                >
                  <AlertCircle size={16} /> {t("booking_ops.modal.btn_cancel")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
        .info-row.label {
          color: #64748b;

          display: flex;
          align-items: center;
          gap: 8px;
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
