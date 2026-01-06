const db = require("../../../models");
const { sequelize } = require("../../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { getCurrentYearQuery } = require("../../../utils/weekData");

const revenueInRouteYear = async () => {
  try {
    const weekRange = getCurrentYearQuery();

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
      subQuery: false,
      raw: true,
      limit: 4,
    });

    const formattedResult = flights.map((flight) => ({
      ...flight,
      totalRevenue: flight.totalRevenue ? parseInt(flight.totalRevenue) : 0,
    }));

    return {
      formattedResultYear: formattedResult,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = { revenueInRouteYear };
