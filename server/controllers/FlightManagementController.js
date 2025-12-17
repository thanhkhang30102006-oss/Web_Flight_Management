const db = require("../models");
const Flight = db.FlightInformation;

const showAllFlight = async (req, res) => {
  try {
    const Flights = await Flight.findAll({
      order: [
        ["departureDay", "ASC"],
        ["departureTime", "ASC"],
      ],
    });

    console.log("Kết quả tìm được:", JSON.stringify(Flights, null, 2));
    return res.status(200).json(Flights);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Lỗi server: ${error} ` });
  }
};
const showOnlyOneFlight = async (req, res) => {
  const { flightNumber } = req.params;
  try {
    const flight = await Flight.findOne({
      where: {
        flightNumber: flightNumber,
      },
    });
    return res.status(200).json({
      flight: flight,
      success: "success",
    });
  } catch (error) {
    return res.status(500).json({ message: `Lỗi server: ${error} ` });
  }
};
module.exports = { showAllFlight, showOnlyOneFlight };
