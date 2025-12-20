const db = require("../../models");
const { sequelize } = require("../../models");
const Seat = db.Seat;
const Flight = db.FlightInformation;

const averageSeatInEachFlight = async () => {
  try {
    const flights = await Flight.findAll({
      attributes: [
        "flightNumber",
        "flightTotalSeat",
        [
          sequelize.fn("COUNT", sequelize.col("seats.seatNumber")),
          "totalSeats",
        ],
      ],
      include: [
        {
          model: Seat,
          as: "seats",
          attributes: [],
          where: { seatState: "occupied" },
        },
      ],
      group: ["flightNumber"],
      raw: true,
      subQuery: false,
    });
    let summaryAllFLightTotalSeat = 0;
    let summaryAllBookedSeats = 0;
    flights.forEach((flight) => {
      summaryAllFLightTotalSeat += Number(flight.flightTotalSeat) || 0;
      summaryAllBookedSeats += Number(flight.totalSeats) || 0;
    });

    const percent =
      summaryAllFLightTotalSeat > 0
        ? (summaryAllBookedSeats / summaryAllFLightTotalSeat) * 100
        : 0;
    return {
      percent: percent,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = {
  averageSeatInEachFlight,
};
