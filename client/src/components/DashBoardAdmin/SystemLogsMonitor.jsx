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

// Mock Logs ban đầu
const INITIAL_LOGS = [
  {
    id: 1,
    time: "10:30:05",
    level: "info",
    message: "System started successfully. Version 1.0.2",
  },
  {
    id: 2,
    time: "10:31:12",
    level: "info",
    message: "Connected to Database: MongoDB Atlas",
  },
  {
    id: 3,
    time: "10:35:00",
    level: "warn",
    message: "High latency detected on API /flight/search (405ms)",
  },
  {
    id: 4,
    time: "10:40:22",
    level: "error",
    message: "Payment Gateway Timeout: Transaction #9921 failed",
  },
  {
    id: 5,
    time: "10:42:10",
    level: "info",
    message: "User [admin] updated flight VN002 status",
  },
];

const SystemLogsMonitor = () => {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isPaused, setIsPaused] = useState(false);

  // Giả lập log chạy realtime
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog = generateRandomLog();
      setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Giữ tối đa 100 dòng
    }, 3000); // 3 giây sinh 1 log mới

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
          <button className="btn-action" onClick={() => setLogs([])}>
            <Trash2 size={14} /> Xóa Logs
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
