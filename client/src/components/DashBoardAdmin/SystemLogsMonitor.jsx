import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  AlertTriangle,
  Trash2,
  Pause,
  Play,
  RefreshCcw,
} from "lucide-react";
import "./SystemLogsMonitor.css";

const SystemLogsMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Giả lập log chạy realtime
  useEffect(() => {
    if (isPaused) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/logs/live");
        const data = await res.json();

        const formattedLogs = data.map((log) => ({
          id: log.id,
          time: new Date(log.timestamp).toLocaleTimeString("vi-VN"),
          level: log.type.toUpperCase(),
          message: log.message,
        }));
        setLogs(formattedLogs);
      } catch (e) {
        console.error(e);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // 2 giây cập nhật 1 lần
    return () => clearInterval(interval);
  }, [isPaused]);

  // Hàm sinh log ngẫu nhiên
  const generateRandomLog = () => {
    const levels = ["info", "info", "info", "warn", "error"]; // Tỉ lệ info nhiều hơn
    const messages = [
      "New booking created by user",
      "API /ticket/checkin responded in 120ms",
      "Database backup completed",
      "Failed login attempt from IP 192.168.1.5",
      "Email sent to customer successfully",
    ];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const now = new Date();
    return {
      id: Date.now(),
      time: now.toLocaleTimeString(),
      level: level,
      message: messages[Math.floor(Math.random() * messages.length)],
    };
  };

  return (
    <div
      className="fade-in"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <h2 className="panel-title" style={{ marginBottom: "20px" }}>
        Giám sát Hệ thống (System Monitor)
      </h2>

      {/* 1. HEALTH CARDS */}
      <div className="system-health-grid">
        <div className="health-card">
          <div
            style={{
              padding: 10,
              background: "rgba(59, 130, 246, 0.2)",
              borderRadius: "50%",
              color: "#60a5fa",
            }}
          >
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>CPU Usage</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>12%</div>
          </div>
        </div>

        <div className="health-card">
          <div
            style={{
              padding: 10,
              background: "rgba(168, 85, 247, 0.2)",
              borderRadius: "50%",
              color: "#c084fc",
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Memory (RAM)
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>4.2 GB</div>
          </div>
        </div>

        <div className="health-card">
          <div
            style={{
              padding: 10,
              background: "rgba(34, 197, 94, 0.2)",
              borderRadius: "50%",
              color: "#4ade80",
            }}
          >
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Database</div>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}
            >
              Connected
            </div>
          </div>
        </div>

        <div className="health-card">
          <div
            style={{
              padding: 10,
              background: "rgba(251, 191, 36, 0.2)",
              borderRadius: "50%",
              color: "#fbbf24",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Errors (24h)
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>5</div>
          </div>
        </div>
      </div>

      {/* 2. LOG TERMINAL HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Live Logs</h3>
          <span
            className={`badge ${isPaused ? "badge-blocked" : "badge-active"}`}
            style={{ fontSize: "10px" }}
          >
            {isPaused ? "PAUSED" : "LIVE"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-action" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play size={14} /> : <Pause size={14} />}{" "}
            {isPaused ? "Tiếp tục" : "Tạm dừng"}
          </button>
        </div>
      </div>

      {/* 3. TERMINAL CONTENT */}
      <div className="log-terminal custom-scrollbar">
        {logs.length === 0 && (
          <div
            style={{ textAlign: "center", color: "#64748b", padding: "20px" }}
          >
            Log trống...
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="log-row fade-in">
            <div className="log-time">[{log.time}]</div>
            <div className={`log-level ${log.level}`}>
              {log.level.toUpperCase()}
            </div>
            <div className="log-message">{log.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogsMonitor;
