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

const countTicketFunc = async () => {
  try {
    const weekRange = getCurrentWeekQuery();
    const previousRange = getPreviousWeekQuery();

    const countTicket = await Ticket.count({
      where: {
        ticketState: "valid",
        createdAt: {
          [Op.between]: [weekRange.startQuery, weekRange.endQuery],
        },
      },
    });

    const countTicketPrevious = await Ticket.count({
      where: {
        ticketState: "valid",
        createdAt: {
          [Op.between]: [previousRange.startQuery, previousRange.endQuery],
        },
      },
    });
    let percentage = null;
    if (countTicketPrevious !== 0) {
      if (countTicket !== 0) {
        percentage = (countTicket / countTicketPrevious - 1) * 100;
      } else {
        percentage = -100;
      }
    } else {
      percentage = 100;
      if (countTicket === 0) {
        percentage = 0;
      }
    }

    return {
      countTicket: countTicket,
      percentageTicket: percentage,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = { countTicketFunc };
