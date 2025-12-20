const db = require("../../models");
const { sequelize } = require("../../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const { Op } = require("sequelize");
const Ticket = db.Ticket;
const Payment = db.Payment;
const tableSummaryFlight = async () => {
  const flights = await Flight.findAll({
    attributes: [
      "flightNumber",
      "departurePoint",
      "arrivePoint",
      "departureDay",
      "flightState",
      "flightTotalSeat",
    ],
    include: [
      {
        model: Seat,
        as: "seats",
        attributes: ["seatNumber", "seatState"],
        required: false,
      },
      {
        model: Ticket,
        as: "tickets",
        require: false,
        include: [
          {
            model: Payment,
            as: "paymentInfo",
            attributes: ["paymentID", "paymentPrice"],
          },
        ],
      },
    ],
    where: {
      flightState: {
        [Op.in]: ["active", "delayed", "cancelled", "scheduled"],
      },
    },
  });

  // Bắt đầu tính giá trị cho phần trăm và doanh thu
  const dashboardData = flights.map((flight) => {
    let currentFlightRevenue = 0;
    let bookedCount = 0;
    let percentage = 0;
    if (flight.flightState !== "cancelled") {
      const processedPaymentIDs = new Set();

      if (flight.tickets && flight.tickets.length > 0) {
        flight.tickets.forEach((ticket) => {
          if (ticket.paymentInfo && ticket.paymentInfo.paymentID) {
            const pID = ticket.paymentInfo.paymentID;
            if (!processedPaymentIDs.has(pID)) {
              currentFlightRevenue += parseFloat(
                ticket.paymentInfo.paymentPrice
              );
              processedPaymentIDs.add(pID);
            }
          }
        });
      }
    }

    bookedCount = flight.seats ? flight.seats.length : 0;
    const totalSeats = flight.flightTotalSeat || 0;

    percentage = 0;
    if (totalSeats > 0) {
      percentage = Math.round((bookedCount / totalSeats) * 100);
    }

    return {
      flightNumber: flight.flightNumber,
      departurePoint: flight.departurePoint,
      arrivePoint: flight.arrivePoint,
      departureDay: flight.departureDay,
      flightState: flight.flightState,
      stats: {
        booked: bookedCount,
        total: totalSeats,
        percentage: percentage,
      },
      revenue: currentFlightRevenue,
      occupancyStatus:
        percentage >= 90 ? "high" : percentage > 50 ? "medium" : "low",
    };
  });
  return dashboardData;
};
module.exports = { tableSummaryFlight };
