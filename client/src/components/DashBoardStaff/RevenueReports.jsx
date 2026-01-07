import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Download,
  Filter,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import * as XLSX from "xlsx"; // Import Excel
import jsPDF from "jspdf"; // Import PDF
import { autoTable } from "jspdf-autotable";
import "./RevenueReports.css";
import "../../pages/StaffDashboard.css"; // Dùng chung CSS
import { format, parseISO, getDay, getMonth } from "date-fns";
import toast from "react-hot-toast";

const RevenueReports = () => {
  const { t, i18n } = useTranslation();
  const [filterType, setFilterType] = useState("week"); // 'week' | 'month'
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Thay URL này bằng đường dẫn API thực tế của bạn
        const response = await fetch(`api/staff/chart/revenue`);
        if (!response.ok) {
          throw new Error("Lỗi kết nối mạng hoặc API sai đường dẫn");
        }
        const apiResponse = await response.json();

        if (apiResponse.status === "success") {
          setApiData(apiResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
        toast.error(t("common.error_network") || "Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Biến danh sách payment thô thành array [T2, T3... CN] hoặc [T1... T12]
  const processChartData = (payments, type) => {
    if (!payments) return [];

    let dataMap = {};

    if (type === "week") {
      const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      // Thứ tự hiển thị mong muốn: T2 -> CN
      const displayOrder = [1, 2, 3, 4, 5, 6, 0];

      displayOrder.forEach((dayIdx) => {
        const key = dayKeys[dayIdx];
        const label = t(`revenue_report.chart_labels.${key}`); // Dịch: "Mon" hoặc "T2"
        dataMap[dayIdx] = {
          name: label,
          revenue: 0,
          ticket: 0,
          rawIndex: dayIdx,
        };
      });

      payments.forEach((item) => {
        const date = parseISO(item.createdAt);
        const dayIndex = getDay(date); // 0 = Sunday
        if (dataMap[dayIndex]) {
          dataMap[dayIndex].revenue += parseFloat(item.paymentPrice || 0);
          dataMap[dayIndex].ticket += 1; // Giả sử mỗi payment là 1 vé (hoặc logic khác từ BE)
        }
      });

      return displayOrder.map((idx) => dataMap[idx]);
    } else {
      const monthKeys = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];

      monthKeys.forEach((key, index) => {
        const label = t(`revenue_report.chart_labels.${key}`); // Dịch: "Jan" hoặc "T1"
        dataMap[index] = { name: label, revenue: 0, ticket: 0 };
      });

      payments.forEach((item) => {
        const date = parseISO(item.createdAt);
        const monthIndex = getMonth(date); // 0 = Jan
        if (dataMap[monthIndex]) {
          dataMap[monthIndex].revenue += parseFloat(item.paymentPrice || 0);
          dataMap[monthIndex].ticket += 1;
        }
      });

      // Trả về mảng từ T1 đến T12
      return Object.values(dataMap);
    }
  };
  // Xử lý filter, và logic key trong json
  const dashboardData = useMemo(() => {
    if (!apiData) return null;

    const currentData = apiData[filterType];
    if (!currentData) return null;

    // --- MAPPING 3 BIỂU ĐỒ CARD (WIDGETS) ---
    const stats = {
      // 1. Tổng doanh thu (kèm %)
      revenue: currentData.payment.totalRevenue,
      revenuePct: currentData.payment.percentageSummary,

      // 2. Tổng số vé (kèm %)
      // Backend: week dùng 'numberTicket', year dùng 'countTicketYear' -> Cần fallback
      tickets: currentData.ticket.numberTicket || 0,
      ticketPct:
        filterType === "week"
          ? currentData.ticket.percentageTicket
          : currentData.ticket.percentageTicketYear,

      // 3. Giá vé trung bình (kèm %)
      avgPrice:
        filterType === "week"
          ? currentData.ticket.averageTicketPrice
          : currentData.ticket.averageTicketPriceYear,
      avgPricePct:
        filterType === "week"
          ? currentData.ticket.percentageTicketPrice
          : currentData.ticket.percentageTicketPriceYear,
    };

    // Biểu đồ hiện chi tiết doanh thu kĩ càng theo ngày và tháng
    const chartData = processChartData(
      currentData.payment.paymentData,
      filterType
    );

    // Biểu đồ doanh thu
    const rawRoutes = currentData.route.routeRevenueData || [];
    const routeData = rawRoutes
      .map((r, index) => ({
        name: `${r.departurePoint}-${r.arrivePoint}`,
        value: parseFloat(r.totalRevenue),
        color: ["#60a5fa", "#facc15", "#4ade80", "#f87171", "#a78bfa"][
          index % 5
        ],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const recentTransactions = apiData.income?.tickets || [];
    return { stats, chartData, routeData, recentTransactions };
  }, [apiData, filterType, t]);

  const handleExportExcel = () => {
    // 1. Chuẩn bị dữ liệu (Format lại key tiếng Việt cho đẹp)
    const excelData = dashboardData.chartData.map((item) => ({
      [t("revenue_report.export.col_time")]: item.name,
      [t("revenue_report.export.col_revenue")]: item.revenue,
      [t("revenue_report.export.col_tickets")]: item.ticket,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const fileName = `Report_FlightHK_${filterType}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // --- HÀM 2: XUẤT PDF ---
  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Link font Roboto (Hỗ trợ tiếng Việt)
    const fontURL =
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";

    try {
      // 2. Dùng await để tải font
      const response = await fetch(fontURL);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];

        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        // 4. Viết nội dung
        doc.setFontSize(18);
        doc.text(t("revenue_report.export.title"), 14, 22);
        doc.setFontSize(11);
        const periodText =
          filterType === "week"
            ? t("revenue_report.period_week")
            : t("revenue_report.period_year");
        doc.text(`${t("revenue_report.export.period")}: ${periodText}`, 14, 30);

        const dateStr = new Date().toLocaleDateString(
          i18n.language === "vi" ? "vi-VN" : "en-US"
        );
        doc.text(`${t("revenue_report.export.date")}: ${dateStr}`, 14, 36);

        // Summary
        const revenueStr = dashboardData.stats.revenue.toLocaleString();
        const ticketStr = dashboardData.stats.tickets.toLocaleString();

        doc.text(
          `${t("revenue_report.kpi_revenue")}: ${revenueStr} ${t("revenue_report.unit_currency")}`,
          14,
          45
        );
        doc.text(`${t("revenue_report.kpi_tickets")}: ${ticketStr}`, 14, 51);

        // 5. Vẽ bảng (Sử dụng autoTable trực tiếp)
        const tableColumn = [
          t("revenue_report.export.col_time"),
          t("revenue_report.export.col_revenue"),
          t("revenue_report.export.col_tickets"),
        ];
        const tableRows = dashboardData.chartData.map((item) => [
          item.name,
          item.revenue,
          item.ticket,
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 60,
          theme: "grid",
          styles: { font: "Roboto", fontStyle: "normal", fontSize: 10 }, // Set font cho bảng
          headStyles: { fillColor: [59, 130, 246] },
        });

        // 6. Lưu file
        doc.save(`Report_FlightHK_${filterType}.pdf`);
      };
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      toast.error(t("revenue_report.error_font"));
    }
  };
  if (loading)
    return (
      <div className="p-10 text-center text-white">
        {t("revenue_report.loading")}
      </div>
    );
  if (!dashboardData)
    return (
      <div className="p-10 text-center text-white">
        {t("revenue_report.no_data")}
      </div>
    );
  return (
    <div className="fade-in revenue-container">
      {/* --- HEADER: TITLE & FILTER --- */}
      <div className="report-header">
        <div>
          <h2 className="panel-title">{t("revenue_report.title")}</h2>
          <p className="sub-text">{t("revenue_report.subtitle")}</p>{" "}
        </div>

        <div className="report-actions">
          <div className="filter-group">
            <button
              className={`filter-btn ${filterType === "week" ? "active" : ""}`}
              onClick={() => setFilterType("week")}
            >
              {t("revenue_report.period_week")}{" "}
            </button>
            <button
              className={`filter-btn ${filterType === "year" ? "active" : ""}`}
              onClick={() => setFilterType("year")}
            >
              {t("revenue_report.period_year")}{" "}
            </button>
          </div>
          {/* NÚT EXCEL/ PDF */}
          <button className="btn-export excel" onClick={handleExportExcel}>
            <Download size={16} /> {t("revenue_report.btn_excel")}
          </button>

          <button className="btn-export pdf" onClick={handleExportPDF}>
            <FileText size={16} /> {t("revenue_report.btn_pdf")}
          </button>
        </div>
      </div>

      {/* --- SECTION 1: KPI CARDS --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box blue">
              <DollarSign size={24} />
            </div>
            <span
              className={`growth ${dashboardData.stats.revenuePct >= 0 ? "positive" : "negative"}`}
            >
              {dashboardData.stats.revenuePct >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {Math.abs(dashboardData.stats.revenuePct)}%
            </span>
          </div>
          <h3>{t("revenue_report.kpi_revenue")}</h3>{" "}
          <div className="value">
            {dashboardData.stats.revenue?.toLocaleString()}{" "}
            {t("revenue_report.unit_currency")}
          </div>
          <small>{t("revenue_report.compare_period")}</small>{" "}
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box green">
              <CreditCard size={24} />
            </div>
            <span
              className={`growth ${dashboardData.stats.ticketPct >= 0 ? "positive" : "negative"}`}
            >
              {dashboardData.stats.ticketPct >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {Math.abs(dashboardData.stats.ticketPct)}%
            </span>
          </div>
          <h3>{t("revenue_report.kpi_tickets")}</h3>{" "}
          <div className="value">
            {dashboardData.stats.tickets?.toLocaleString()}
          </div>
          <small>{t("revenue_report.unit_ticket")}</small>{" "}
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box yellow">
              <TrendingUp size={24} />
            </div>
            <span
              className={`growth ${dashboardData.stats.avgPricePct >= 0 ? "positive" : "negative"}`}
            >
              {dashboardData.stats.avgPricePct >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {Math.abs(dashboardData.stats.avgPricePct)}%
            </span>
          </div>
          <h3>{t("revenue_report.kpi_avg_price")}</h3>
          <div className="value">
            {dashboardData.stats.avgPrice?.toLocaleString()}{" "}
            {t("revenue_report.unit_currency")}
          </div>
          <small>{t("revenue_report.unit_vnd_ticket")}</small>
        </div>
      </div>

      {/* --- SECTION 2: MAIN CHART (AREA) --- */}
      <div className="glass-panel chart-section">
        <h3 className="panel-title-small">
          {t("revenue_report.chart_revenue_title")}
        </h3>{" "}
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dashboardData.chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#60a5fa"
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECTION 3: SPLIT VIEW (ROUTES & TABLE) --- */}
      <div className="split-layout">
        <div className="glass-panel">
          <h3 className="panel-title-small">
            {t("revenue_report.chart_routes_title")}
          </h3>{" "}
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={dashboardData.routeData}
                margin={{ left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#fff"
                  width={70}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {dashboardData.routeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG GIAO DỊCH GẦN NHẤT */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-3">
            <h3 className="panel-title-small" style={{ marginBottom: 0 }}>
              {t("revenue_report.recent_trans_title")}
            </h3>
            <button className="text-xs text-blue-400 hover:text-white">
              {t("revenue_report.view_all")}
            </button>
          </div>

          <div
            className="glass-table-container custom-scrollbar"
            style={{ maxHeight: 250, overflowY: "auto" }}
          >
            <table className="glass-table">
              <thead>
                <tr>
                  <th>{t("revenue_report.table.id")}</th>
                  <th>{t("revenue_report.table.customer")}</th>
                  <th>{t("revenue_report.table.amount")}</th>
                  <th>{t("revenue_report.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions.map((i) => (
                  <tr key={i}>
                    <td className="font-semibold text-xs">{i.ticketID}</td>
                    <td className="font-semibold text-sm">
                      {i.passengerInfo.passengerName}
                    </td>
                    <td className="text-green-400 font-bold text-sm">
                      {i.paymentInfo.paymentPrice}
                    </td>
                    <td>
                      <span className="status-badge state-active">
                        {i.ticketState === "valid"
                          ? t("revenue_report.status.completed")
                          : t("revenue_report.status.pending")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReports;
