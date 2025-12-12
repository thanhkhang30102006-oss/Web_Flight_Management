import React, { useState, useMemo } from "react";
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

// --- DỮ LIỆU GIẢ LẬP CHO BÁO CÁO ---
const MOCK_DATA = {
  week: [
    { name: "T2", revenue: 120, ticket: 150 },
    { name: "T3", revenue: 98, ticket: 120 },
    { name: "T4", revenue: 150, ticket: 180 },
    { name: "T5", revenue: 110, ticket: 140 },
    { name: "T6", revenue: 210, ticket: 250 },
    { name: "T7", revenue: 250, ticket: 300 },
    { name: "CN", revenue: 230, ticket: 280 },
  ],
  month: Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    revenue: Math.floor(Math.random() * 500) + 200, // Random 200-700
    ticket: Math.floor(Math.random() * 800) + 300,
  })),
};

const TOP_ROUTES = [
  { name: "HAN-SGN", value: 4500, color: "#60a5fa" },
  { name: "SGN-DAD", value: 2300, color: "#facc15" },
  { name: "HAN-DAD", value: 1800, color: "#4ade80" },
  { name: "SGN-PQC", value: 1200, color: "#f87171" },
];

const RevenueReports = () => {
  const { t, i18n } = useTranslation();
  const [filterType, setFilterType] = useState("week"); // 'week' | 'month'

  // Chọn dữ liệu dựa trên filter
  const currentData = useMemo(() => MOCK_DATA[filterType], [filterType]);

  // Tính tổng
  const totalRevenue = useMemo(
    () => currentData.reduce((acc, curr) => acc + curr.revenue, 0),
    [currentData]
  );

  const totalTickets = useMemo(
    () => currentData.reduce((acc, curr) => acc + curr.ticket, 0),
    [currentData]
  );

  const handleExportExcel = () => {
    // 1. Chuẩn bị dữ liệu (Format lại key tiếng Việt cho đẹp)
    const excelData = currentData.map((item) => ({
      [t("report.fileExport.colTime")]: item.name,
      [t("report.fileExport.colRevenue")]: item.revenue,
      [t("report.fileExport.colTickets")]: item.ticket,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Report_FlightHK_${filterType}.xlsx`);

    // 4. Xuất file
    const fileName = `BaoCao_FlightHK_${
      filterType === "week" ? "Tuan" : "Nam"
    }.xlsx`;
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
        doc.text(t("report.fileExport.title"), 14, 22);

        doc.setFontSize(11);
        const periodText =
          filterType === "week"
            ? t("report.fileExport.periodWeek")
            : t("report.fileExport.periodYear");
        doc.text(`${t("report.fileExport.period")}: ${periodText}`, 14, 30);

        const dateStr = new Date().toLocaleDateString(
          i18n.language === "vi" ? "vi-VN" : "en-US"
        );
        doc.text(`${t("report.fileExport.exportDate")}: ${dateStr}`, 14, 36);

        const revenueStr = totalRevenue.toLocaleString(
          i18n.language === "vi" ? "vi-VN" : "en-US"
        );
        const ticketStr = totalTickets.toLocaleString(
          i18n.language === "vi" ? "vi-VN" : "en-US"
        );

        doc.text(
          `${t("report.fileExport.totalRevenue")}: ${revenueStr} ${t(
            "report.fileExport.currency"
          )}`,
          14,
          45
        );
        doc.text(
          `${t("report.fileExport.totalTickets")}: ${ticketStr} ${t(
            "report.fileExport.ticketUnit"
          )}`,
          14,
          51
        );

        // 5. Vẽ bảng (Sử dụng autoTable trực tiếp)
        const tableColumn = [
          t("report.fileExport.colTime"),
          t("report.fileExport.colRevenue"),
          t("report.fileExport.colTickets"),
        ];
        const tableRows = currentData.map((item) => [
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
      alert("Không thể tải font. Vui lòng kiểm tra mạng.");
    }
  };

  return (
    <div className="fade-in revenue-container">
      {/* --- HEADER: TITLE & FILTER --- */}
      <div className="report-header">
        <div>
          <h2 className="panel-title">{t("sidebar.revenueReports")}</h2>
          <p className="sub-text">{t("report.subTitle")}</p>
        </div>

        <div className="report-actions">
          <div className="filter-group">
            <button
              className={`filter-btn ${filterType === "week" ? "active" : ""}`}
              onClick={() => setFilterType("week")}
            >
              {t("report.fileExport.periodWeek")}
            </button>
            <button
              className={`filter-btn ${filterType === "month" ? "active" : ""}`}
              onClick={() => setFilterType("month")}
            >
              {t("report.fileExport.periodYear")}
            </button>
          </div>
          {/* NÚT EXCEL */}
          <button className="btn-export excel" onClick={handleExportExcel}>
            <Download size={16} /> Excel
          </button>

          {/* NÚT PDF (Thêm mới) */}
          <button className="btn-export pdf" onClick={handleExportPDF}>
            <FileText size={16} /> PDF
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
            <span className="growth positive">
              <ArrowUpRight size={16} /> +12.5%
            </span>
          </div>
          <h3>{t("report.fileExport.totalRevenue")}</h3>
          <div className="value">
            {totalRevenue.toLocaleString()}
            {t("report.fileExport.currency")}
          </div>
          <small>{t("report.comparePeriod")}</small>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box green">
              <CreditCard size={24} />
            </div>
            <span className="growth positive">
              <ArrowUpRight size={16} /> +8.2%
            </span>
          </div>
          <h3>{t("report.fileExport.totalTickets")}</h3>
          <div className="value">{totalTickets.toLocaleString()}</div>
          <small>{t("report.ticketPerPeriod")}</small>
        </div>

        <div className="stat-card">
          <div className="card-top">
            <div className="icon-box yellow">
              <TrendingUp size={24} />
            </div>
            <span className="growth negative">
              <ArrowDownRight size={16} /> -2.1%
            </span>
          </div>
          <h3>{t("report.avgTicketPrice")}</h3>
          <div className="value">
            {((totalRevenue / totalTickets) * 1000).toLocaleString()} k
          </div>
          <small>{t("report.vndPerTicket")}</small>
        </div>
      </div>

      {/* --- SECTION 2: MAIN CHART (AREA) --- */}
      <div className="glass-panel chart-section">
        <h3 className="panel-title-small">{t("report.growthChart")}</h3>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <AreaChart
              data={currentData}
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
              <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}Tr`} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#fff",
                }}
                formatter={(val) => `${val} ${t("report.fileExport.currency")}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#60a5fa"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
                name={t("report.colRevenue")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECTION 3: SPLIT VIEW (ROUTES & TABLE) --- */}
      <div className="split-layout">
        {/* CỘT TRÁI: TOP ROUTES (BAR CHART) */}
        <div className="glass-panel">
          <h3 className="panel-title-small">{t("report.topRoutes")}</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={TOP_ROUTES}
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
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ background: "#1e293b", border: "none" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {TOP_ROUTES.map((entry, index) => (
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
              {t("report.recentTransactions")}{" "}
            </h3>
            <button className="text-xs text-blue-400 hover:text-white">
              {t("report.viewAll")}{" "}
            </button>
          </div>

          <div
            className="glass-table-container custom-scrollbar"
            style={{ maxHeight: 250, overflowY: "auto" }}
          >
            <table className="glass-table">
              <thead>
                <tr>
                  <th>{t("report.transId")}</th>
                  <th>{t("report.customer")}</th>
                  <th>{t("report.amount")}</th>
                  <th>{t("report.status")}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="font-semibold text-xs">TRX-09{i}</td>
                    <td className="font-semibold text-sm">
                      Nguyen Van {String.fromCharCode(64 + i)}
                    </td>
                    <td className="text-green-400 font-bold text-sm">
                      {(1000 + i * 500).toLocaleString()}k
                    </td>
                    <td>
                      <span className="status-badge state-active">
                        {t("report.statusDone")}
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
