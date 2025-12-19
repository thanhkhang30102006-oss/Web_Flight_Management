import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Mail,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import "./FlightReport.css"; // File CSS riêng cho báo cáo

// --- MOCK DATA (Mô phỏng dữ liệu từ Database) ---
const MOCK_REPORT_DATA = [
  {
    flightNumber: "VN001",
    route: "HAN ➝ SGN",
    date: "2025-12-23",
    totalSeats: 300,
    bookedSeats: 285,
    status: "active",
    revenue: 450000000,
  },
  {
    flightNumber: "QH203",
    route: "DAD ➝ SGN",
    date: "2025-12-21",
    totalSeats: 90,
    bookedSeats: 45,
    status: "delayed",
    revenue: 85000000,
  },
  {
    flightNumber: "VJ555",
    route: "HAN ➝ SGN",
    date: "2025-12-22",
    totalSeats: 180,
    bookedSeats: 160,
    status: "active",
    revenue: 210000000,
  },
  {
    flightNumber: "VN002",
    route: "HAN ➝ SGN",
    date: "2025-12-29",
    totalSeats: 300,
    bookedSeats: 30, // Mới mở bán
    status: "active",
    revenue: 55000000,
  },
  {
    flightNumber: "QH111",
    route: "HAN ➝ SGN",
    date: "2025-12-20",
    totalSeats: 60,
    bookedSeats: 60, // Full
    status: "cancelled", // Đã hủy
    revenue: 0,
  },
  {
    flightNumber: "VJ102",
    route: "SGN ➝ HAN",
    date: "2025-12-29",
    totalSeats: 180,
    bookedSeats: 120,
    status: "active",
    revenue: 150000000,
  },
];

const COLORS = ["#4ade80", "#fbbf24", "#ef4444"]; // Xanh (Active), Vàng (Delayed), Đỏ (Cancelled)

