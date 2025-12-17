const db = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const Passenger = db.Passenger;
const { Op } = require("sequelize");
const {
  sendCancellationEmail,
  sendRefundSuccessEmail,
} = require("./EmailServiceController");
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
// Đổi ghế
const changeSeat = async (req, res) => {
  const { ticketID, newSeatNumber, flightNumber, oldseatNumber } = req.body;
  const t = await db.sequelize.transaction();
  const seatNumbers = `${newSeatNumber}${flightNumber}`;
  const oldseatNumbers = `${oldseatNumber}${flightNumber}`;
  try {
    const oldSeat = await Seat.findOne({
      where: {
        flightNumber: flightNumber,
        seatNumber: oldseatNumbers,
      },
      transaction: t,
    });

    if (!oldSeat) {
      await t.rollback();
      return res.status(401).json({
        success: "fail",
        message: "Không tìm thấy chỗ ngồi cũ",
      });
    }
    const seatData = oldSeat.toJSON();

    seatData.seatNumber = seatNumbers;

    await Seat.create(seatData, { transaction: t });

    const oldTicket = await Ticket.findOne({
      where: {
        ticketID: ticketID,
        flightNumber: flightNumber,
        seatNumber: oldseatNumbers,
      },
      transaction: t,
    });

    if (!oldTicket) {
      await t.rollback();
      return res.status(404).json({
        success: "fail",
        message: "Không tìm thấy vé hợp lệ",
      });
    }
    oldTicket.seatNumber = seatNumbers;
    await oldTicket.save({ transaction: t });
    await Seat.destroy({
      where: { seatNumber: oldseatNumbers },
      transaction: t,
    });
    await t.commit();

    return res.status(200).json({
      success: "success",
      message: "Đổi ghế thành công",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};

// Hàm xử lý hủy vé
const cancelTicket = async (req, res) => {
  const t = await db.sequelize.transaction();
  const { ticketID } = req.params;
  try {
    const ticket = await Ticket.findOne({
      where: {
        ticketID: ticketID,
      },
      transaction: t,
    });

    if (!ticket) return res.status(404).json({ message: "Không tìm thấy vé" });

    const contactEmail = ticket.contactEmail;
    const paymentID = ticket.paymentID;
    const seatNumber = ticket.seatNumber;
    await Ticket.destroy({ where: { ticketID: ticketID }, transaction: t });

    await Seat.destroy({
      where: { seatNumber: seatNumber },
      transaction: t,
    });
    await t.commit();

    if (contactEmail) {
      sendCancellationEmail(contactEmail, ticketID).catch((err) =>
        console.error("Lỗi gửi email:", err)
      );
    }
    return res.status(200).json({
      success: true,
      message:
        "Hủy vé thành công. Vui lòng kiểm tra email để cung cấp thông tin hoàn tiền.",
    });
  } catch (error) {
    if (t) await t.rollback();
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
module.exports = { getAllInformationFlight, changeSeat, cancelTicket };
