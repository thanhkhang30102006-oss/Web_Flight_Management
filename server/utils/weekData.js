const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require("date-fns");
const { toZonedTime, fromZonedTime } = require("date-fns-tz");
const TIME_ZONE = "Asia/Ho_Chi_Minh";
/**
@param {Date} dateObj
@param {Function} startFn
@param {Function} endFn
@param {Object} options
*/
const getRange = (dateObj, startFn, endFn, options = {}) => {
  const startVN = startFn(dateObj, options);
  const endVN = endFn(dateObj, options);
  return {
    startQuery: fromZonedTime(startVN, TIME_ZONE),
    endQuery: fromZonedTime(endVN, TIME_ZONE),
  };
};
const getZonedNow = () => toZonedTime(new Date(), TIME_ZONE);

const getCurrentWeekQuery = () => {
  return getRange(getZonedNow(), startOfWeek, endOfWeek, { weekStartsOn: 1 });
};
const getPreviousWeekQuery = () => {
  const prevDate = subWeeks(getZonedNow(), 1);
  return getRange(prevDate, startOfWeek, endOfWeek, { weekStartsOn: 1 });
};
const getCurrentMonthQuery = () => {
  return getRange(getZonedNow(), startOfMonth, endOfMonth);
};
const getCurrentYearQuery = () => {
  return getRange(getZonedNow(), startOfYear, endOfYear);
};
const getPreviousYearQuery = () => {
  const prevDate = subYears(getZonedNow(), 1);
  return getRange(prevDate, startOfYear, endOfYear);
};
module.exports = {
  getCurrentWeekQuery,
  getCurrentMonthQuery,
  getCurrentYearQuery,
  getPreviousWeekQuery,
  getPreviousYearQuery,
};
