import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plane,
  X,
  Grid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateFlightModal from "./CreateFlightModal";
import EditFlightStatusModal from "./EditFlightStatusModal";

// Hàm giả lập tính giờ đến (Departure + 2h15p)
const calculateArrivalTime = (depTime) => {
  if (!depTime) return "--:--";
  const [hours, minutes] = depTime.split(":").map(Number);
  let arrHours = hours + 2;
  let arrMinutes = minutes + 15;

  if (arrMinutes >= 60) {
    arrHours += 1;
    arrMinutes -= 60;
  }
  if (arrHours >= 24) arrHours -= 24;

  return `${arrHours.toString().padStart(2, "0")}:${arrMinutes
    .toString()
    .padStart(2, "0")}`;
};

const FlightManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // State quản lý
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'delayed' | 'cancelled'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [refreshKey, setRefreshKey] = useState(false);
  const [flights, setFlights] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const handleEditClick = (flight) => {
    setSelectedFlight(flight);
    setIsEditModalOpen(true);
  };
  const handleUpdateFlight = async (updatedData) => {
    try {
      console.log("Dữ liệu gửi đi update:", updatedData);
      const currentFlightNumber = selectedFlight?.flightNumber;
      // Gọi API cập nhật (Giả lập)
      const response = await fetch(
        `http://localhost:3001/api/staff/flightmanagement/update/${currentFlightNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flightState: updatedData.flightState,
            departureDay: updatedData.departureDay,
            departureTime: updatedData.departureTime,
            arriveDay: updatedData.arriveDay,
            arriveTime: updatedData.arriveTime,
            reason: updatedData.reason,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(t("flight_mgt.msg.error_create"));
      }
      setRefreshKey((prevKey) => !prevKey);

      toast.success(
        `${t("flight_mgt.msg.update_success")} (${currentFlightNumber})`
      );
      setIsEditModalOpen(false);
      setSelectedFlight(null);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error(t("flight_mgt.msg.update_fail"));
    }
  };

  // useEffect load dữ liệu ra trang
  useEffect(() => {
    const getFlights = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/staff/flightmanagement/showflight"
        );

        if (!res.ok) {
          console.log("Lỗi server");
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setFlights(data);
          console.log("Đã load lại dữ liệu!", data);
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error(err);
        setFlights([]);
      }
    };
    getFlights();
  }, [refreshKey]);
  const handleCreateFlight = async (newFlightData) => {
    const formData = newFlightData;

    try {
      const response = await fetch(
        "http://localhost:3001/api/staff/flightmanagement/create-flight",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tạo chuyến bay");
      }
      setRefreshKey((prevKey) => !prevKey);
      toast.success(
        `${t("flight_mgt.msg.create_success")} (${newFlightData.flightNumber})`
      );
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t("flight_mgt.msg.update_fail"));
    }
  };
  // Hàm xử lý hủy chuyến bay
  const handleCancelledFlight = async (flight) => {
    const isConfirmed = window.confirm(
      t("flight_mgt.msg.cancel_confirm", { flightNumber: flight.flightNumber })
    );
    if (!isConfirmed) return;
    try {
      console.log("Dữ liệu gửi đi update:", flight);
      // Gọi API cập nhật (Giả lập)
      const response = await fetch(
        `http://localhost:3001/api/staff/flightmanagement/cancel/${flight.flightNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(t("flight_mgt.msg.error_create"));
      }
      setRefreshKey((prevKey) => !prevKey);

      toast.success(
        `${t("flight_mgt.msg.cancel_success")} (${flight.flightNumber})`
      );
      null;
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error(t("flight_mgt.msg.update_fail"));
    }
  };
  // 1. Lọc dữ liệu
  const filteredFlights = useMemo(() => {
    if (!flights) return []; // Check null
    return flights.filter((flight) => {
      // Lọc theo search (ID hoặc Route)
      const matchesSearch =
        flight.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.departurePoint
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        flight.arrivePoint?.toLowerCase().includes(searchTerm.toLowerCase());

      // Lọc theo status
      const matchesStatus =
        filterStatus === "all" || flight.flightState === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, flights]);
  // 2. Phân trang
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const displayedFlights = filteredFlights.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ minHeight: "600px" }}>
      {/* HEADER: Tiêu đề + Nút thêm */}
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t("flight_mgt.title")}</h2>
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#dfe6f0ff" }}
          >
            {t("flight_mgt.total_flights")}:{" "}
            <strong style={{ color: "#fff" }}>{flights.length}</strong>
          </p>
        </div>
        <button
          className="btn-action primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            background: "#2eff66ba",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "2px 0 10px rgba(0, 0, 0, 0.45)",
            color: "#0f172a",
          }}
        >
          <Plus size={18} />
          {t("flight_mgt.btn_add")}
        </button>
      </div>

      {/* TOOLBAR: Search & Filter */}
      <div className="table-toolbar">
        <div className="search-box-large">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t("flight_mgt.search_placeholder")}
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
            <option value="all">{t("flight_mgt.filter_all")}</option>
            <option value="active">{t("flight_mgt.filter_active")}</option>
            <option value="delayed">{t("flight_mgt.filter_delayed")}</option>
            <option value="cancelled">
              {t("flight_mgt.filter_cancelled")}
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>{t("flight_mgt.table.flight")}</th>
              <th>{t("flight_mgt.table.route")}</th>
              <th>{t("flight_mgt.table.time")}</th>
              <th>{t("flight_mgt.table.plane_type")}</th>
              <th>{t("flight_mgt.table.status")}</th>
              <th style={{ textAlign: "center" }}>
                {t("flight_mgt.table.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedFlights.length > 0 ? (
              displayedFlights.map((flight, index) => {
                const displayArrTime = flight.arriveTime
                  ? flight.arriveTime.slice(0, 5)
                  : calculateArrivalTime(flight.departureTime);
                return (
                  <tr key={index}>
                    <td>
                      <div className="flight-id-wrapper">
                        <div className="plane-icon-box">
                          <Plane size={18} />
                        </div>
                        <strong>{flight.flightNumber}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="route-badge-outline">
                        {flight.departurePoint} <span className="arrow">➝</span>{" "}
                        {flight.arrivePoint}
                      </span>
                    </td>
                    <td>
                      <div className="time-display">
                        <span className="time-main">
                          {flight.departureTime.slice(0, 5)}
                        </span>
                        <span className="time-sep">-</span>
                        <span className="time-sub">{displayArrTime}</span>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#e7e7e7ff",
                            marginTop: "2px",
                          }}
                        >
                          {flight.departureDay?.split("T")[0]}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#f7f8f9ff", fontSize: "13px" }}>
                      {flight.planeType}
                    </td>
                    <td>
                      <span
                        className={`status-badge state-${flight.flightState}`}
                      >
                        {flight.flightState === "active"
                          ? t("flight_mgt.status.on_time")
                          : flight.flightState === "delayed"
                            ? t("flight_mgt.status.delayed")
                            : t("flight_mgt.status.cancelled")}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {flight.flightState !== "cancelled" && (
                        <button
                          className="action-icon-btn view-seat"
                          title={t("flight_mgt.tooltip.view_seat")}
                          onClick={() =>
                            navigate(
                              `/staff/flight-seats/${flight.flightNumber}`,
                              { state: { flight } }
                            )
                          }
                          style={{ marginRight: "5px", color: "#9ac0ffff" }} // Màu xanh dương
                        >
                          <Grid size={16} />
                        </button>
                      )}
                      <button
                        className="action-icon-btn edit"
                        title={t("flight_mgt.tooltip.edit")}
                        onClick={() => handleEditClick(flight)}
                      >
                        <Edit size={16} />
                      </button>

                      {flight.flightState !== "cancelled" && (
                        <button
                          className="action-icon-btn delete"
                          title={t("flight_mgt.tooltip.delete")}
                          onClick={() => handleCancelledFlight(flight)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  {t("flight_mgt.msg.no_data")}{" "}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* --- MODAL COMPONENT --- */}
      <CreateFlightModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateFlight}
      />

      <EditFlightStatusModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        flight={selectedFlight}
        onSave={handleUpdateFlight}
      />

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

export default FlightManagement;
