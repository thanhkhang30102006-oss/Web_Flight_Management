import React from "react";
import {
  Users,
  Ticket,
  Activity,
  TrendingUp,
  DollarSign,
  Server,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../pages/AdminDashboard.css";
import "./Overview.css";

// Dữ liệu mẫu
const REVENUE_DATA = [
  { month: "T1", revenue: 450 },
  { month: "T2", revenue: 520 },
  { month: "T3", revenue: 480 },
  { month: "T4", revenue: 600 },
  { month: "T5", revenue: 750 },
  { month: "T6", revenue: 900 },
  { month: "T7", revenue: 950 },
  { month: "T8", revenue: 880 },
  { month: "T9", revenue: 650 },
  { month: "T10", revenue: 600 },
  { month: "T11", revenue: 700 },
  { month: "T12", revenue: 1100 },
];

const Overview = () => {
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        height: "100%",
      }}
    >
      {/* 1. KPI CARDS */}
      <div className="kpi-container">
        {/* Người dùng mới */}
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-blue">
            <Users size={28} />
          </div>
          <div className="kpi-details">
            <h3>Người dùng mới</h3>
            <div className="value">1,254</div>
            <div className="sub-text text-up">
              <TrendingUp size={14} /> +12.5% tháng này
            </div>
          </div>
        </div>

        {/* Vé đã bán */}
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-purple">
            <Ticket size={28} />
          </div>
          <div className="kpi-details">
            <h3>Vé bán ra (2025)</h3>
            <div className="value">45,892</div>
            <div className="sub-text text-up">
              <TrendingUp size={14} /> +8.2% tăng trưởng
            </div>
          </div>
        </div>

        {/* Trạng thái hệ thống */}
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-green">
            <Activity size={28} />
          </div>
          <div className="kpi-details">
            <h3>Trạng thái hệ thống</h3>
            <div
              className="value"
              style={{ fontSize: "22px", color: "#4ade80" }}
            >
              Ổn định
            </div>
            <div className="sub-text" style={{ color: "#94a3b8" }}>
              <Server size={12} style={{ display: "inline", marginRight: 4 }} />
              Uptime: 99.98%
            </div>
          </div>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ DOANH THU */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>
            <DollarSign size={24} color="#fbbf24" />
            Tổng Doanh Thu (Triệu VNĐ)
          </h2>
          <select
            className="glass-input"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "5px 10px",
              borderRadius: 8,
              width: "500px",
            }}
          >
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>

        <div style={{ flex: 1, width: "100%", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
