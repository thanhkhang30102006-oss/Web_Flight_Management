const db = require("../../models");
const { sequelize } = require("../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");

const incomeRevenue = async () => {
  const tickets = await Ticket.findAll({
    attributes: ["ticketID", "ticketState"],
    include: [
      {
        model: db.Passenger,
        as: "passengerInfo",
        attributes: ["passengerName"],
      },
      {
        model: db.Payment,
        as: "paymentInfo",
        attributes: ["paymentPrice"],
      },
    ],
    order: [["createdAt", "DESC"]],
    raw: true,
    nest: true,
    where: {
      ticketState: "valid",
    },
    limit: 5,
  });

  if (tickets) {
    return {
      success: true,
      tickets: tickets,
    };
  } else {
    return {
      success: false,
    };
  }
};
module.exports = { incomeRevenue };
