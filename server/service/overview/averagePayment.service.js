const db = require("../../models");

const Payment = db.Payment;
const Seat = db.Seat;
const Flight = db.FlightInformation;
const Ticket = db.Ticket;
const averageRevenueInEachFlight = async () => {
  try {
    const flights = await Flight.findAll({
      attributes: ["flightNumber"],
      include: [
        {
          model: db.Ticket,
          as: "tickets",
          required: false,
          include: [
            {
              model: db.Payment,
              as: "paymentInfo",
              attributes: ["paymentID", "paymentPrice"],
            },
          ],
        },
      ],
    });

    // Tính tiền trung bình
    let totalSystemRevenue = 0;
    const totalFlights = flights.length;

    const revenuePerFlightReport = flights.map((flight) => {
      let currentFlightRevenue = 0;
      const processedPaymentIDs = new Set(); // Tránh bị cộng lặp lại

      if (flight.tickets && flight.tickets.length > 0) {
        flight.tickets.forEach((ticket) => {
          if (ticket.paymentInfo && ticket.paymentInfo.paymentID) {
            const pID = ticket.paymentInfo.paymentID;

            // 1 payment có nhiều vé nên là nếu chưa được cộng thì cộng vào ko bỏ qua
            if (!processedPaymentIDs.has(pID)) {
              currentFlightRevenue += parseFloat(
                ticket.paymentInfo.paymentPrice
              );
              processedPaymentIDs.add(pID); // Đánh dấu đã tính
            }
          }
        });
      }

      totalSystemRevenue += currentFlightRevenue;

      return {
        flightNumber: flight.flightNumber,
        revenue: currentFlightRevenue,
      };
    });

    // Tránh lỗi chia cho 0 nếu không có chuyến bay nào
    const averageRevenue =
      totalFlights > 0 ? totalSystemRevenue / totalFlights : 0;

    console.log("=== KẾT QUẢ TÍNH TOÁN ===");
    console.log("Chi tiết từng chuyến:", revenuePerFlightReport);
    console.log(`Tổng doanh thu: ${totalSystemRevenue.toLocaleString()} VND`);
    console.log(`Tổng số chuyến bay: ${totalFlights}`);
    console.log(
      `=> TRUNG BÌNH MỖI CHUYẾN: ${averageRevenue.toLocaleString()} VND`
    );

    return {
      averageRevenue,
      totalFlights,
      totalSystemRevenue,
      details: revenuePerFlightReport,
    };
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};
module.exports = {
  averageRevenueInEachFlight,
};
