const db = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { startOfWeek, endOfWeek } = require("date-fns");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");
const infoDashboard = async (req, res) => {
  // Lấy số lượng chuyến bay theo ngày và giờ
  try {
    const groupFLight = await Flight.findAll({
      attributes: [
        "departureDay",
        [sequelize.fn("HOUR", sequelize.col("departureTime")), "departureHour"],
        [sequelize.fn("COUNT", sequelize.col("flightNumber")), "totalFlights"],
      ],
      group: [
        "departureDay",
        sequelize.fn("HOUR", sequelize.col("departureTime")),
      ],
      order: [
        ["departureDay", "ASC"],
        ["departureHour", "ASC"],
      ],
      raw: true,
    });
    if (!groupFLight) {
      return res.status(401).json({
        message: "Lỗi nhóm máy bay trong ngày",
      });
    }
    // Lấy doanh thu theo tuần

    const timeZone = "Asia/Ho_Chi_Minh";
    const now = new Date();

    const zonedDate = utcToZonedTime(now, timeZone);
    // Lấy ngày thứ 2 và chủ nhật
    const startVN = startOfWeek(zonedDate, { weekStartsOn: 1 });
    const endVN = endOfWeek(zonedDate, { weekStartsOn: 1 });

    const startUTC = zonedTimeToUtc(startVN, timeZone);
    const endUTC = zonedTimeToUtc(endVN, timeZone);

    console.log(`Ngày thứ 2: ${startUTC},  ngày chủ nhật : ${endUTC}`);

    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [startUTC, endUTC],
        },
        paymentState: "completed",
      },
      order: [["createdAt", "ASC"]],
      attributes: ["paymentID", "paymentPrice", "createdAt"],
      raw: true,
    });

    const weeklyStats = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    if (payments && payments.length > 0) {
      payments.forEach((payment) => {
        const paymentDateVN = utcToZonedTime(payment.createdAt, timeZone);

        const dayName = format(paymentDateVN, "EEEE");

        if (weeklyStats[dayName] !== undefined) {
          weeklyStats[dayName] += Number(payment.paymentPrice);
        }
      });
    }

    if (!payments) {
      return res.status(401).json({
        message: "Lỗi thống kế doanh thu trong tuần",
      });
    }
    // Thống kê đội bay // Airbus 321 10 chuyến chẳng hạn

    const flights = await Flight.findAll({
      attributes: [
        "planeType",
        [
          sequelize.fn("COUNT", sequelize.col("flightNumber")),
          "totalPlaneType",
        ],
      ],
      group: ["planeType"],
      raw: true,
    });
    if (!flights) {
      return res.status(401).json({
        message: "Lỗi chuyến bay và loại chuyến bay",
      });
    }

    const popularRoutes = await Flight.findAll({
      attributes: [
        "departurePoint",
        "arrivePoint",
        [sequelize.fn("COUNT", sequelize.col("flightNumber")), "totalFlights"],
      ],

      group: ["departurePoint", "arrivePoint"],

      order: [[sequelize.literal("totalFlights"), "DESC"]],
      raw: true,
    });
    if (!popularRoutes) {
      return res.status(401).json({
        message: "Lỗi tuyến bay",
      });
    }

    return res.status(200).json({
      groupFLight: groupFLight,
      payments: payments,
      flights: flights,
      popularRoutes: popularRoutes,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi server: ${error.message}`,
    });
  }
};
module.exports = { infoDashboard };
