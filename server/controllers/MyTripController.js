const db = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const Passenger = db.Passenger;
const { Op } = require("sequelize");

const getAllInformationFlight = async (req, res) => {
  const { passengerID } = req.params;
  try {
    const passenger = await Passenger.findOne({
      where: {
        passengerID: passengerID,
      },
    });
    const tickets = await Ticket.findAll({
      where: {
        passengerID: passengerID,
        ticketState: "valid",
      },
    });

    if (!tickets)
      return res.status(401).json({ messsage: "Không có passengerID hợp lệ" });

    const seatID = tickets.map((ticket) => {
      const id = ticket.seatNumber;
      return id;
    });
    const flightNumber = tickets.map((ticket) => {
      const id = ticket.flightNumber;
      return id;
    });

    const paymentID = tickets.map((ticket) => {
      const id = ticket.paymentID;
      return id;
    });
    const seats = await Seat.findAll({
      where: {
        seatNumber: {
          [Op.in]: seatID,
        },
      },
    });

    const flights = await Flight.findAll({
      where: {
        flightNumber: {
          [Op.in]: flightNumber,
        },
      },
    });

    const payments = await Payment.findAll({
      where: {
        paymentID: {
          [Op.in]: paymentID,
        },
        paymentState: "completed",
      },
    });

    if (seats && flights && payments) {
      return res.status(200).json({
        tickets: tickets,
        seats: seats,
        flights: flights,
        payments: payments,
        passenger: passenger,
        success: "success",
      });
    }
  } catch (error) {
    return res.status(500).json("Lỗi server: " + error.messsage);
  }
};
module.exports = { getAllInformationFlight };
