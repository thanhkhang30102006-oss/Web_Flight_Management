let memoryLogs = [];

const MAX_LOGS = 50;
const EXPIRE_TIME = 5 * 60 * 1000;

const tempLogger = {
  add: (type, message) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date(),
      type: type,
      message: message,
    };

    memoryLogs.unshift(newLog);

    if (memoryLogs.length > MAX_LOGS) {
      memoryLogs = memoryLogs.slice(0, MAX_LOGS);
    }
  },

  // Hàm lấy log (có lọc bỏ log quá cũ > 5 phút)
  get: () => {
    const now = Date.now();
    memoryLogs = memoryLogs.filter(
      (log) => now - new Date(log.timestamp).getTime() < EXPIRE_TIME
    );
    return memoryLogs;
  },
};

module.exports = tempLogger;
