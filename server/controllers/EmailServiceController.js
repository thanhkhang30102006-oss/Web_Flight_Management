require("dotenv").config();
const nodemailer = require("nodemailer");
const { renderTemplate } = require("../service/editFormEmail/emailTemplates");
const { generateTicketPDF } = require("../service/editFormEmail/pdfService");
// zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
const { request, response, raw } = require("express");
const db = require("../models");
const { DATEONLY } = require("sequelize");
const Flight = db.FlightInformation;
const Passenger = db.Passenger;
const Payment = db.Payment;
const Seat = db.Seat;
const Ticket = db.Ticket;
const { Op } = require("sequelize");
const qrCode = require("qrcode");
const PDFDocument = require("pdfkit");
const path = require("path");
const FONT_PATH = path.resolve(__dirname, "../fonts/times.ttf");
// Config cho account gmail

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};


// 1. GỬI EMAIL XÁC NHẬN ĐẶT VÉ & THÔNG TIN VÉ (KÈM PDF) ===============
// 
const formatEmail = async (req, res) => {
  const { flight, passenger, totalPrice, ticketInfo, selectedSeats, language } = req.body;
  
  const lang = language && language.toString().toLowerCase().startsWith("en") ? "en" : "vi";
  const suffix = `_${lang}`;

  // Chuẩn bị dữ liệu chung
  const ticketIds = ticketInfo.tickets.map((t) => t.ticketID).join(", ");
  const departureName = translateAirport(flight.departurePoint) || flight.departurePoint;
  const arriveName = translateAirport(flight.arrivePoint) || flight.arrivePoint;

  // Xử lý danh sách ghế (Chuyển mảng ghế thành chuỗi HTML để nhét vào biến {{seatDetails}})
  const seatListHtml = (ticketInfo.seats || [])
    .map((seat) => {
      const seatNum = seat.seatNumber.replace(flight.flightNumber, "");
      const seatType = seat.seatType === "economy" ? (lang === 'en' ? "Economy" : "Phổ thông") : (lang === 'en' ? "Business" : "Thương gia");
      return `<div style="margin-bottom: 5px; padding: 8px; background-color: #f1f5f9; border-radius: 4px;">
                <strong>${lang === 'en' ? 'Seat' : 'Ghế'} ${seatNum}</strong> - ${seatType}
              </div>`;
    })
    .join("");

  // Tạo Data Map (Ánh xạ dữ liệu vào các biến {{...}} trong JSON)
  const emailVariables = {
    passengerName: passenger.name,
    contactPhone: "1900.599.997", 
    flightNumber: flight.flightNumber,
    route: `${departureName} - ${arriveName}`,
    allTicketIds: ticketIds,
    departureTime: flight.departureTime,
    departureDay: flight.departureDay,
    arriveTime: flight.arriveTime,
    arriveDay: flight.arriveDay,
    seatDetails: seatListHtml, 
  };

  try {
    // Template 1: Booking Success (Cảm ơn)
    const bookingTemplate = renderTemplate(`booking_success${suffix}`, emailVariables);
    const sub1 = bookingTemplate ? bookingTemplate.subject : `[FlightHK] Booking Confirmed ${ticketIds}`;
    const html1 = bookingTemplate ? bookingTemplate.content : `<p>Booking Success. Ticket: ${ticketIds}</p>`;

    // Template 2: Ticket Info (Vé điện tử)
    const ticketTemplate = renderTemplate(`ticket_info${suffix}`, emailVariables);
    const sub2 = ticketTemplate ? ticketTemplate.subject : `E-Ticket ${flight.flightNumber}`;
    const html2 = ticketTemplate ? ticketTemplate.content : `<p>Your Ticket Info...</p>`;

    const attachment = await generateTicketPDF(flight, passenger, totalPrice, ticketInfo, lang);

    
    // Gửi Mail 1: Cảm ơn
    const sendMail1 = transporter.sendMail({
      from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
      to: passenger.email,
      subject: sub1,
      html: html1,
    });

    // Gửi Mail 2: Vé điện tử + File PDF
    const sendMail2 = transporter.sendMail({
      from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
      to: passenger.email,
      subject: sub2,
      html: html2,
      attachments: attachment
        ? [{
            filename: attachment.filename,
            content: attachment.content,
            contentType: "application/pdf",
          }]
        : [],
    });

    // Chạy song song để tối ưu thời gian
    await Promise.all([sendMail1, sendMail2]);

    return res.status(200).json({
      success: "success",
      message: "Đã gửi email đặt vé và vé điện tử thành công.",
    });

  } catch (error) {
    console.error("Lỗi gửi email formatEmail:", error);
    return res.status(500).json({
      message: "Gửi email thất bại",
      error: error.message,
    });
  }
};


