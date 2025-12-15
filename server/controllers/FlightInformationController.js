const db = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const { Op } = require("sequelize");
const getInfoToTicket = async (req, res) => {
  try {
    const { passengerID } = req.params;
    const tickets = await Ticket.findAll({
      where: {
        passengerID: passengerID,
      },
    });
    const now = new Date();
    const currentDateVN = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const currentTimeVN = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    // Ngày và giờ hiện tại
    const currentDateTimeVN = `${currentDateVN} ${currentTimeVN}`;
    const flightNumbers = tickets.map((ticket) => {
      return ticket.flightNumber;
    });
    const latestFlight = await Flight.findOne({
      where: {
        flightNumber: flightNumbers,
        [db.Sequelize.Op.and]: db.Sequelize.literal(
          `CONCAT(departureDay, ' ', departureTime) >= '${currentDateTimeVN}'`
        ),
      },
      order: [
        ["departureDay", "ASC"],
        ["departureTime", "ASC"],
      ],
    });

    const targetTicket = tickets.find(
      (t) => t.flightNumber === latestFlight.flightNumber
    );

    const seat = await Seat.findOne({
      where: {
        flightNumber: latestFlight.flightNumber,
        seatNumber: targetTicket.seatNumber,
      },
    });

    if (latestFlight && seat) {
      res.status(200).json({
        success: "success",
        passengerID: passengerID,
        flight: latestFlight,
        seat: seat,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server:" + error.message });
  }
};

const flightSchedule = async (req, res) => {
  try {
    const { passengerID } = req.params;
    const tickets = await Ticket.findAll({
      where: {
        passengerID: passengerID,
      },
    });
    if (!tickets) {
      res.status(401).json({ message: "Thiếu thông tin vé" });
    }
    const flightNumbers = tickets.map((ticket) => {
      return ticket.flightNumber; // Danh sách tất cả các chuyến bay mà người dùng đã đặt vé
    });

    console.log("Danh sách các chuyến bay: ", flightNumbers);

    const flights = await Flight.findAll({
      where: {
        flightNumber: { [Op.in]: flightNumbers },
      },
    });
    res.status(200).json({
      flights: flights,
      success: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
module.exports = { getInfoToTicket, flightSchedule };
