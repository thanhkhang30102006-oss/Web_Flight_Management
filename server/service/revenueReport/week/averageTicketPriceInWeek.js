const db = require("../../../models");
const { sequelize } = require("../../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const {
  getCurrentWeekQuery,
  getPreviousWeekQuery,
} = require("../../../utils/weekData");
const averageTicketPriceInWeek = async () => {
  try {
    const weekRange = getCurrentWeekQuery();
    const previousRange = getPreviousWeekQuery();
    const paymentsCurrent = await Payment.findAll({
      attributes: ["paymentID", "paymentPrice"],
      include: [
        {
          model: db.Ticket,
          as: "tickets",
          required: true,
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [weekRange.startQuery, weekRange.endQuery],
            },
          },
        },
      ],
      group: ["Payment.paymentID", "Payment.paymentPrice"],
    });

    const paymentsPrevious = await Payment.findAll({
      attributes: ["paymentID", "paymentPrice"],
      include: [
        {
          model: db.Ticket,
          as: "tickets",
          required: true,
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [previousRange.startQuery, previousRange.endQuery],
            },
          },
        },
      ],
      group: ["Payment.paymentID", "Payment.paymentPrice"],
    });

    if (paymentsCurrent && paymentsPrevious) {
      const totalRevenueCurrent = paymentsCurrent.reduce((sum, payment) => {
        return sum + Number(payment.paymentPrice);
      }, 0);

      const totalCountCurrent = paymentsCurrent.length;

      const averagePayment =
        totalCountCurrent > 0 ? totalRevenueCurrent / totalCountCurrent : 0;
      // Tuần trước
      const totalRevenuePrevious = paymentsPrevious.reduce((sum, payment) => {
        return sum + Number(payment.paymentPrice);
      }, 0);

      const totalCountPrevious = paymentsPrevious.length;

      const averagePaymentPrevious =
        totalCountPrevious > 0 ? totalRevenuePrevious / totalCountPrevious : 0;

      let percentage = null;
      if (averagePaymentPrevious !== 0) {
        if (averagePayment !== 0) {
          percentage = (averagePayment / averagePaymentPrevious - 1) * 100;
        } else {
          percentage = -100;
        }
      } else {
        percentage = 100;
        if (averagePayment === 0) {
          percentage = 0;
        }
      }

      return {
        averageTicketPrice: averagePayment,
        percentageTicketPrice: percentage,
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
module.exports = { averageTicketPriceInWeek };
