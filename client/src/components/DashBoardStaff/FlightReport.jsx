import React, { useState, useMemo, useEffect } from "react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
const COLORS = ["#4ade80", "#fbbf24", "#ef4444"]; // Xanh (Active), Vàng (Delayed), Đỏ (Cancelled)

const FlightReport = () => {
  const [tableData, setTableData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [popularRouteData, setPopularRouteData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState(0);
  const [seatChartData, setSeatChartData] = useState(0);
  const [totalFlight, setTotalFlight] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  // Render dữ liệu ra
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`api/staff/chart/statiscial`);
        if (!response.ok) {
          throw new Error("Lỗi kết nối mạng hoặc API sai đường dẫn");
        }
        const apiResponse = await response.json();
        console.log("API response:", apiResponse.data);
        if (apiResponse.status === "success") {
          // Map dữ liệu với UI TABLE
          const mappedData = apiResponse.data.tableData.map((item) => ({
            flightNumber: item.flightNumber,
            route: `${item.departurePoint} ➝ ${item.arrivePoint}`, // Nối điểm đi - đến
            date: item.departureDay.split("T")[0], // Lấy ngày yyyy-mm-dd
            totalSeats: item.stats ? item.stats.total : 0,
            bookedSeats: item.stats ? item.stats.booked : 0,
            status: item.flightState, // Hàm chuẩn hóa trạng thái (xem bên dưới)
            revenue: item.revenue,
            occupancyStatus: item.occupancyStatus, // Lưu trạng thái gốc để lọc nếu cần
          }));

          setTableData(mappedData);

          // CHART
          const averageRevenuePayment =
            apiResponse.data.overview.averageRevenue;
          setRevenueChartData(averageRevenuePayment);

          const averageRevenueSeat = apiResponse.data.overview.averageSeatFill;
          setSeatChartData(averageRevenueSeat);

          const totalFlight = apiResponse.data.overview.totalFlights;
          setTotalFlight(totalFlight);

          const mappedStatus = apiResponse.data.charts.flightStates.map(
            (item) => ({
              name:
                item.flightState === "active"
                  ? "Đúng giờ"
                  : item.flightState === "delayed"
                    ? "Trễ chuyến"
                    : "Đã hủy",
              value: parseInt(item.totalState),
              key: item.flightState,
            })
          );
          setStatusChartData(mappedStatus);

          const mappedPopular = apiResponse.data.charts.popularRoutes.map(
            (item) => ({
              name: `${item.flightNumber} (${item.departurePoint}-${item.arrivePoint})`,
              passengers: parseInt(item.totalPassenger),
              capacity: item.flightTotalSeat,
            })
          );
          setPopularRouteData(mappedPopular);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể tải dữ liệu báo cáo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Hiện màu theo trạng thái
  // --- 1. XỬ LÝ LOGIC LỌC & TÍNH TOÁN ---
  const filteredData = useMemo(() => {
    return tableData.filter((flight) => {
      const matchText =
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" || flight.status === statusFilter;
      const matchDate = dateFilter === "" || flight.date === dateFilter;

      return matchText && matchStatus && matchDate;
    });
  }, [searchTerm, statusFilter, dateFilter, tableData]);

  // Tính toán chỉ số tổng hợp (KPI)
  const stats = useMemo(() => {
    const totalFlights = filteredData.length;
    const totalRevenue = filteredData.reduce(
      (sum, f) => sum + (f.revenue || 0),
      0
    );
    const totalSeats = filteredData.reduce(
      (sum, f) => sum + (f.totalSeats || 0),
      0
    );
    const totalBooked = filteredData.reduce(
      (sum, f) => sum + (f.bookedSeats || 0),
      0
    );
    const avgOccupancy = totalSeats > 0 ? (totalBooked / totalSeats) * 100 : 0;

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

  // --- 2. HÀM XỬ LÝ SỰ KIỆN ---
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const loadFont = async () => {
    try {
      // Đường dẫn "/" đại diện cho thư mục public trong React/Vite
      const res = await fetch("/fonts/times.ttf");
      if (!res.ok)
        throw new Error("Không tìm thấy file font tại /public/fonts/times.ttf");

      const buffer = await res.arrayBuffer();
      return arrayBufferToBase64(buffer);
    } catch (error) {
      console.error("Lỗi tải font:", error);
      return null;
    }
  };
  const exportToPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const base64Font = await loadFont();

    if (base64Font) {
      doc.addFileToVFS("Times.ttf", base64Font);
      doc.addFont("Times.ttf", "TimesCustom", "normal");
      doc.addFont("Times.ttf", "TimesCustom", "bold");
      doc.setFont("TimesCustom");
    }

    // --- 1. TIÊU ĐỀ (Y: 50 - 70) ---
    doc.setFontSize(20);
    doc.text("BÁO CÁO THỐNG KÊ CHUYẾN BAY", 40, 50);
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`, 40, 70);

    // --- 2. MỤC 1: TỔNG QUAN (Đưa lên trên, Y: 110 - 180) ---
    doc.setFontSize(14);
    doc.text("1. Tổng quan", 40, 110);
    doc.setFontSize(11);
    doc.text(`- Tổng số chuyến bay: ${totalFlight}`, 60, 130);
    doc.text(
      `- Doanh thu trung bình: ${new Intl.NumberFormat("vi-VN").format(revenueChartData)} VND`,
      60,
      150
    );
    doc.text(
      `- Tỷ lệ lấp đầy trung bình: ${seatChartData.toFixed(2)}%`,
      60,
      170
    );

    doc.setFontSize(14);
    doc.text("2. Danh sách chi tiết", 40, 210);

    const tableColumn = [
      "Số hiệu",
      "Chặng",
      "Ngày",
      "Trạng thái",
      "Khách/Ghế",
      "Doanh thu",
    ];

    const tableRows = tableData.map((item) => [
      item.flightNumber,
      item.route,
      item.date,
      item.status === "active"
        ? "Đúng giờ"
        : item.status === "delayed"
          ? "Trễ chuyến"
          : "Đã hủy",
      `${item.bookedSeats}/${item.totalSeats}`,
      new Intl.NumberFormat("vi-VN").format(item.revenue),
    ]);

    autoTable(doc, {
      startY: 230,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "TimesCustom",
        fontStyle: "normal",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        font: "TimesCustom",
        fontStyle: "normal",
      },
    });

    // 5. Lưu file
    doc.save(`Bao_Cao_${new Date().getTime()}.pdf`);
  };
  const handleSendMail = async () => {
    try {
      const email = prompt("Nhập email người nhận báo cáo:");
      if (email) {
        const reportPayload = {
          overview: {
            totalFlights: totalFlight,
            averageRevenue: revenueChartData,
            averageSeatFill: seatChartData,
          },
          tableData: tableData,
          reportEmail: email,
        };
        const response = await fetch(`api/staff/chart/send-system-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportPayload),
        });

        if (response.status === "success") {
          alert("Đã gửi email báo cáo thành công!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi API gửi mail:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
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
          <button className="btn-export pdf" onClick={exportToPDF}>
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
            <span className="kpi-label">Doanh Thu trung bình(Ước tính)</span>
            <h3 className="kpi-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(revenueChartData)}
            </h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tỷ lệ lấp đầy TB</span>
            <h3 className="kpi-value">{seatChartData.toFixed(1)}%</h3>
            <span className="kpi-sub">Trên tổng số ghế cung ứng</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon purple">
            <FileText size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Chuyến Bay</span>
            <h3 className="kpi-value">{totalFlight}</h3>
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
                data={statusChartData}
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
            <BarChart data={popularRouteData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                horizontal={false}
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
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
                dataKey="passengers"
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
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
