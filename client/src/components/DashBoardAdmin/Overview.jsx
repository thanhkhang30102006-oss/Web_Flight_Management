import React from "react";
import {
  Users,
  Ticket,
  Activity,
  TrendingUp,
  TrendingDown,
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
import { useEffect, useState } from "react";
// Dữ liệu mẫu

const Overview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`api/admin/chart`);
        const result = await response.json();
        if (result.status === "success") {
          setDashboardData(result.data.year);
        }
        console.log("API Response:", result);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const processChartData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: `T${i + 1}`,
      revenue: 0,
      rawRevenue: 0,
    }));

    if (dashboardData && dashboardData.paymentData) {
      dashboardData.paymentData.forEach((payment) => {
        const date = new Date(payment.createdAt);
        const monthIndex = date.getMonth();

        if (monthlyData[monthIndex]) {
          const price = Number(payment.paymentPrice);
          monthlyData[monthIndex].rawRevenue += price;
          monthlyData[monthIndex].revenue += price / 1000000;
        }
      });
    }

    return monthlyData;
  };
  const chartData = processChartData();
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };
  const renderGrowth = (percentage) => {
    // Nếu percentage null hoặc undefined thì mặc định 0
    const percentVal = percentage ? Number(percentage) : 0;
    const isPositive = percentVal >= 0;

    return (
      <div
        className={`sub-text ${isPositive ? "text-up" : "text-down"}`}
        style={{
          color: isPositive ? "#4ade80" : "#f87171",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(percentVal).toFixed(1)}% năm nay
      </div>
    );
  };
  if (loading) return <div className="text-white p-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-400 p-5">Lỗi: {error}</div>;

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
            <h3>Người dùng mới (Năm nay)</h3>
            <div className="value">
              {formatCurrency(dashboardData?.numberPassenger || 0)}
            </div>
            {renderGrowth(dashboardData?.percentagePassengerYear)}
          </div>
        </div>

        {/* Vé đã bán */}
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-purple">
            <Ticket size={28} />
          </div>
          <div className="kpi-details">
            <h3>Vé bán ra (2025)</h3>
            <div className="value">
              {formatCurrency(dashboardData?.numberTicket || 0)}
            </div>
            {renderGrowth(dashboardData?.percentageTicketYear)}
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
            <option>Năm nay</option>
          </select>
        </div>

        <div style={{ flex: 1, width: "100%", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