// 2. GỬI EMAIL XÁC NHẬN HỦY VÉ (CANCELLATION)
const sendCancellationEmail = async (passengerEmail, ticketID) => {
  try {
    const variables = { ticketID: ticketID };
    const template = renderTemplate("cancellation_confirm", variables);

    const subject = template ? template.subject : `[FlightHK] Hủy vé ${ticketID}`;
    const html = template ? template.content : `<p>Đã hủy vé ${ticketID}</p>`;

    await transporter.sendMail({
      from: '"FlightHK Support" <your-email@gmail.com>',
      to: passengerEmail,
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error("Lỗi gửi email hủy vé:", error);
    return false;
  }
};

// 3. GỬI EMAIL HOÀN TIỀN THÀNH CÔNG (REFUND)
const sendRefundSuccessEmail = async (passengerEmail, ticketID) => {
  try {
    const variables = { ticketID: ticketID };
    const template = renderTemplate("refund_success", variables);

    const subject = template ? template.subject : `[FlightHK] Hoàn tiền vé ${ticketID}`;
    const html = template ? template.content : `<p>Đã hoàn tiền vé ${ticketID}</p>`;

    await transporter.sendMail({
      from: '"FlightHK Support" <your-email@gmail.com>',
      to: passengerEmail,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error("Lỗi gửi email hoàn tiền:", error);
  }
};


// 4. GỬI EMAIL HỦY CHUYẾN BAY HÀNG LOẠT (FLIGHT CANCELLATION)
const sendFlightCancellationToAll = async (emailList, flightNumber, reason = "Lý do khai thác") => {
  if (!emailList || emailList.length === 0) return;

  const variables = {
    flightNumber: flightNumber,
    reason: reason
  };

  const template = renderTemplate("flight_cancellation_notice", variables);
  const subject = template ? template.subject : `[QUAN TRỌNG] Hủy chuyến ${flightNumber}`;
  const html = template ? template.content : `<p>Chuyến bay ${flightNumber} bị hủy. Lý do: ${reason}</p>`;

  const sendPromises = emailList.map((email) => {
    return transporter
      .sendMail({
        from: `"FlightHK Notification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html,
      })
      .catch((err) => console.error(`Lỗi gửi mail tới ${email}:`, err.message));
  });

  await Promise.all(sendPromises);
  console.log(`Đã gửi thông báo hủy chuyến ${flightNumber} tới ${emailList.length} khách.`);
};


// 5. GỬI BÁO CÁO HỆ THỐNG (SYSTEM REPORT)
const sendSystemReportEmail = async (req, res) => {
  const { overview, tableData, reportEmail } = req.body;

  try {
    const rowsHtml = tableData
      .map(
        (f) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${f.flightNumber}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${f.route}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
            <span style="color: ${f.status === 'active' ? 'green' : 'red'}">
                ${f.status === "active" ? "Đúng giờ" : f.status === "delayed" ? "Trễ" : "Đã hủy"}
            </span>
        </td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(f.revenue)}</td>
      </tr>
    `
      )
      .join("");

    const variables = {
      totalFlights: overview.totalFlights,
      averageRevenue: formatCurrency(overview.averageRevenue),
      averageSeatFill: overview.averageSeatFill.toFixed(2),
      tableRows: rowsHtml, 
    };

    const template = renderTemplate("system_report", variables);
    const subject = template ? template.subject : `[BAO CAO] Hệ thống FlightHK`;
    const html = template ? template.content : `<p>Báo cáo hệ thống...</p>`;

    await transporter.sendMail({
      from: `"Hệ thống FlightHK" <${process.env.EMAIL_USER}>`,
      to: reportEmail,
      subject: `${subject} - ${new Date().toLocaleDateString("vi-VN")}`,
      html: html,
    });

    return res.status(200).json({ status: "success", message: "Gửi báo cáo thành công!" });
  } catch (error) {
    console.error("Email Report Error:", error);
    return res.status(500).json({ status: "error", message: "Lỗi khi gửi email báo cáo" });
  }
};

module.exports = {
  formatEmail,
  sendCancellationEmail,
  sendRefundSuccessEmail,
  sendFlightCancellationToAll,
  sendSystemReportEmail,
};