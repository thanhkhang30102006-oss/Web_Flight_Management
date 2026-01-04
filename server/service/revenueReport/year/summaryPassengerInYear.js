const db = require("../../../models");
const { sequelize } = require("../../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const Passenger = db.Passenger;
const { Op } = require("sequelize");
const {
  getCurrentYearQuery,
  getPreviousYearQuery,
} = require("../../../utils/weekData");

const countPassengerYearFunc = async () => {
  try {
    const weekRange = getCurrentYearQuery();
    const previousRange = getPreviousYearQuery();

    const countPassenger = await Passenger.count({
      where: {
        createdAt: {
          [Op.between]: [weekRange.startQuery, weekRange.endQuery],
        },
      },
    });

    const countPassengerPrevious = await Passenger.count({
      where: {
        createdAt: {
          [Op.between]: [previousRange.startQuery, previousRange.endQuery],
        },
      },
    });

    let percentage = null;
    if (countPassengerPrevious !== 0) {
      if (countPassenger !== 0) {
        percentage = (countPassenger / countPassengerPrevious - 1) * 100;
      } else {
        percentage = -100;
      }
    } else {
      percentage = 100;
      if (countPassenger === 0) {
        percentage = 0;
      }
    }

    return {
      countPassengerYear: countPassenger,
      percentagePassengerYear: percentage,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = { countPassengerYearFunc };
