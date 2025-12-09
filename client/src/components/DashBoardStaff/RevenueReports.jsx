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
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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

  return (
    <div className="fade-in revenue-container">
      {/* --- HEADER: TITLE & FILTER --- */}
      <div className="report-header">
        <div>
          <h2 className="panel-title">Báo cáo doanh thu & Hiệu suất</h2>
          <p className="sub-text">
            Theo dõi chỉ số tài chính theo thời gian thực
          </p>
        </div>

        <div className="report-actions">
          <div className="filter-group">
            <button
              className={`filter-btn ${filterType === "week" ? "active" : ""}`}
              onClick={() => setFilterType("week")}
            >
              Tuần này
            </button>
            <button
              className={`filter-btn ${filterType === "month" ? "active" : ""}`}
              onClick={() => setFilterType("month")}
            >
              Năm nay
            </button>
          </div>
          <button className="btn-export">
            <Download size={16} /> Xuất Excel
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
          <h3>Tổng Doanh Thu</h3>
          <div className="value">{totalRevenue.toLocaleString()} Triệu</div>
          <small>So với kỳ trước</small>
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
          <h3>Vé Đã Bán</h3>
          <div className="value">{totalTickets.toLocaleString()}</div>
          <small>Vé / Kỳ</small>
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
          <h3>Giá Vé TB</h3>
          <div className="value">
            {((totalRevenue / totalTickets) * 1000).toLocaleString()} k
          </div>
          <small>VND / Vé</small>
        </div>
      </div>

      {/* --- SECTION 2: MAIN CHART (AREA) --- */}
      <div className="glass-panel chart-section">
        <h3 className="panel-title-small">Biểu đồ tăng trưởng doanh thu</h3>
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
                formatter={(val) => `${val} Triệu VNĐ`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#60a5fa"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
                name="Doanh thu"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECTION 3: SPLIT VIEW (ROUTES & TABLE) --- */}
      <div className="split-layout">
        {/* CỘT TRÁI: TOP ROUTES (BAR CHART) */}
        <div className="glass-panel">
          <h3 className="panel-title-small">Top Chặng Bay (Doanh thu)</h3>
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
              Giao dịch gần đây
            </h3>
            <button className="text-xs text-blue-400 hover:text-white">
              Xem tất cả
            </button>
          </div>

          <div
            className="glass-table-container custom-scrollbar"
            style={{ maxHeight: 250, overflowY: "auto" }}
          >
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Khách</th>
                  <th>Số tiền</th>
                  <th>TT</th>
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
                      <span className="status-badge state-active">Xong</span>
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
