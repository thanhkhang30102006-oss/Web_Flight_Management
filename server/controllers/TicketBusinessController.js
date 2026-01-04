const db = require("../models");
const { sequelize } = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { calculateSpecificTicketPrice } = require("../utils/priceCalculator");
const {
  sendPersonalCancellationEmail,
  sendRestoreTicketEmail,
} = require("../controllers/EmailServiceController");
const listTicket = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      attributes: [
        "ticketID",
        "contactName",
        "flightNumber",
        "seatNumber",
        "ticketBookTime",
        "ticketState",
      ],
      include: [
        {
          model: db.FlightInformation,
          as: "flightInfo",
          required: true,
          attributes: [
            "departurePoint",
            "arrivePoint",
            "departureTime",
            "departureDay",
            "arriveDay",
            "arriveTime",
          ],
        },
        {
          model: db.Seat,
          as: "seatInfo",
          required: true,
          attributes: ["seatType"],
        },
      ],
      raw: true,
      nest: true,
      where: {
        ticketState: {
          [Op.or]: ["cancelled", "valid"],
        },
      },
    });

    if (!tickets || tickets.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const ticketWithPrices = tickets.map((ticket) => {
      const calculatedPrice = calculateSpecificTicketPrice(
        ticket.flightInfo,
        ticket.seatInfo.seatType,
        ticket.ticketBookTime
      );

      return {
        ticketID: ticket.ticketID,
        passengerName: ticket.contactName,
        flightNumber: ticket.flightNumber,
        seatNumber: ticket.seatNumber.replace(ticket.flightNumber, ""),
        seatType: ticket.seatInfo.seatType,
        ticketBookTime: ticket.ticketBookTime,
        ticketState: ticket.ticketState,
        price: calculatedPrice,
      };
    });
    return res.status(200).json({
      success: true,
      data: ticketWithPrices,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách vé:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const particularlyTicketInfo = async (req, res) => {
  const { ticketID } = req.body;
  try {
    const ticket = await Ticket.findOne({
      where: {
        ticketID: ticketID,
      },
    });

    if (!ticket) {
      return res.status(401).json({
        success: false,
        message: "Thiếu thông tin để tìm vé",
      });
    }

    return res.status(200).json({
      success: true,
      ticketID: ticket.ticketID,
      flightNumber: ticket.flightNumber,
      seatNumber: ticket.seatNumber.replace(ticket.flightNumber, ""),
      ticketBookTime: ticket.ticketBookTime,
      ticketState: ticket.ticketState,
      contactName: ticket.contactName,
      contactEmail: ticket.contactEmail,
      contactPhone: ticket.contactPhone,
      contactPassport: ticket.contactPassport,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách vé:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const cancelPersonalTicket = async (req, res) => {
  const { ticketID } = req.body;
  try {
    const t = await db.sequelize.transaction();

    const ticket = await Ticket.findOne({
      where: {
        ticketID: ticketID,
      },
      transaction: t,
    });
    if (!ticket) return res.status(404).json({ message: "Không tìm thấy vé" });

    const contactEmail = ticket.contactEmail;
    const seatNumber = ticket.seatNumber;
    const contactName = ticket.contactName;
    await Ticket.update(
      { ticketState: "cancelled", cancelledAt: new Date() },
      { where: { ticketID: ticketID }, transaction: t }
    );
    await Seat.update(
      { seatState: "available" },
      { where: { seatNumber: seatNumber }, transaction: t }
    );

    await t.commit();

    if (contactEmail) {
      sendPersonalCancellationEmail(contactEmail, ticketID, contactName).catch(
        (err) => console.error(err)
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
const restoreTicket = async (req, res) => {
  const { ticketID } = req.body;
  try {
    const t = await db.sequelize.transaction();

    const ticket = await Ticket.findOne({
      where: {
        ticketID: ticketID,
      },
      transaction: t,
    });
    if (!ticket) return res.status(404).json({ message: "Không tìm thấy vé" });

    const contactEmail = ticket.contactEmail;
    const seatNumber = ticket.seatNumber;
    const contactName = ticket.contactName;
    await Ticket.update(
      { ticketState: "valid" },
      { where: { ticketID: ticketID }, transaction: t }
    );
    await Seat.update(
      { seatState: "occupied" },
      { where: { seatNumber: seatNumber }, transaction: t }
    );

    await t.commit();

    if (contactEmail) {
      sendRestoreTicketEmail(contactEmail, ticketID, contactName).catch((err) =>
        console.error(err)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Khôi phục vé thành công",
    });
  } catch (error) {
    if (t) await t.rollback();
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
module.exports = {
  listTicket,
  particularlyTicketInfo,
  cancelPersonalTicket,
  restoreTicket,
};
