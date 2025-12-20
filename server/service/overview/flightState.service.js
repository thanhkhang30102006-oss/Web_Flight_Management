const db = require("../../models");
const { sequelize } = require("../../models");
const Flight = db.FlightInformation;

const flightStateStat = async () => {
  const flightStates = await Flight.findAll({
    attributes: [
      "flightState",
      [sequelize.fn("COUNT", sequelize.col("flightNumber")), "totalState"],
    ],
    group: ["flightState"],
    raw: true,
  });
  if (!flightStates || flightStates.length === 0) {
    console.log("Không có chuyến bay nào cả");
    return [];
  }
  return {
    flightState: flightStates,
  };
};
module.exports = { flightStateStat };
