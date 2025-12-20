const db = require("../../models");
const { sequelize } = require("../../models");
const Flight = db.FlightInformation;

const totalFlightIncome = async () => {
  const flightTotal = await Flight.count();
  if (!flightTotal) console.log("Không có chuyến bay nào cả");
  return {
    flightTotal: flightTotal,
  };
};
module.exports = { totalFlightIncome };
