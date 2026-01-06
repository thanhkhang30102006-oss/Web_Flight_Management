const db = require("../../../models");
const { sequelize } = require("../../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { getCurrentWeekQuery } = require("../../../utils/weekData");

const revenueInRoute = async () => {
  try {
    const weekRange = getCurrentWeekQuery();

    const flights = await Flight.findAll({
      attributes: [
        "flightNumber",
        "departurePoint",
        "arrivePoint",
        [
          sequelize.fn(
            "SUM",
            sequelize.col("tickets->paymentInfo.paymentPrice")
          ),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: db.Ticket,
          as: "tickets",
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [weekRange.startQuery, weekRange.endQuery],
            },
          },
          required: false,
          include: [
            {
              model: db.Payment,
              as: "paymentInfo",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "FlightInformation.flightNumber",
        "FlightInformation.departurePoint",
        "FlightInformation.arrivePoint",
      ],
      order: [[sequelize.literal("totalRevenue"), "DESC"]],
      subQuery: false,
      raw: true,
      limit: 4,
    });

    const formattedResult = flights.map((flight) => ({
      ...flight,
      totalRevenue: flight.totalRevenue ? parseInt(flight.totalRevenue) : 0,
    }));

    return {
      formattedCurrent: formattedResult,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = { revenueInRoute };
