// Tính tổng giá tiền doanh thu trong tuần đó
// Tách nhỏ từng thứ doanh thu là bao nhiêu
const db = require("../models");
const { sequelize } = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const {
  getCurrentWeekQuery,
  getPreviousWeekQuery,
} = require("../../../utils/weekData");

const summaryRevenue = async () => {
  try {
    // Khoang theo tuan
    const weekRange = getCurrentWeekQuery();
    const previuousWeek = getPreviousWeekQuery();
    const paymentNows = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [weekRange.startQuery, weekRange.endQuery],
        },
        paymentState: "completed",
      },
      order: [["createdAt", "ASC"]],
      attributes: ["paymentID", "paymentPrice", "createdAt"],
      raw: true,
    });

    // Lấy doanh thu của tuần trước
    const paymentPrevious = await PaymentfindAll({
      where: {
        createdAt: {
          [Op.between]: [previuousWeek.startQuery, previuousWeek.endQuery],
        },
        paymentState: "completed",
      },
      order: [["createdAt", "ASC"]],
      attributes: ["paymentID", "paymentPrice", "createdAt"],
      raw: true,
    });
    if (paymentNows && paymentPrevious) {
      const sum = paymentNows.reduce((total, payment) => {
        return total + payment.paymentPrice;
      }, 0);
      const previousSum = paymentPrevious.reduce((total, payment) => {
        return total + payment.paymentPrice;
      });
      let percentage = null;
      if (previousSum !== 0) {
        if (sum !== 0) {
          percentage = (sum / previousSum - 1) * 100;
        } else {
          percentage = -100;
        }
      } else {
        percentage = 100;
      }
      return {
        success: true,
        payments: paymentNows,
        totalRevenue: sum,
        percentageSummary: percentage,
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = { summaryRevenue };
