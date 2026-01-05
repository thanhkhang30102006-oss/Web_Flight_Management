const tempLogger = require("../utils/tempLogger");

const getRecentLogs = (req, res) => {
  res.json(tempLogger.get());
};
const addLog = (req, res) => {
  const { level, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Thiếu message" });
  }

  const logLevel = level ? level.toUpperCase() : "INFO";

  tempLogger.add(logLevel, message);

  res.json({ success: true });
};
module.exports = { getRecentLogs, addLog };
