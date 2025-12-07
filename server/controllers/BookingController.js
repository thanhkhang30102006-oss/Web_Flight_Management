const { request, response, raw } = require("express");
const db = require("../models");
const { DATEONLY } = require("sequelize");
const Flight = db.FlightInformation;
const Passenger = db.Passenger;

// Quy chuẩn giá tiền theo thời gian bay
const priceStandard = async (req, res) => {
  const { flightNumber } = req.body;

  try {
    // 1. Cấu hình giá cơ bản
    const basePrices = {
      economy: 1000000,
      business: 3000000,
    };

    // 2. Tìm thông tin chuyến bay
    const flight = await Flight.findOne({
      where: { flightNumber: flightNumber },
    });

    if (!flight) {
      return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
    }

    // 3. Xử lý thời gian
    const departureFullStr = `${flight.departureDay}T${flight.departureTime}`;
    const arriveFullStr = `${flight.arriveDay}T${flight.arriveTime}`;

    const departureDate = new Date(departureFullStr);
    const arriveDate = new Date(arriveFullStr);
    const now = new Date();

    // 4. Tính giá theo thời lượng bay (1 tiếng = 500k)
    const flightDurationMs = arriveDate - departureDate;
    const flightDurationHours = flightDurationMs / (1000 * 60 * 60);
    const pricePerDuration = Math.round(flightDurationHours * 500000);

    const timeUntilDepartureMs = departureDate - now;
    const daysUntilDeparture = timeUntilDepartureMs / (1000 * 60 * 60 * 24);

    let discountPercent = 0; // Mặc định là 0%

    // Chỉ giảm giá nếu đặt sớm hơn 30 ngày
    if (daysUntilDeparture >= 30) {
      discountPercent = 0.05; // 5%
      console.log("Khách đặt sớm trên 1 tháng: -5%");
    }
    // Nếu đặt trễ (dưới 30 ngày hoặc sát giờ bay) -> discountPercent vẫn là 0 -> Giá bình thường

    // 6. Tính toán giá cuối cùng
    const calculateFinalPrice = (basePrice) => {
      // Tổng giá chưa giảm
      const grossPrice = basePrice + pricePerDuration;

      // Số tiền được giảm
      const discountAmount = grossPrice * discountPercent;

      // Giá sau cùng (Làm tròn)
      return Math.round(grossPrice - discountAmount);
    };

    const finalPriceEconomy = calculateFinalPrice(basePrices.economy);
    const finalPriceBusiness = calculateFinalPrice(basePrices.business);

    // 7. Trả về kết quả
    return res.status(200).json({
      success: true,
      data: {
        flightNumber,
        finalPrice: {
          economy: finalPriceEconomy,
          business: finalPriceBusiness,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi tính giá:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server",
      error: error.message,
    });
  }
};
// Tìm kiếm chuyến bay nhưng theo kiểu để tiếp tục đặt vé
const SearchFlights = async (req, res) => {
  try {
    const { from, to, date, time } = req.body;
    if (!from || !to || !date) {
      return res.status(400).json({ message: "Thiếu thông tin để tìm kiếm" });
    }
    let queryConditions = {
      departurePoint: from,
      arrivePoint: to,
      departureDay: date,
    };
    if (time) {
      queryConditions.departureTime = time;
    }
    const flights = await Flight.findAll({
      where: queryConditions,
      raw: true,
    });
    if (!flights || flights.length === 0) {
      return res.status(200).json([]);
    }

    const flightWithPrice = flights.map((flight) => {
      const basePrices = { economy: 1000000, business: 3000000 };

      const departureFullStr = `${flight.departureDay}T${flight.departureTime}`;
      const arriveFullStr = `${flight.arriveDay}T${flight.arriveTime}`;
      const departureDate = new Date(departureFullStr);
      const arriveDate = new Date(arriveFullStr);
      const now = new Date();

      // Tính tiền theo thời lượng (1h = 500k)
      const flightDurationMs = arriveDate - departureDate;
      const flightDurationHours = flightDurationMs / (1000 * 60 * 60);
      const pricePerDuration = Math.round(flightDurationHours * 500000);

      const timeUntilDepartureMs = departureDate - now;
      const daysUntilDeparture = timeUntilDepartureMs / (1000 * 60 * 60 * 24);

      let discountPercent = 0;
      if (daysUntilDeparture >= 30) {
        discountPercent = 0.05;
      }

      // Hàm tính giá cuối cùng
      const calculateFinal = (base) => {
        const gross = base + pricePerDuration;
        return Math.round(gross - gross * discountPercent);
      };

      return {
        ...flight,
        finalPrice: {
          economy: calculateFinal(basePrices.economy),
          business: calculateFinal(basePrices.business),
        },
      };
    });
    res.status(200).json(flightWithPrice);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
module.exports = { SearchFlights, priceStandard };
