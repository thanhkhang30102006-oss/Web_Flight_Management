require("dotenv").config();
const nodemailer = require("nodemailer");
const { renderTemplate } = require("../service/editFormEmail/templateManager");
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
const { translateAirport } = require("../storeInformation/mappingAirport");
// Config cho account gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const formatCurrency = (amount, lang = 'vi') => {
 if (lang === 'en') {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND", 
    }).format(amount);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// 1. GỬI EMAIL XÁC NHẬN ĐẶT VÉ & THÔNG TIN VÉ (KÈM PDF) ===============
//
const formatEmail = async (req, res) => {
  const { flight, passenger, totalPrice, ticketInfo, selectedSeats, language } =
    req.body;

  const lang = language || "vi";  
  // Chuẩn bị dữ liệu chung
  const ticketIds = ticketInfo.tickets.map((t) => t.ticketID).join(", ");
  const departureName =
    translateAirport(flight.departurePoint) || flight.departurePoint;
  const arriveName = translateAirport(flight.arrivePoint) || flight.arrivePoint;

  // Xử lý danh sách ghế (Chuyển mảng ghế thành chuỗi HTML để nhét vào biến {{seatDetails}})
  const seatListHtml = (ticketInfo.seats || [])
    .map((seat) => {
      const seatNum = seat.seatNumber.replace(flight.flightNumber, "");
      const seatType =
        seat.seatType === "economy"
          ? lang === "en"
            ? "Economy"
            : "Phổ thông"
          : lang === "en"
          ? "Business"
          : "Thương gia";
      return `<div style="margin-bottom: 5px; padding: 8px; background-color: #f1f5f9; border-radius: 4px;">
                <strong>${
                  lang === "en" ? "Seat" : "Ghế"
                } ${seatNum}</strong> - ${seatType}
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
    totalPrice: formatCurrency(totalPrice, lang),
    seatDetails: seatListHtml,
  };

  try {
    // Template 1: Booking Success (Cảm ơn)
    const bookingTemplate = renderTemplate(
      `booking_success_${lang}`,
      emailVariables
    );
    
    const sub1 = bookingTemplate
      ? bookingTemplate.subject
      : `[FlightHK] Booking Confirmed ${ticketIds}`;
    const html1 = bookingTemplate
      ? bookingTemplate.content
      : `<p>Booking Success. Ticket: ${ticketIds}</p>`;

    // Template 2: Ticket Info (Vé điện tử)
    const ticketTemplate = renderTemplate(`ticket_info_${lang}`, emailVariables);
    const sub2 = ticketTemplate
      ? ticketTemplate.subject
      : `E-Ticket ${flight.flightNumber}`;
    const html2 = ticketTemplate
      ? ticketTemplate.content
      : `<p>Your Ticket Info...</p>`;

    const attachment = await generateTicketPDF(
      flight,
      passenger,
      totalPrice,
      ticketInfo,
      lang
    );

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
        ? [
            {
              filename: attachment.filename,
              content: attachment.content,
              contentType: "application/pdf",
            },
          ]
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
    const template = renderTemplate(`cancellation_confirm_vi`, variables);

    const subject = template
      ? template.subject
      : `[FlightHK] Hủy vé ${ticketID}`;
    const html = template ? template.content : `<p>Đã hủy vé ${ticketID}</p>`;

    await transporter.sendMail({
      from: `FlightHK Support" <${process.env.EMAIL_USER}>`,
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
    const template = renderTemplate("refund_success_vi", variables);

    const subject = template
      ? template.subject
      : `[FlightHK] Hoàn tiền vé ${ticketID}`;
    const html = template
      ? template.content
      : `<p>Đã hoàn tiền vé ${ticketID}</p>`;

    await transporter.sendMail({
      from: `FlightHK Support" <${process.env.EMAIL_USER}>`,
      to: passengerEmail,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error("Lỗi gửi email hoàn tiền:", error);
  }
};

// 4. GỬI EMAIL HỦY CHUYẾN BAY HÀNG LOẠT (FLIGHT CANCELLATION)
const sendFlightCancellationToAll = async (
  emailList,
  flightNumber,
  reason = "Lý do khai thác"
) => {
  if (!emailList || emailList.length === 0) return;

  const variables = {
    flightNumber: flightNumber,
    reason: reason,
  };

  const template = renderTemplate("flight_cancellation_notice_vi", variables);
  const subject = template
    ? template.subject
    : `[QUAN TRỌNG] Hủy chuyến ${flightNumber}`;
  const html = template
    ? template.content
    : `<p>Chuyến bay ${flightNumber} bị hủy. Lý do: ${reason}</p>`;

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
  console.log(
    `Đã gửi thông báo hủy chuyến ${flightNumber} tới ${emailList.length} khách.`
  );
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
            <span style="color: ${f.status === "active" ? "green" : "red"}">
                ${
                  f.status === "active"
                    ? "Đúng giờ"
                    : f.status === "delayed"
                    ? "Trễ"
                    : "Đã hủy"
                }
            </span>
        </td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(
          f.revenue
        )}</td>
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

    const template = renderTemplate("system_report_vi", variables);
    const subject = template ? template.subject : `[BAO CAO] Hệ thống FlightHK`;
    const html = template ? template.content : `<p>Báo cáo hệ thống...</p>`;

    await transporter.sendMail({
      from: `"Hệ thống FlightHK" <${process.env.EMAIL_USER}>`,
      to: reportEmail,
      subject: `${subject} - ${new Date().toLocaleDateString("vi-VN")}`,
      html: html,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Gửi báo cáo thành công!" });
  } catch (error) {
    console.error("Email Report Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi khi gửi email báo cáo" });
  }
};
// Hàm hủy vé đơn khách hàng
const sendPersonalCancellationEmail = async (
  passengerEmail,
  ticketID,
  passengerName
) => {
  try {
    const finalName = passengerName || "Quý khách";
    const subject = `[FlightHK] Xác nhận hủy vé thành công - ${ticketID}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #0056b3;">Xác Nhận Hủy Vé</h2>
        <p>Xin chào <strong>${finalName}</strong>,</p>
        <p>Yêu cầu hủy vé <strong>${ticketID}</strong> của quý khách đã được thực hiện thành công trên hệ thống.</p>
        <p>Trạng thái vé: <strong style="color: red;">Đã hủy (Cancelled)</strong></p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0056b3; margin: 20px 0;">
            <p style="margin: 0;">Nếu vé của quý khách thuộc diện được hoàn tiền, hệ thống sẽ gửi email thông báo tiếp theo về quy trình hoàn tiền trong vòng 24h làm việc.</p>
        </div>

        <p>Cảm ơn quý khách đã sử dụng dịch vụ của FlightHK.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
      to: passengerEmail,
      subject: subject,
      html: html,
    });

    console.log(`Đã gửi email xác nhận hủy vé ${ticketID}`);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email khách tự hủy vé:", error);
    return false;
  }
};

// 2. Hàm gửi email khôi phục vé (Dùng HTML trực tiếp)
const sendRestoreTicketEmail = async (
  passengerEmail,
  ticketID,
  passengerName
) => {
  try {
    const finalName = passengerName || "Quý khách";
    const subject = `[FlightHK] Thông báo khôi phục vé thành công - ${ticketID}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #28a745;">Khôi Phục Vé Thành Công</h2>
        <p>Xin chào <strong>${finalName}</strong>,</p>
        <p>Vé máy bay mang mã số <strong>${ticketID}</strong> của quý khách đã được khôi phục trạng thái thành công.</p>
        
        <div style="background-color: #f0fff4; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="margin: 0;"><strong>Trạng thái hiện tại:</strong> <span style="color: green; font-weight: bold;">Có hiệu lực (Valid)</span></p>
            <p style="margin: 5px 0 0;">Quý khách có thể sử dụng vé này để làm thủ tục bay bình thường.</p>
        </div>

        <p>Chúc quý khách có một chuyến bay tốt đẹp cùng FlightHK.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
      to: passengerEmail,
      subject: subject,
      html: html,
    });

    console.log(`Đã gửi email khôi phục vé ${ticketID} cho khách.`);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email khôi phục vé:", error);
    return false;
  }
};

