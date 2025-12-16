import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Thermometer,
} from "lucide-react";
import { DB_FLIGHTS, MOCK_REVENUE_WEEKLY } from "../../data/staffMockData";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AIRPORT_COORDS, getWeatherIcon } from "../../data/weatherHelper";

// --- 1. HÀM XỬ LÝ DỮ LIỆU (HELPER) ---
const processHourlyFlights = (flights) => {
  if (!flights) return [];
  // Tạo mảng 24 giờ với giá trị 0
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    count: 0,
  }));

  flights.forEach((f) => {
    if (f.departureTime) {
      // Lấy giờ từ "14:30:00" -> 14. Dùng try-catch hoặc check kỹ để tránh lỗi data rác
      try {
        const hour = parseInt(f.departureTime.split(":")[0]);
        if (hours[hour]) {
          hours[hour].count += 1;
        }
      } catch (e) {
        console.error("Lỗi format giờ:", f.departureTime);
      }
    }
  });
  return hours;
};
// Xử lý thống kê loại máy bay
const processPlaneTypes = (flights) => {
  const counts = {};
  flights.forEach((f) => {
    counts[f.planeType] = (counts[f.planeType] || 0) + 1;
  });
  // Chuyển về dạng mảng cho Recharts
  return Object.keys(counts).map((type) => ({
    name: type,
    value: counts[type],
  }));
};

// Xử lý tuyến bay phổ biến
const processTopRoutes = (flights) => {
  const routes = {};
  flights.forEach((f) => {
    const route = `${f.departurePoint} - ${f.arrivePoint}`;
    routes[route] = (routes[route] || 0) + 1;
  });
  return Object.keys(routes)
    .map((r) => ({
      name: r,
      flights: routes[r],
    }))
    .sort((a, b) => b.flights - a.flights)
    .slice(0, 5); // Lấy top 5
};

// Màu cho biểu đồ tròn
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

// --- COMPONENT CON: WEATHER WIDGET ---
const Weather3Regions = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const locations = ["HAN", "DAD", "SGN"];
        const promises = locations.map((code) => {
          const { lat, lon } = AIRPORT_COORDS[code];
          return fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
          ).then((res) => res.json());
        });

        const results = await Promise.all(promises);

        const formattedData = results.map((data, index) => ({
          code: locations[index],
          name: AIRPORT_COORDS[locations[index]].name,
          temp: data.current_weather.temperature,
          wCode: data.current_weather.weathercode,
        }));

        setWeatherData(formattedData);
      } catch (error) {
        console.error("Lỗi lấy thời tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading)
    return (
      <div className="weather-loading">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="weather-3-regions">
      {weatherData.map((item) => (
        <div key={item.code} className="weather-item-mini">
          <div className="city-name">{item.name}</div>
          <div className="weather-icon">{getWeatherIcon(item.wCode)}</div>
          <div className="temp-val">{item.temp}°C</div>
        </div>
      ))}
    </div>
  );
};

const DashboardOverview = () => {
  const hourlyData = useMemo(() => processHourlyFlights(DB_FLIGHTS), []);
  const planeData = useMemo(() => processPlaneTypes(DB_FLIGHTS), []);
  const routeData = useMemo(() => processTopRoutes(DB_FLIGHTS), []);

  const totalActive = DB_FLIGHTS.filter(
    (f) => f.flightState === "active"
  ).length;
  const totalDelayed = DB_FLIGHTS.filter(
    (f) => f.flightState === "delayed"
  ).length;
  const totalCancelled = DB_FLIGHTS.filter(
    (f) => f.flightState === "cancelled"
  ).length;

  const chartData = [
    { name: "Active", value: totalActive, color: "#4ade80" },
    { name: "Delayed", value: totalDelayed, color: "#facc15" },
    { name: "Cancelled", value: totalCancelled, color: "#f87171" },
  ];

  return (
    <div className="glass-panel fade-in overview-panel">
      <h2 className="welcome-text">Xin chào, Staff Manager!</h2>
      <p className="sub-text">
        Cập nhật tình hình vận hành dựa trên cơ sở dữ liệu mới nhất.
      </p>

      {/* --- GRID 4 BIỂU ĐỒ --- */}
      <div className="dashboard-charts-grid">
        {/* 1. BIỂU ĐỒ MẬT ĐỘ (Dùng Area Chart cho đẹp) */}
        <div className="chart-card">
          <h3 className="chart-title">Mật độ chuyến bay trong ngày (24h)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorFlight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
                interval={3} // Chỉ hiện mốc giờ: 0, 3, 6, 9... cho đỡ rối
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: "5px" }}
                cursor={{
                  stroke: "#60a5fa",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#60a5fa"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFlight)"
                name="Số chuyến"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. BIỂU ĐỒ CỘT: Doanh thu tuần */}
        <div className="chart-card">
          <h3 className="chart-title">Doanh thu 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MOCK_REVENUE_WEEKLY}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) => `${value / 1000000}M`} // Rút gọn số liệu
                width={40}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                }
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#4ade80"
                radius={[4, 4, 0, 0]}
                name="Doanh thu"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. BIỂU ĐỒ TRÒN: Phân bổ đội bay */}
        <div className="chart-card">
          <h3 className="chart-title">Đội bay đang vận hành</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={planeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {planeData.map((entry, index) => (
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
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. BIỂU ĐỒ CỘT NGANG: Top chặng bay */}
        <div className="chart-card">
          <h3 className="chart-title">Chặng bay phổ biến</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={routeData} margin={{ left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                horizontal={false}
              />
              <XAxis type="number" stroke="#94a3b8" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                width={80}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="flights"
                fill="#facc15"
                radius={[0, 4, 4, 0]}
                barSize={20}
                name="Số chuyến"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- PHẦN 2: BIỂU ĐỒ & THỜI TIẾT --- */}
        <div className="chart-card">
          {/* Widget Thời tiết */}
          <h3 className="panel-title-small">
            <Thermometer
              size={16}
              style={{ display: "inline", marginBottom: -2 }}
            />{" "}
            Thời tiết 3 miền
          </h3>
          <Weather3Regions />

          <div className="weather-note">
            *Dữ liệu cập nhật từ Open-Meteo API
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
