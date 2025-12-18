import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
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
  // State quản lý
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'delayed' | 'cancelled'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [refreshKey, setRefreshKey] = useState(0);
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

      // Gọi API cập nhật (Giả lập)
      const response = await fetch(
        `http://localhost:3001/api/staff/flightmanagement/update/${updatedData.flightNumber}`,
        {
          method: "PUT", // Hoặc POST tùy backend của bạn
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${token}` // Nếu cần token
          },
          body: JSON.stringify({
            flightState: updatedData.flightState,
            departureDay: updatedData.departureDay,
            departureTime: updatedData.departureTime,
            arriveDay: updatedData.arriveDay,
            arriveTime: updatedData.arriveTime,
            reason: updatedData.reason, // Gửi lý do lên server
          }),
        }
      );

      // Giả lập thành công nếu không có API thật
      // const result = await response.json();

      // Cập nhật lại state local để UI thay đổi ngay
      const updatedFlights = flights.map((f) =>
        f.flightNumber === updatedData.flightNumber ? updatedData : f
      );
      setFlights(updatedFlights);

      alert(
        `Cập nhật trạng thái chuyến bay ${updatedData.flightNumber} thành công!`
      );
      setIsEditModalOpen(false);
      setSelectedFlight(null);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Cập nhật thất bại.");
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
  const handleCreateFlight = (newFlightData) => {
    // Thêm vào đầu danh sách
    const newFlight = {
      ...newFlightData,
      // Nếu không nhập giờ đến thì tự tính giả lập để hiển thị cho đẹp
      arriveTime:
        newFlightData.arriveTime ||
        calculateArrivalTime(newFlightData.departureTime),
    };

    setFlights([newFlight, ...flights]);
    alert(`Đã tạo chuyến bay ${newFlight.flightNumber} thành công!`);
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
          <h2 className="panel-title">Quản lý chuyến bay</h2>
          <p
            className="sub-text"
            style={{ fontSize: "13px", color: "#dfe6f0ff" }}
          >
            Tổng số chuyến bay hôm nay:{" "}
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
          <Plus size={18} /> Thêm chuyến mới
        </button>
      </div>

      {/* TOOLBAR: Search & Filter */}
      <div className="table-toolbar">
        <div className="search-box-large">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm số hiệu (VN123) hoặc sân bay (HAN)..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active (Hoạt động)</option>
            <option value="delayed">Delayed (Hoãn)</option>
            <option value="cancelled">Cancelled (Hủy)</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Chuyến bay</th>
              <th>Hành trình</th>
              <th>Thời gian (Dự kiến)</th>
              <th>Loại tàu bay</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "center" }}>Thao tác</th>
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
                            color: "#94a3b8",
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
                          ? "Đúng giờ"
                          : flight.flightState === "delayed"
                            ? "Delay"
                            : "Đã hủy"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="action-icon-btn edit"
                        title="Sửa trạng thái & giờ"
                        onClick={() => handleEditClick(flight)}
                      >
                        <Edit size={16} />
                      </button>
                      <button className="action-icon-btn delete" title="Xóa">
                        <Trash2 size={16} />
                      </button>
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
                  Không tìm thấy chuyến bay nào phù hợp.
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