// Mail xác nhận gửi tài khoản staff
const sendNewStaffAccountEmail = async (
  email,
  staffName,
  username,
  password,
  position
) => {
  try {
    const subject = `[FlightHK] Chào mừng nhân viên mới - Thông tin tài khoản`;

    // HTML email template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #0056b3;">Chào mừng gia nhập đội ngũ FlightHK</h2>
        <p>Xin chào <strong>${staffName}</strong>,</p>
        <p>Tài khoản nhân viên của bạn đã được khởi tạo thành công. Dưới đây là thông tin đăng nhập hệ thống:</p>
        
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Tên đăng nhập:</strong> ${username}</p>
            <p style="margin: 5px 0;"><strong>Mật khẩu mặc định:</strong> <span style="color: #d9534f; font-weight: bold;">${password}</span></p>
            <p style="margin: 5px 0;"><strong>Quyền hạn:</strong> ${position}</p>
        </div>

        <p><em>Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu tiên để bảo mật tài khoản.</em></p>
        <hr>
        <p style="font-size: 12px; color: #666;">Đây là email tự động từ hệ thống quản trị FlightHK.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FlightHK Admin Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`Đã gửi email cấp tài khoản cho nhân viên: ${email}`);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email cấp tài khoản staff:", error);
    return false;
  }
};
const sendDeleteStaffAccountEmail = async (email, staffName, staffID) => {
  try {
    const subject = `[FlightHK] Thông báo hủy kích hoạt tài khoản nhân viên`;

    // HTML email template cho việc XÓA
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #dc3545;">Thông báo ngừng quyền truy cập</h2>
        <p>Xin chào <strong>${staffName}</strong>,</p>
        <p>Chúng tôi xin thông báo tài khoản nhân viên của bạn tại hệ thống <strong>FlightHK</strong> đã bị xóa và ngừng kích hoạt.</p>
        
        <div style="background-color: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #dc3545;">
            <p style="margin: 5px 0;"><strong>Mã nhân viên bị xóa:</strong> ${staffID}</p>
            <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: #dc3545; font-weight: bold;">Đã xóa (Deactivated)</span></p>
            <p style="margin: 5px 0;"><strong>Thời gian hiệu lực:</strong> Ngay lập tức</p>
        </div>

        <p>Bạn sẽ không thể đăng nhập vào hệ thống quản trị kể từ thời điểm này.</p>
        <p><em>Nếu đây là sự nhầm lẫn, vui lòng liên hệ với bộ phận Quản trị viên (Admin) ngay lập tức.</em></p>
        <hr>
        <p style="font-size: 12px; color: #666;">Đây là email tự động từ hệ thống quản trị FlightHK.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FlightHK Admin Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`Đã gửi email thông báo xóa tài khoản tới: ${email}`);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email xóa staff:", error);
    return false;
  }
};
module.exports = {
  formatEmail,
  sendCancellationEmail,
  sendRefundSuccessEmail,
  sendFlightCancellationToAll,
  sendSystemReportEmail,
  sendPersonalCancellationEmail,
  sendRestoreTicketEmail,
  sendNewStaffAccountEmail,
  sendDeleteStaffAccountEmail,
};
