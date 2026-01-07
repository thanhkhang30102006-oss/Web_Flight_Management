import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Thermometer } from "lucide-react";
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
  Label,
  LabelList,
} from "recharts";
import { AIRPORT_COORDS, getWeatherIcon } from "../../data/weatherHelper";
import { format, parseISO } from "date-fns";
// --- 1. HÀM XỬ LÝ DỮ LIỆU (HELPER) ---
const processHourlyFlights = (groupFlight) => {
  if (!groupFlight) return [];
  // Tạo mảng 24 giờ với giá trị 0
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    count: 0,
  }));

  if (Array.isArray(groupFlight)) {
    groupFlight.forEach((item) => {
      const hourIndex = item.departureHour;
      if (hours[hourIndex]) {
        hours[hourIndex].count = parseInt(item.totalFlights);
      }
    });
  }
  return hours;
};

// Xử lý thống kê loại máy bay
const processPlaneTypes = (flightsData) => {
  if (!Array.isArray(flightsData)) return [];
  return flightsData.map((item) => ({
    name: item.planeType,
    value: parseInt(item.totalPlaneType),
  }));
};
// Xử lý báo cáo doanh thu theo tuần

const processRevenueRaw = (paymentsData) => {
  const stats = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  if (Array.isArray(paymentsData)) {
    paymentsData.forEach((payment) => {
      const date = parseISO(payment.createdAt);
      const dayName = format(date, "EEEE"); // Trả về "Monday", "Tuesday"...
      if (stats[dayName] !== undefined) {
        stats[dayName] += Number(payment.paymentPrice);
      }
    });
  }
  const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return order.map((day) => ({
    rawDay: day, // Key dùng để dịch
    revenue: stats[day],
  }));
};
// Xử lý tuyến bay phổ biến
const processTopRoutes = (routesData) => {
  if (!Array.isArray(routesData)) return [];
  return routesData
    .map((item) => ({
      name: `${item.departurePoint} - ${item.arrivePoint}`,
      flights: parseInt(item.totalFlights),
    }))
    .slice(0, 5);
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
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState({
    groupFlight: [],
    payments: [],
    flights: [],
    popularRoutes: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Thay đường dẫn API của bạn vào đây
        const response = await fetch(`api/staff/chart/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.data && result.success) {
          setRealData(result.data);
        }
      } catch (error) {
        console.error("Lỗi khi fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  const hourlyData = useMemo(
    () => processHourlyFlights(realData.groupFlight),
    [realData.groupFlight]
  );
  const revenueData = useMemo(() => {
    const raw = processRevenueRaw(realData.payments);
    return raw.map((item) => ({
      ...item,
      displayDay: t(`days.${item.rawDay}`),
    }));
  }, [realData.payments, t]);
  const planeData = useMemo(
    () => processPlaneTypes(realData.flights),
    [realData.flights]
  );
  const routeData = useMemo(
    () => processTopRoutes(realData.popularRoutes),
    [realData.popularRoutes]
  );

  const formatCurrency = (value) => {
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    const currency = i18n.language === "vi" ? "VND" : "USD";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="glass-panel fade-in overview-panel">
      <h2 className="welcome-text">{t("dashboard.welcome")}</h2>
      <p className="sub-text">{t("dashboard.subtitle")}</p>

      {/* --- GRID 4 BIỂU ĐỒ --- */}
      <div className="dashboard-charts-grid">
        {/* 1. BIỂU ĐỒ MẬT ĐỘ (Dùng Area Chart cho đẹp) */}
        <div className="chart-card">
          <h3 className="chart-title">{t("dashboard.density_title")}</h3>{" "}
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
                interval={3}
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
                name={t("dashboard.density_label")}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. BIỂU ĐỒ CỘT: Doanh thu tuần */}
        <div className="chart-card">
          <h3 className="chart-title">{t("dashboard.revenue_title")}</h3>{" "}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="displayDay" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) => `${value / 1000000}M`}
                width={40}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
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
                name={t("dashboard.revenue_label")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. BIỂU ĐỒ TRÒN: Phân bổ đội bay */}
        <div className="chart-card">
          <h3 className="chart-title">{t("dashboard.fleet_title")}</h3>{" "}
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
                label={{ fill: "#e2e8f0", fontSize: 12, fontWeight: "bold" }}
                labelLine={{ stroke: "#e2e8f0" }}
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
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  color: "#e2e8f0",
                  fontSize: "14px",
                  paddingTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. BIỂU ĐỒ CỘT NGANG: Top chặng bay */}
        <div className="chart-card">
          <h3 className="chart-title">{t("dashboard.routes_title")}</h3>{" "}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              layout="vertical"
              data={routeData}
              margin={{ left: 20, right: 15 }}
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
                stroke="#94a3b8"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  color: "#fff",
                }}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />
              <Bar
                dataKey="flights"
                fill="#facc15"
                radius={[0, 4, 4, 0]}
                barSize={20}
                name={t("dashboard.density_label")}
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
            {t("dashboard.weather_title")}
          </h3>
          <Weather3Regions />
          <div className="weather-note">{t("dashboard.weather_note")}</div>{" "}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
