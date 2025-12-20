const db = require("../models");
const { sequelize } = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { startOfDay, endOfDay } = require("date-fns");
const { toZonedTime, fromZonedTime } = require("date-fns-tz");
const { startOfWeek, endOfWeek } = require("date-fns");

// Xử lý service
const averagePayment = require("../service/overview/averagePayment.service");
const averageSeat = require("../service/overview/averageSeat.service");
const totalFlight = require("../service/overview/totalFlight.service");
const flightState = require("../service/overview/flightState.service");
const popularMostPassenger = require("../service/overview/popularMostPassenger.service");
const tableSummary = require("../service/overview/tableSummary.service");
const infoDashboard = async (req, res) => {
  // Lấy số lượng chuyến bay theo ngày và giờ
  try {
    const timeZone = "Asia/Ho_Chi_Minh";
    const now = new Date();
    const zonedNow = toZonedTime(now, timeZone);

    const startVNDay = startOfDay(zonedNow);
    const endVNDay = endOfDay(zonedNow);
    // Chuyển thời gian thành UTC
    const startQuery = fromZonedTime(startVNDay, timeZone);
    const endQuery = fromZonedTime(endVNDay, timeZone);
    const groupFlight = await Flight.findAll({
      attributes: [
        "departureDay",
        [sequelize.fn("HOUR", sequelize.col("departureTime")), "departureHour"],
        [sequelize.fn("COUNT", sequelize.col("flightNumber")), "totalFlights"],
      ],
      where: {
        departureDay: {
          [Op.between]: [startQuery, endQuery],
        },
      },
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
    if (!groupFlight) {
      return res.status(401).json({
        message: "Lỗi nhóm máy bay trong ngày",
      });
    }
    // Lấy doanh thu theo tuần

    const zonedDate = toZonedTime(now, timeZone);
    // Lấy ngày thứ 2 và chủ nhật
    const startVN = startOfWeek(zonedDate, { weekStartsOn: 1 });
    const endVN = endOfWeek(zonedDate, { weekStartsOn: 1 });

    const startUTC = fromZonedTime(startVN, timeZone);
    const endUTC = fromZonedTime(endVN, timeZone);

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
    // CHẶNG BAY PHỔ BIẾN
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
      data: {
        groupFlight: groupFlight,
        payments: payments,
        flights: flights,
        popularRoutes: popularRoutes,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi server: ${error.message}`,
    });
  }
};

// Hàm xử lý dữ liệu lấy thông tin bao gồm averageRevenueInEachFlight, percentageSeatInEachFlight,...
const statiscialChartFlight = async (req, res) => {
  try {
    const [
      totalFlightResult,
      flightStateResult,
      popularFlightResult,
      tableSummaryResult,
      averageSeatResult,
      averagePaymentResult,
    ] = await Promise.all([
      totalFlight.totalFlightIncome(), // totalFlightResult
      flightState.flightStateStat(), // flightStateResult
      popularMostPassenger.popularRoutesWithMostPassenger(), // popularFlightResult
      tableSummary.tableSummaryFlight(), // tableSummaryResult
      averageSeat.averageSeatInEachFlight(), // averageSeatResult
      averagePayment.averageRevenueInEachFlight(), // averagePaymentResult
    ]);

    const responseData = {
      overview: {
        totalFlights: totalFlightResult.flightTotal, // Hiển thị tổng số chuyến bay
        averageSeatFill: averageSeatResult.percent, // Số % ghế trên hệ thống
        averageRevenue: averagePaymentResult.averageRevenue, // Doanh thu trung bình
        totalRevenue: averagePaymentResult.totalSystemRevenue, // Tổng doanh thu
      },
      charts: {
        flightStates: flightStateResult.flightState, // Dữ liệu cho biểu đồ tròn
        popularRoutes: popularFlightResult.flightPopular, // Dữ liệu cho biểu đồ cột
      },
      tableData: tableSummaryResult,
    };
    return res.status(200).json({
      status: "success",
      message: "Lấy dữ liệu chart thành công",
      data: responseData,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi server khi tổng hợp dữ liệu",
      error: error.message,
    });
  }
};
module.exports = { infoDashboard, statiscialChartFlight };
