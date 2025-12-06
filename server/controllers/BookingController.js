const { request, response } = require("express");
const db = require("../models");
const Flight = db.FlightInformation;
const Passenger = db.Passenger;
// Tìm kiếm chuyến bay nhưng theo kiểu để tiếp tục đặt vé
const SearchFlights = async (req, res) => {
  try {
    const { from, to, date, time } = req.body;
    if (!from || !to || !date || !time) {
      return res.status(400).json({ message: "Thiếu thông tin để tìm kiếm" });
    }
    const flight = await Flight.findAll({
      where: {
        departurePoint: from,
        arrivePoint: to,
        departureDay: date,
        departureTime: time,
      },
    });
    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
module.exports = { SearchFlights };
