const db = require("../models");
const Flight = db.FlightInformation;

const searchFlights = async (req, res) => {
  try {
    const { departure, arrive, departureDay, typeNumber } = req.body;
    if (!departure || !arrive || !departureDay || !typeNumber) {
      return res.status(400).json({ message: "Thiếu thông tin để tìm kiếm" });
    }
    const flights = await Flight.findAll({
      where: {
        departurePoint: departure,
        arrivePoint: arrive,
        departureDay: departureDay,
      },
      limit: 4,
    });
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
module.exports = { searchFlights };