const FlightReport = () => {
  const [filterDate, setFilterDate] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // --- 1. XỬ LÝ LOGIC LỌC & TÍNH TOÁN ---
  const filteredData = useMemo(() => {
    return MOCK_REPORT_DATA.filter((flight) => {
      const matchSearch =
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        selectedStatus === "all" || flight.status === selectedStatus;
      // Giả lập lọc date (thực tế sẽ so sánh ngày)
      return matchSearch && matchStatus;
    });
  }, [searchTerm, selectedStatus]);

  // Tính toán chỉ số tổng hợp (KPI)
  const stats = useMemo(() => {
    const totalFlights = filteredData.length;
    const totalRevenue = filteredData.reduce((sum, f) => sum + f.revenue, 0);
    const totalSeats = filteredData.reduce((sum, f) => sum + f.totalSeats, 0);
    const totalBooked = filteredData.reduce((sum, f) => sum + f.bookedSeats, 0);
    const avgOccupancy = totalSeats ? (totalBooked / totalSeats) * 100 : 0;

    // Data cho Pie Chart (Trạng thái)
    const statusCount = { active: 0, delayed: 0, cancelled: 0 };
    filteredData.forEach((f) => {
      if (statusCount[f.status] !== undefined) statusCount[f.status]++;
    });
    const pieData = [
      { name: "Đúng giờ", value: statusCount.active },
      { name: "Delay", value: statusCount.delayed },
      { name: "Đã hủy", value: statusCount.cancelled },
    ];

    return {
      totalFlights,
      totalRevenue,
      avgOccupancy,
      pieData,
    };
  }, [filteredData]);

  // Data cho Bar Chart (Top 5 chuyến bay đông nhất)
  const barChartData = useMemo(() => {
    return [...filteredData]
      .map((f) => ({
        name: f.flightNumber,
        occupancy: Math.round((f.bookedSeats / f.totalSeats) * 100),
        seats: f.bookedSeats,
      }))
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5);
  }, [filteredData]);

  // --- 2. HÀM XỬ LÝ SỰ KIỆN ---
  const handleExportPDF = () => {
    // Giả lập gọi thư viện jspdf
    alert("Đang xuất báo cáo PDF... (Tính năng mô phỏng)");
  };

  const handleSendMail = () => {
    const email = prompt("Nhập email người nhận báo cáo:");
    if (email) {
      alert(`Đã gửi báo cáo tình trạng chuyến bay đến: ${email}`);
    }
  };

  return (
    <div className="flight-report-container fade-in">
      {/* --- HEADER --- */}
      <div className="report-header">
        <div>
          <h2 className="panel-title">Báo Cáo Tình Trạng Chuyến Bay</h2>
          <p className="sub-text">
            Tổng hợp dữ liệu vận hành, tỷ lệ lấp đầy và doanh thu
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-export excel" onClick={handleSendMail}>
            <Mail size={16} /> Gửi Mail
          </button>
          <button className="btn-export pdf" onClick={handleExportPDF}>
            <Download size={16} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon blue">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Doanh Thu (Ước tính)</span>
            <h3 className="kpi-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(stats.totalRevenue)}
            </h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tỷ lệ lấp đầy TB</span>
            <h3 className="kpi-value">{stats.avgOccupancy.toFixed(1)}%</h3>
            <span className="kpi-sub">Trên tổng số ghế cung ứng</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon purple">
            <FileText size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Chuyến Bay</span>
            <h3 className="kpi-value">{stats.totalFlights}</h3>
            <span className="kpi-sub">Trong phạm vi lọc</span>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="charts-section">
        {/* Biểu đồ tròn: Trạng thái */}
        <div className="chart-card glass-panel">
          <h3>Tỷ lệ Trạng thái Chuyến bay</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột: Tỷ lệ lấp đầy */}
        <div className="chart-card glass-panel">
          <h3>Top 5 Chuyến Bay Đông Khách Nhất (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                horizontal={false}
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={60}
                stroke="#cbd5e1"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.1)" }}
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="occupancy"
                name="Tỷ lệ lấp đầy (%)"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="table-toolbar glass-panel compact-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo số hiệu, điểm đi/đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <Filter size={16} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Active (Hoạt động)</option>
              <option value="delayed">Delayed (Hoãn)</option>
              <option value="cancelled">Cancelled (Hủy)</option>
            </select>
          </div>
          <div className="filter-item">
            <Calendar size={16} />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="glass-table-container">
        <table className="glass-table report-table">
          <thead>
            <tr>
              <th>Chuyến bay</th>
              <th>Hành trình & Ngày</th>
              <th>Trạng thái</th>
              <th>Tỷ lệ chỗ ngồi</th>
              <th>Chi tiết ghế</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((flight, index) => {
                const occupancyRate = Math.round(
                  (flight.bookedSeats / flight.totalSeats) * 100
                );
                // Màu progress bar dựa trên tỷ lệ
                let progressColor = "#4ade80"; // Xanh (Thấp/Vừa)
                if (occupancyRate > 50) progressColor = "#facc15"; // Vàng
                if (occupancyRate > 90) progressColor = "#ef4444"; // Đỏ (Full)

                return (
                  <tr key={index}>
                    <td>
                      <strong>{flight.flightNumber}</strong>
                    </td>
                    <td>
                      <div className="report-route">{flight.route}</div>
                      <div className="report-date">{flight.date}</div>
                    </td>
                    <td>
                      <span
                        className={`status-badge state-${flight.status}`}
                        style={{
                          textTransform: "uppercase",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color:
                            flight.status === "active"
                              ? "#4ade80" // Màu Xanh lá (Đúng giờ)
                              : flight.status === "delayed"
                                ? "#facc15" // Màu Vàng (Trễ chuyến)
                                : "#ef4444", // Màu Đỏ (Đã hủy)
                        }}
                      >
                        {flight.status === "active"
                          ? "Đúng giờ"
                          : flight.status === "delayed"
                            ? "Trễ chuyến"
                            : "Đã hủy"}
                      </span>
                    </td>
                    <td style={{ width: "25%" }}>
                      <div className="occupancy-wrapper">
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${occupancyRate}%`,
                              background: progressColor,
                            }}
                          ></div>
                        </div>
                        <span className="occupancy-text">{occupancyRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="seat-stats">
                        <span className="booked">
                          {flight.bookedSeats} đã đặt
                        </span>
                        <span className="divider">/</span>
                        <span className="total">{flight.totalSeats} tổng</span>
                      </div>
                    </td>
                    <td className="revenue-cell">
                      {new Intl.NumberFormat("vi-VN").format(flight.revenue)} ₫
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  Không có dữ liệu phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightReport;
