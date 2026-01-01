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

const countTicket = async () => {
  try {
    const weekRange = getCurrentWeekQuery();
    const previousRange = getPreviousWeekQuery();

    const countTicket = await Ticket.count({
      where: {
        createdAt: {
          [Op.between]: [weekRange.startQuery, weekRange.endQuery],
        },
        ticketState: "",
      },
    });
  } catch (error) {}
};
