require("dotenv").config();

const { request, response, raw } = require("express");
const db = require("../models");
const { DATEONLY } = require("sequelize");
const Flight = db.FlightInformation;
const Passenger = db.Passenger;
const Payment = db.Payment;
const Seat = db.Seat;
const Ticket = db.Ticket;
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
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

    const flightWithPrice = await Promise.all(
      flights.map(async (flight) => {
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

        const count = await Seat.count({
          where: {
            flightNumber: flight.flightNumber,
          },
        });

        return {
          ...flight,
          seatCount: count,
          finalPrice: {
            economy: calculateFinal(basePrices.economy),
            business: calculateFinal(basePrices.business),
          },
        };
      })
    );
    res.status(200).json(flightWithPrice);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Xử lý đẩy thanh toán lên và lock-pending
const timeLock = 4 * 60 * 1000;
const createPayment = async (req, res) => {
  try {
    const { flightId, seats, totalPrice, passengerInfo } = req.body;
    const io = req.app.get("socketio");

    const unavailableSeats = [];
    seats.forEach((seat) => {
      const lockKey = `${flightId}_${seat.id}`;
      if (global.lockedSeats[lockKey]) {
        unavailableSeats.push(seat.id);
      }
    });
    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        message: "Ghế bị người khác chọn mất!",
        seats: unavailableSeats,
      });
    }

    const generatedPaymentID = `PAY${Date.now()}${Math.floor(
      Math.random() * 100
    )}`;
    const now = new Date();

    const newPayment = await Payment.create({
      paymentID: generatedPaymentID,
      paymentPrice: totalPrice,
      paymentType: "QR Code",
      paymentDate: now,
      paymentState: "pending",
    });

    const expiredTime = now.getTime() + timeLock;
    seats.forEach((seat) => {
      const lockKey = `${flightId}_${seat.id}`;
      const timer = setTimeout(async () => {
        delete global.lockedSeats[lockKey];
        const [updateRow] = await Payment.update(
          { paymentState: "expired" },
          { where: { paymentID: generatedPaymentID, paymentState: "pending" } }
        );

        if (updateRow > 0) {
          io.to(flightId).emit("seatUnlocked", { seatId: seat.id });
        }
      }, timeLock);

      global.lockedSeats[lockKey] = {
        paymentID: generatedPaymentID,
        timestamp: now.getTime(),
        timer: timer,
      };
    });
    io.to(flightId).emit("seatsLocked", {
      seats: seats.map((s) => s.id),
    });

    return res.status(200).json({
      message: "Tạo giao dịch thành công",
      data: {
        paymentID: newPayment.paymentID,
        paymentPrice: newPayment.paymentPrice,
        paymentType: newPayment.paymentType,
        paymentState: newPayment.paymentState,
        expiredTime: expiredTime,
        seats: seats,
      },
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    return res.status(500).json({ message: "Lỗi Server khi tạo thanh toán" });
  }
};

// Xử lý thêm ghế , thêm vé , sửa chỗ ngồi thành đã bán ,
const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(
    Math.random() * 1000
  )}`;
};

const finalizeBooking = async (req, res) => {
  const sequelize = db.sequelize;
  const t = await sequelize.transaction();
  const io = req.app.get("socketio");
  try {
    const {
      flightNumber,
      passengerID,
      paymentID,
      seats,
      ticketInfo,
      contactPassenger,
    } = req.body;

    if (global.lockedSeats) {
      seats.forEach((seat) => {
        const lockKey = `${flightNumber}_${seat.seatNumber}`;

        if (global.lockedSeats[lockKey]) {
          const lockData = global.lockedSeats[lockKey];
          if (lockData.timer) {
            clearTimeout(lockData.timer);
          }

          delete global.lockedSeats[lockKey];
        }
      });
    }
    const [updatedCount] = await Payment.update(
      { paymentState: "completed" },
      {
        where: { paymentID: paymentID },
        transaction: t,
      }
    );
    // Seats
    const soldSeatIds = [];
    const seatsPayload = seats.map((seat) => {
      const combinedSeatId = `${seat.seatNumber}`;

      soldSeatIds.push(combinedSeatId);
      return {
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        seatState: "occupied",
        flightNumber: flightNumber,
      };
    });

    await Seat.bulkCreate(seatsPayload, {
      updateOnDuplicate: ["seatState", "seatType"],
    });
    // Ticket
    const ticketsToCreate = seats.map((seat) => ({
      ticketID: generateUniqueId("TKT"),
      passengerID: passengerID,
      seatNumber: seat.seatNumber,
      flightNumber: flightNumber,
      ticketBookTime: new Date(),
      ticketState: "valid",
      paymentID: paymentID,
      contactName: contactPassenger.name,
      contactEmail: contactPassenger.email,
      contactPhone: contactPassenger.phone,
      contactPassport: contactPassenger.passport,
    }));

    const createdTickets = await Ticket.bulkCreate(ticketsToCreate, {
      transaction: t,
    });
    await t.commit();
    io.to(flightNumber).emit("seatsSold", {
      flightNumber: flightNumber,
      seats: soldSeatIds,
    });

    return res.status(200).json({
      success: true,
      message: "Đặt vé thành công!",
      data: {
        paymentID: paymentID,
        tickets: createdTickets,
        totalSeats: createdTickets.length,
        seats: seatsPayload,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi booking:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý đặt vé.",
      error: error.message,
    });
  }
};

const getOccupiedSeats = async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const occupiedSeats = await db.Seat.findAll({
      where: {
        flightNumber: flightNumber,
        seatState: "occupied",
      },
      attributes: ["seatNumber"],
    });

    return res.status(200).json({
      success: true,
      data: occupiedSeats,
    });
  } catch (error) {
    console.error("Lỗi lấy ghế:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Format và gửi email đi cho người dùng
const formatEmail = async (req, res) => {
  /*
   flight: flight,
            passenger: passenger,
            totalPrice: totalPrice,
            ticketInfo: ticketInfo,
            selectedSeats: selectedSeats
  */
  const { flight, passenger, totalPrice, selectedSeats } = req.body;

  // Config cho account gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
module.exports = {
  SearchFlights,
  priceStandard,
  createPayment,
  finalizeBooking,
  getOccupiedSeats,
};
