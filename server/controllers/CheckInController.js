const db = require("../models");
const Flight = db.FlightInformation;
const Ticket = db.Ticket;
const Seat = db.Seat;
const CheckIn = db.CheckIn;
const ticketInfo = async (req, res) => {
  try {
    const { ticketID } = req.body;

    const ticket = await Ticket.findOne({
      attributes: [
        "ticketID",
        "contactName",
        "seatNumber",
        "flightNumber",
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
          ],
        },
        {
          model: db.Seat,
          as: "seatInfo",
          required: true,
          attributes: ["seatType"],
        },
      ],
      where: {
        ticketID: ticketID,
      },
    });

    if (!ticket) {
      return res.status(401).json({
        message: "Thiếu thông tin hoặc truy tìm lỗi",
      });
    }
    let gate = null;
    if (ticket.ticketState === "be-checked") {
      const alreadyCheck = await CheckIn.findOne({
        attributes: ["gate"],
        where: {
          ticketID: ticketID,
        },
      });
      if (alreadyCheck) {
        gate = alreadyCheck.gate;
      }
    }

    const seatCode = ticket.seatNumber.replace(ticket.flightNumber, "");
    return res.status(200).json({
      seatType: ticket.seatInfo.seatType,
      departurePoint: ticket.flightInfo.departurePoint,
      arrivePoint: ticket.flightInfo.arrivePoint,
      contactName: ticket.contactName,
      flightNumber: ticket.flightNumber,
      departureDay: ticket.flightInfo.departureDay,
      departureTime: ticket.flightInfo.departureTime,
      ticketID: ticket.ticketID,
      seatNumber: seatCode,
      ticketState: ticket.ticketState,
      gate: gate,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi server: ${error.message}`,
    });
  }
};
// xac nhan check-in
const confirmCheckIn = async (req, res) => {
  try {
    const { ticketID, gate } = req.body;

    const ticket = await Ticket.findOne({
      attributes: ["passengerID", "ticketID"],
      where: {
        ticketID: ticketID,
      },
    });
    await Ticket.update(
      {
        ticketState: "be-checked",
      },
      {
        where: {
          ticketID: ticketID,
        },
      }
    );
    const generateUniqueId = (prefix) => {
      return `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(
        Math.random() * 1000
      )}`;
    };
    await CheckIn.create({
      checkinID: generateUniqueId("CI"),
      passengerID: ticket.passengerID,
      ticketID: ticket.ticketID,
      checkinState: "yes",
      gate: gate,
    });
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Xảy ra lỗi: ${error.message}`,
    });
  }
};

module.exports = { ticketInfo, confirmCheckIn };
