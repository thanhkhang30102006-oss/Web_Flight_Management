const db = require("../../models");
const { sequelize } = require("../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const { Op } = require("sequelize");
const popularRoutesWithMostPassenger = async () => {
  const flights = await Flight.findAll({
    attributes: [
      "departurePoint",
      "arrivePoint",
      "flightTotalSeat",
      "flightNumber",
      [
        sequelize.literal(
          `COUNT(CASE WHEN seats.seatState = 'occupied' THEN 1 END)`
        ),
        "totalPassenger",
      ],
    ],
    include: [
      {
        model: Seat,
        as: "seats",
        attributes: [],
        where: { seatState: "occupied" },
        required: false,
      },
    ],
    where: {
      [Op.or]: [{ flightState: "active" }, { flightState: "delayed" }],
    },
    group: ["departurePoint", "arrivePoint", "flightTotalSeat", "flightNumber"],
    order: [[[sequelize.literal("totalPassenger"), "DESC"]]],
    raw: true,
  });

  if (!flights || flights.length === 0) {
    console.log("Không có chuyến bay nào cả");
    return [];
  }
  return {
    flightPopular: flights,
  };
};
module.exports = { popularRoutesWithMostPassenger };
