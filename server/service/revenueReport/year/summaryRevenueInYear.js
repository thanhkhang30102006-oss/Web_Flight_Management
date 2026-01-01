const db = require("../models");
const { sequelize } = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const {
  getCurrentYearQuery,
  getPreviousYearQuery,
} = require("../../../utils/weekData");

const summaryRevenueYear = async () => {
  try {
    const yearRange = getCurrentYearQuery();
    const previousYear = getPreviousYearQuery();
    const paymentNowsYear = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [yearRange.startQuery, yearRange.endQuery],
        },
        paymentState: "completed",
      },
      order: [["createdAt", "ASC"]],
      attributes: ["paymentID", "paymentPrice", "createdAt"],
      raw: true,
    });

    const paymentPreviousYear = await PaymentfindAll({
      where: {
        createdAt: {
          [Op.between]: [previousYear.startQuery, previousYear.endQuery],
        },
        paymentState: "completed",
      },
      order: [["createdAt", "ASC"]],
      attributes: ["paymentID", "paymentPrice", "createdAt"],
      raw: true,
    });

    if (paymentNowsYear && paymentPreviousYear) {
      const sum = paymentNowsYear.reduce((total, payment) => {
        return total + payment.paymentPrice;
      }, 0);
      const previousSum = paymentPreviousYear.reduce((total, payment) => {
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
        payments: paymentNowsYear,
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
module.exports = { summaryRevenueYear };
