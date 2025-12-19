const db = require("../models");
const { flightSchedule } = require("./FlightInformationController");
const Flight = db.FlightInformation;
const Ticket = db.Ticket;
const Seat = db.Seat;
const { sendFlightCancellationToAll } = require("./EmailServiceController");
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

// Viết hàm thêm chuyến bay vào hệ thống
const addingFlight = async (req, res) => {
  const formData = req.body;

  try {
    await Flight.create({
      flightNumber: formData.flightNumber,
      departurePoint: formData.departurePoint,
      arrivePoint: formData.arrivePoint,
      departureDay: formData.departureDay,
      departureTime: formData.departureTime,
      planeType: formData.planeType,
      flightTotalSeat: formData.flightTotalSeat,
      flightState: formData.flightState,
      arriveDay: formData.arriveDay,
      arriveTime: formData.arriveTime,
    });

    return res.status(200).json({ message: "Thêm chuyến bay thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" + error.message });
  }
};
// cập nhật chuyến bay
const updateFlight = async (req, res) => {
  const {
    flightState,
    departureDay,
    departureTime,
    arriveDay,
    arriveTime,
    reason,
  } = req.body;
  const { flightNumber } = req.params;

  try {
    await Flight.update(
      {
        flightState: flightState,
        departureDay: departureDay,
        departureTime: departureTime,
        arriveDay: arriveDay,
        arriveTime: arriveTime,
        reason: reason,
      },
      {
        where: { flightNumber: flightNumber },
      }
    );

    return res.status(200).json({ message: "Cập nhật chuyến bay thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" + error.message });
  }
};

// Hàm xử lý khi hủy chuyến bay
const cancelledFlight = async (req, res) => {
  const { flightNumber } = req.params;

  try {
    await Ticket.update(
      {
        ticketState: "cancelled",
        cancelledAt: new Date(),
      },
      {
        where: {
          flightNumber: flightNumber,
        },
      }
    );

    await Flight.update(
      {
        flightState: "cancelled",
      },
      {
        where: {
          flightNumber: flightNumber,
        },
      }
    );
    const tickets = await Ticket.findAll({
      where: { flightNumber: flightNumber },
      attributes: ["contactEmail"],
      raw: true,
    });

    if (tickets.length > 0) {
      const uniqueEmails = [
        ...new Set(tickets.map((t) => t.contactEmail).filter((email) => email)),
      ];

      await sendFlightCancellationToAll(uniqueEmails, flightNumber, "");
    }

    return res.status(200).json({
      message: "Hủy chuyến bay thành công và gửi thông báo thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" + error.message });
  }
};
module.exports = {
  showAllFlight,
  showOnlyOneFlight,
  addingFlight,
  updateFlight,
  cancelledFlight,
};
