import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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
  const { t, i18n } = useTranslation();
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
              key: item.flightState,
              value: parseInt(item.totalState),
              name: item.flightState,
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
        setError(t("flight_report.msg.error_fetch"));
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

    // Dữ liệu PieChart (Lấy từ filteredData để phản ánh đúng bộ lọc hiện tại)
    const statusCount = { active: 0, delayed: 0, cancelled: 0 };
    filteredData.forEach((f) => {
      if (statusCount[f.status] !== undefined) statusCount[f.status]++;
    });

    // Map data pie chart có translation
    const pieData = [
      { name: t("flight_report.status.active"), value: statusCount.active },
      { name: t("flight_report.status.delayed"), value: statusCount.delayed },
      {
        name: t("flight_report.status.cancelled"),
        value: statusCount.cancelled,
      },
    ];

    return { totalFlights, pieData };
  }, [filteredData, t]);

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

    // Tải font online để hỗ trợ tiếng Việt (Roboto)
    const fontURL =
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";

    try {
      const response = await fetch(fontURL);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        // --- NỘI DUNG PDF ---
        doc.setFontSize(20);
        doc.text(t("flight_report.pdf.title"), 40, 50);
        doc.setFontSize(10);
        const dateStr = new Date().toLocaleDateString(
          i18n.language === "vi" ? "vi-VN" : "en-US"
        );
        doc.text(`${t("flight_report.pdf.date")}: ${dateStr}`, 40, 70);

        // 1. Overview
        doc.setFontSize(14);
        doc.text(t("flight_report.pdf.section_overview"), 40, 110);
        doc.setFontSize(11);
        doc.text(
          `- ${t("flight_report.pdf.total_flights")}: ${totalFlight}`,
          60,
          130
        );

        const revenueStr = new Intl.NumberFormat(
          i18n.language === "vi" ? "vi-VN" : "en-US",
          {
            style: "currency",
            currency: "VND",
          }
        ).format(revenueChartData);

        doc.text(
          `- ${t("flight_report.pdf.avg_revenue")}: ${revenueStr}`,
          60,
          150
        );
        doc.text(
          `- ${t("flight_report.pdf.avg_occupancy")}: ${seatChartData.toFixed(2)}%`,
          60,
          170
        );

        // 2. Table
        doc.setFontSize(14);
        doc.text(t("flight_report.pdf.section_list"), 40, 210);

        const tableColumn = [
          t("flight_report.pdf.col_flight"),
          t("flight_report.pdf.col_route"),
          t("flight_report.pdf.col_date"),
          t("flight_report.pdf.col_status"),
          t("flight_report.pdf.col_occupancy"),
          t("flight_report.pdf.col_revenue"),
        ];

        const tableRows = tableData.map((item) => [
          item.flightNumber,
          item.route,
          item.date,
          // Dịch trạng thái cho PDF
          item.status === "active"
            ? t("flight_report.status.active")
            : item.status === "delayed"
              ? t("flight_report.status.delayed")
              : t("flight_report.status.cancelled"),
          `${item.bookedSeats}/${item.totalSeats}`,
          new Intl.NumberFormat(
            i18n.language === "vi" ? "vi-VN" : "en-US"
          ).format(item.revenue),
        ]);

        autoTable(doc, {
          startY: 230,
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
          styles: { font: "Roboto", fontStyle: "normal", fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`Report_${new Date().getTime()}.pdf`);
      };
    } catch (e) {
      console.error("PDF Font Error", e);
      toast.error(t("flight_report.msg.error_font"));
    }
  };
  const handleSendMail = async () => {
    try {
      const email = prompt(t("flight_report.prompt_email"));
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
          toast.success(t("flight_report.msg.email_success"));
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi API gửi mail:", error);
      toast.error(t("flight_report.msg.email_fail"));
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <div className="p-10 text-center text-white">
        {t("flight_report.msg.loading")}
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  return (
    <div className="flight-report-container fade-in">
      {/* --- HEADER --- */}
      <div className="report-header">
        <div>
          <h2 className="panel-title">{t("flight_report.title")}</h2>
          <p className="sub-text">{t("flight_report.subtitle")}</p>
        </div>
        <div className="header-actions">
          <button className="btn-export excel" onClick={handleSendMail}>
            <Mail size={16} /> {t("flight_report.btn_email")}
          </button>
          <button className="btn-export pdf" onClick={exportToPDF}>
            <Download size={16} /> {t("flight_report.btn_pdf")}
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
            <span className="kpi-label">
              {t("flight_report.kpi_avg_revenue")}
            </span>{" "}
            <h3 className="kpi-value">
              {new Intl.NumberFormat(
                i18n.language === "vi" ? "vi-VN" : "en-US",
                {
                  style: "currency",
                  currency: "VND",
                }
              ).format(revenueChartData)}
            </h3>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">
              {t("flight_report.kpi_occupancy")}
            </span>
            <h3 className="kpi-value">{seatChartData.toFixed(1)}%</h3>
            <span className="kpi-sub">
              {t("flight_report.kpi_occupancy_sub")}
            </span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon purple">
            <FileText size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">
              {t("flight_report.kpi_total_flights")}
            </span>
            <h3 className="kpi-value">{totalFlight}</h3>
            <span className="kpi-sub">
              {t("flight_report.kpi_total_flights_sub")}
            </span>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="charts-section">
        {/* Biểu đồ tròn: Trạng thái */}
        <div className="chart-card glass-panel">
          <h3>{t("flight_report.chart_status_title")}</h3>{" "}
          <ResponsiveContainer width="100%" height={275}>
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
                  backgroundColor: "#1f2937",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "#ffffff", fontSize: "14px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột: Tỷ lệ lấp đầy */}
        <div className="chart-card glass-panel">
          <h3>{t("flight_report.chart_popular_title")}</h3>{" "}
          <ResponsiveContainer width="100%" height={300}>
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
            placeholder={t("flight_report.search_placeholder")}
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
              <option value="all">
                {t("flight_report.filter_status_all")}
              </option>
              <option value="active">{t("flight_report.status.active")}</option>
              <option value="delayed">
                {t("flight_report.status.delayed")}
              </option>
              <option value="cancelled">
                {t("flight_report.status.cancelled")}
              </option>
            </select>
          </div>
          <div className="filter-item">
            <Calendar size={16} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">{t("flight_report.filter_date_all")}</option>
              <option value="today">
                {t("flight_report.filter_date_today")}
              </option>
              <option value="week">
                {t("flight_report.filter_date_week")}
              </option>
              <option value="month">
                {t("flight_report.filter_date_month")}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="glass-table-container">
        <table className="glass-table report-table">
          <thead>
            <tr>
              <th>{t("flight_report.table.flight")}</th>
              <th>{t("flight_report.table.route_date")}</th>
              <th>{t("flight_report.table.status")}</th>
              <th>{t("flight_report.table.occupancy")}</th>
              <th>{t("flight_report.table.seats")}</th>
              <th>{t("flight_report.table.revenue")}</th>
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
                              ? "#4ade80"
                              : flight.status === "delayed"
                                ? "#facc15"
                                : "#ef4444",
                        }}
                      >
                        {flight.status === "active"
                          ? t("flight_report.status.active")
                          : flight.status === "delayed"
                            ? t("flight_report.status.delayed")
                            : t("flight_report.status.cancelled")}
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
                          {flight.bookedSeats} {t("flight_report.seats_booked")}
                        </span>
                        <span className="divider">/</span>
                        <span className="total">
                          {flight.totalSeats} {t("flight_report.seats_total")}
                        </span>
                      </div>
                    </td>
                    <td className="revenue-cell">
                      {new Intl.NumberFormat(
                        i18n.language === "vi" ? "vi-VN" : "en-US"
                      ).format(flight.revenue)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  {t("flight_report.no_data")}{" "}
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
