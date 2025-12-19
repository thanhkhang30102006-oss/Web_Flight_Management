require("dotenv").config();
const {
  translateAirport,
  AIRPORT_MAP,
} = require("../storeInformation/mappingAirport");
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
const qrCode = require("qrcode");
const PDFDocument = require("pdfkit");
const path = require("path");
const FONT_PATH = path.resolve(__dirname, "../fonts/times.ttf");
// Config cho account gmail

const TRANSLATIONS = {
  vi: {
    emailSubjectSuccess: "[FLIGHTHK] Thông báo mua vé thành công",
    emailSubjectTicket: "Vé Máy Bay Điện Tử Chuyến",
    thankYouHeader: "[ĐSVN] Thông báo mua vé thành công",
    greeting: "Kính gửi Quý khách hàng,",
    thankYouBody1:
      "Xin trân trọng cảm ơn quý khách đã lựa chọn sử dụng dịch vụ đặt vé hàng không trực tuyến công ty FlightHK của chúng tôi.",
    printInstruction: "Quý khách có thể thực hiện in vé bằng các cách sau:",
    printMethod: "Tại các điểm in vé tự động của các sân bay",
    softCopyNote:
      "Trong trường hợp không in được vé do vấn đề kỹ thuật, quý khách có thể lưu bản mềm trên các thiết bị di động cá nhân như smart phone, máy tính bảng,... khi check-in.",
    promoHeader:
      "Ngoài ra, quý khách còn được hưởng chính sách ưu đãi của các đối tác liên kết như:",
    promoBody:
      "Voucher giảm giá tới 20% khi sử dụng dịch vụ vé thông qua thanh toán VietQR khi đi và đến tại các sân bay",
    noteHeader: "Chú ý:",
    note1:
      "Khi in vé ở các sân bay, quý khách vui lòng mang theo giấy tờ tùy thân đã được sử dụng để mua vé cùng với mã vé khách hàng nhận được trong email này.",
    note2:
      "Để đảm bảo quyền lợi của mình, quý khách vui lòng mang theo vé và giấy tờ tùy thân ghi trên vé trong suốt hành trình và xuất trình cho nhân viên sân bay khi có yêu cầu.",
    note3: "Đây là email gửi tự động. Xin vui lòng không trả lời email này.",
    contactSupport:
      "Quý khách có thể liên hệ với trung tâm hỗ trợ khách hàng <strong>0364616619</strong> để được trợ giúp.",
    footerGreeting: "Xin Trân trọng cảm ơn!",
    companyName: "Công ty Dịch vụ FlightHK.",
    // Ticket Email
    ticketHeader: "Vé điện tử của quý khách trong thư này!",
    envProtection:
      "Để góp phần bảo vệ môi trường chúng tôi khuyến khích khách hàng sử dụng vé điện tử lên check-in, hạn chế in vé giấy.",
    bookingConfirmed:
      "Yêu cầu đặt vé của quý khách đã được xác nhận thành công. Quý khách vui lòng xem vé điện tử trong tập tin đính kèm.",
    flightInfoTitle: "THÔNG TIN CHUYẾN BAY",
    route: "NƠI ĐI, NƠI ĐẾN",
    bookingCode: "Mã đặt vé",
    aircraft: "Máy bay",
    passengerTitle: "TÊN HÀNH KHÁCH",
    seat: "Ghế",
    classEconomy: "Phổ thông",
    classBusiness: "Thương gia",
    ticketValidNote:
      "- Vé có giá trị khi hành khách có giấy tờ tùy thân trùng khớp thông tin in trên thẻ.",
    checkinNote:
      "- Quý khách vui lòng có mặt tại sân bay trước giờ bay 2 tiếng.",
    refundLink:
      "- Vui lòng tham khảo quy định hoàn đổi vé online <a href='#'>tại đây</a>",
    supportNeeded: "Quý khách cần hỗ trợ?",
    hotline: "Tổng đài",
    wish: "Kính chúc Quý khách có một chuyến đi tốt đẹp!",
    // PDF Specific
    pdfTitle: "VÉ ĐIỆN TỬ",
    pdfGreetingBody:
      "Xin trân trọng cảm ơn quý khách đã lựa chọn dịch vụ của FlightHK. Thông tin vé như sau:",
    pdfJourneyInfo: "Thông tin hành trình:",
    pdfRoute: "ĐIỂM KHỞI HÀNH - ĐIỂM ĐẾN / ROUTE",
    pdfFlightNo: "SỐ HIỆU CHUYẾN BAY / FLIGHT",
    pdfDate: "NGÀY ĐI / DATE",
    pdfTime: "GIỜ KHỞI HÀNH / TIME",
    pdfSeat: "GHẾ / SEAT",
    pdfPassengerInfo: "Thông tin hành khách:",
    pdfName: "HỌ TÊN / FULL NAME",
    pdfPrice: "TỔNG GIÁ VÉ / TOTAL PRICE",
    pdfBookingCodePV: "Mã đặt chỗ PV",
    pdfFooter1:
      "- Mã QR này chứa tất cả thông tin quan trọng. Vui lòng xuất trình mã này khi làm thủ tục check-in.",
    pdfFooter2: "- Đây là vé điện tử. Quý khách không cần in ra giấy.",
  },
  en: {
    emailSubjectSuccess: "[FLIGHTHK] Booking Success Notification",
    emailSubjectTicket: "Electronic Flight Ticket - Flight",
    thankYouHeader: "[FlightHK] Booking Confirmation",
    greeting: "Dear Valued Customer,",
    thankYouBody1:
      "Thank you for choosing FlightHK's online flight booking service.",
    printInstruction: "You can print your ticket via:",
    printMethod: "Automatic ticket kiosks at airports",
    softCopyNote:
      "In case of technical issues preventing printing, please save the soft copy on your mobile devices (smartphone, tablet) for check-in.",
    promoHeader: "Additionally, enjoy exclusive offers from our partners:",
    promoBody:
      "Up to 20% discount voucher when paying via VietQR at departure and arrival airports.",
    noteHeader: "Notice:",
    note1:
      "When printing tickets at the airport, please bring the ID used for booking along with the ticket code in this email.",
    note2:
      "To ensure your rights, please bring the ticket and the ID listed on the ticket throughout the journey and present them to airport staff upon request.",
    note3: "This is an automated email. Please do not reply.",
    contactSupport:
      "You can contact our customer support center at <strong>0364616619</strong> for assistance.",
    footerGreeting: "Sincerely, thank you!",
    companyName: "FlightHK Service Company.",
    // Ticket Email
    ticketHeader: "Your E-Ticket is enclosed!",
    envProtection:
      "To protect the environment, we encourage using E-Tickets for check-in instead of printing paper tickets.",
    bookingConfirmed:
      "Your booking request has been successfully confirmed. Please find your E-Ticket in the attached file.",
    flightInfoTitle: "FLIGHT INFORMATION",
    route: "ROUTE",
    bookingCode: "Booking Code",
    aircraft: "Aircraft",
    passengerTitle: "PASSENGER NAME",
    seat: "Seat",
    classEconomy: "Economy",
    classBusiness: "Business",
    ticketValidNote:
      "- Ticket is valid when the passenger holds ID matching the information on the ticket.",
    checkinNote: "- Please be at the airport 2 hours before departure time.",
    refundLink:
      "- Please refer to the online refund/exchange policy <a href='#'>here</a>",
    supportNeeded: "Need support?",
    hotline: "Hotline",
    wish: "We wish you a pleasant flight!",
    // PDF Specific
    pdfTitle: "E-TICKET",
    pdfGreetingBody:
      "Thank you for choosing FlightHK. Your ticket information is as follows:",
    pdfJourneyInfo: "Journey Information:",
    pdfRoute: "ROUTE",
    pdfFlightNo: "FLIGHT NO",
    pdfDate: "DATE",
    pdfTime: "DEPARTURE TIME",
    pdfSeat: "SEAT",
    pdfPassengerInfo: "Passenger Information:",
    pdfName: "FULL NAME",
    pdfPrice: "TOTAL PRICE",
    pdfBookingCodePV: "Booking Code PV",
    pdfFooter1:
      "- This QR code contains all important information. Please present it at check-in.",
    pdfFooter2: "- This is an electronic ticket. No printing required.",
  },
};
const getText = (lang, key) => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["vi"][key];
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createThankYouEmail = (passengerName, lang) => {
  const safeLang =
    lang && lang.toString().toLowerCase().startsWith("en") ? "en" : "vi";

  const t = TRANSLATIONS[safeLang];

  return `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; background-color: #f7f7f7;">
            <h2 style="color: #0056b3; border-bottom: 2px solid #ddd; padding-bottom: 10px;">${t.thankYouHeader}</h2>
            
            <p>${t.greeting} ${passengerName}</p>
            
            <p>${t.thankYouBody1}</p>
            
            <p>
                ${t.printInstruction}
                <ul style="padding-left: 20px;">
                    <li> ${t.printMethod}</li>
                </ul>
            </p>
            
            <p>${t.softCopyNote}</p>
            
            <div style="border: 1px solid #ffeeba; background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="font-weight: bold; margin: 0;">
                    ${t.promoHeader}
                    ${t.promoBody}
                </p>
            </div>
            
            <p style="font-weight: bold; margin-bottom: 5px;">${t.noteHeader}</p>
            <ul style="padding-left: 20px;">
                <li> ${t.note1}</li>
                <li> ${t.note2}</li>
                <li> ${t.note3}</li>
                <li> ${t.contactSupport}</li>
            </ul>
            
            <p>${t.footerGreeting}</p>
            
            <p style="margin-top: 30px;">
                ${t.companyName}
            </p>
        </div>
    `;
};
const createTicketInfoEmail = (
  flight,
  passenger,
  totalPrice,
  ticketInfo,
  selectedSeats,
  lang
) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  const passengerName = passenger.name || "AAA";
  // Điểm đi- điểm đến
  const departurePoint = flight.departurePoint;
  const arrivePoint = flight.arrivePoint;
  const departureName = translateAirport(departurePoint) ?? departurePoint;
  const arriveName = translateAirport(arrivePoint) ?? arrivePoint;
  // Ngày đi - Ngày đến
  const departureDay = flight.departureDay;
  const arriveDay = flight.arriveDay;
  // Giờ đi - giờ đến
  const departureTime = flight.departureTime;
  const arriveTime = flight.arriveTime;

  const flightNumber = flight.flightNumber;

  // Thông tin về ghế
  const seats = ticketInfo.seats || "Bị lỗi lấy ghế";
  const seatsDetailHtml = seats
    ?.map((seat, index) => {
      const seatNumber = seat.seatNumber.replace(flightNumber, "");
      const seatType =
        seat.seatType === "economy" ? t.classEconomy : t.classBusiness;
      return `
           <div style="margin-bottom: 15px;">
                <div style="background-color: #e9ecef; padding: 10px; border-radius: 5px;">
                    <span style="font-weight: bold;">${t.seat} ${seatNumber}, ${seatType}</span>
                </div>
            </div>
        `;
    })
    .join("");
  const tickets = ticketInfo.tickets;
  const ticketIds = tickets.map((ticket) => ticket.ticketID);

  const allTicketIds = ticketIds.join(", ");

  // QR DATA

  return `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; padding: 0; background-color: #ffffff;">

            <h1 style="text-align: center; color: #0056b3; font-size: 24px; padding: 0 20px;">
                ${t.ticketHeader}
            </h1>
            <p style="text-align: center; color: #555; padding: 0 20px; font-size: 14px;">
                ${t.envProtection}
            </p>
            
            <div style="padding: 20px;">
                <p style="font-weight: bold; font-size: 16px;">${t.greeting} ${passengerName},</p>
                <p>${t.bookingConfirmed}</p>
            </div>
            
            <h3 style="color: #0056b3; border-bottom: 2px solid #ddd; padding: 10px 20px; margin: 0;">
                ${t.flightInfoTitle}
            </h3>
            
            <div style="padding: 20px; background-color: #f0f8ff;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; padding: 5px 0;"><strong>${t.route}</strong></td>
                        <td style="width: 50%; padding: 5px 0;">${departureName} - ${arriveName}</td>
                    </tr>
                    <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #ccc; margin: 5px 0;"></td></tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>${t.bookingCode}:</strong></td>
                        <td style="padding: 5px 0;"><strong style="color: #d9534f;">${allTicketIds}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>${t.aircraft}: ${flightNumber}</strong></td>
                        <td style="padding: 5px 0; text-align: right;">
                            <span style="display: block;"><strong>${departureDay}</strong></span>
                            <span style="display: block; font-size: 18px;">${departureTime} - ${departureName}</span>
                            <div style="width: 1px; height: 30px; background-color: #ccc; margin: 5px auto;"></div>
                            <span style="display: block; font-size: 18px;">${arriveTime} - ${arriveName}</span>
                            <span style="display: block; color: #888; font-size: 12px;">${arriveDay}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h3 style="color: #0056b3; border-bottom: 2px solid #ddd; padding: 10px 20px; margin: 0;">
                ${t.passengerTitle}:
            </h3>
            <div style="padding: 20px;">
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                    1. ${passengerName}
                </p>
                ${seatsDetailHtml}
                <ul style="list-style-type: none; padding-left: 0; margin-top: 20px; font-size: 14px; color: #333;">
                    <li>${t.ticketValidNote}</li>
                    <li>${t.checkinNote}</li>
                    <li>${t.refundLink}</li>
                </ul>
            </div>
            
            <div style="padding: 20px; border-top: 1px solid #ddd; background-color: #f0f0f0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <p style="font-weight: bold; margin-bottom: 5px;">${t.supportNeeded}</p>
                            <p style="margin: 0;">${t.hotline}: <strong>1900.599.997</strong></p>
                            <p style="margin: 0;"><a href="mailto:flighthk.booking@gmail.com" style="color: #0056b3;">flighthk.booking@gmail.com</a></p>
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <p style="font-weight: bold; margin-bottom: 5px;">${t.pdfBookingCodePV}</p>
                            <p style="font-size: 20px; font-weight: bold; color: #d9534f; margin: 0;">${allTicketIds}</p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="background-color: #343a40; color: white; text-align: center; padding: 15px 0;">
                <h3 style="margin: 0; font-size: 18px;">${t.wish}</h3>
            </div>
        </div>
    `;
};
// File thông tin chi tiết

// Hàm async tạo mã QR
const generateQRCodeBuffer = async (dataString) => {
  try {
    const options = {
      type: "png",
      width: 150,
      errorCorrectionLevel: "H",
    };

    const buffer = await qrCode.toBuffer(dataString, options);
    return buffer;
  } catch (err) {
    console.error("Lỗi khi tạo mã QR Buffer:", err);
    return null;
  }
};

// PDF sửa đổi file
const drawTicketPDF = async (doc, data, qrCodeBuffer, lang) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  const PADDING = 20;
  const HEADER_HEIGHT = 60;
  const LINE_Y = 250;
  // --- Header ---
  try {
    doc.font(FONT_PATH);
  } catch (error) {
    console.error("Lỗi khi load font. Vui lòng kiểm tra đường dẫn:", FONT_PATH);
  }
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill("#0056b3");
  doc
    .fillColor("white")
    .fontSize(16)
    .text("FlightHK", PADDING, 20)
    .text(t.pdfTitle, doc.page.width - 200, 20, {
      width: 200,
      align: "right",
    });

  // --- Lời chào ---
  let currentY = HEADER_HEIGHT + PADDING;
  doc
    .fillColor("black")
    .fontSize(12)
    .text(t.greeting, PADDING, currentY)
    .text(t.pdfGreetingBody, { align: "left" });

  currentY = doc.y + 10;

  // --- Khung thông tin vé ---
  const TICKET_FRAME_Y = currentY;
  const TICKET_FRAME_HEIGHT = 420;
  doc
    .rect(
      PADDING,
      TICKET_FRAME_Y,
      doc.page.width - 2 * PADDING,
      TICKET_FRAME_HEIGHT
    )
    .stroke("#E0E0E0");

  // Vị trí bắt đầu của các cột bên trong khung
  const LEFT_COL_X = PADDING + 10;
  const RIGHT_COL_X = doc.page.width - PADDING - 160;
  let infoY = TICKET_FRAME_Y + 10;

  // --- Cột trái (Thông tin chuyến bay và hành khách) ---
  doc.fillColor("#555").fontSize(10);
  infoY = doc.y + 5;

  const drawInfoBlock = (label, value) => {
    doc
      .fillColor("#555")
      .fontSize(10)
      .text(label, LEFT_COL_X, infoY, { continued: false });
    doc
      .fillColor("black")
      .fontSize(13)
      .text(value, LEFT_COL_X, doc.y, { continued: false, oblique: true });
    infoY = doc.y + 10;
  };

  // Thông tin chuyến bay
  doc.fontSize(12).fillColor("black").text(t.pdfJourneyInfo, LEFT_COL_X, infoY);
  infoY = doc.y + 5;

  drawInfoBlock(t.pdfRoute, `${data.departureName} - ${data.arriveName}`);
  drawInfoBlock(t.pdfFlightNo, data.flightNumber);
  drawInfoBlock(t.pdfDate, data.departureDay);
  drawInfoBlock(t.pdfTime, data.departureTime);
  const seatDetailsString = data.seatDetails
    .map((s) => `${s.seatNumber} (${s.seatType})`)
    .join(", ");
  drawInfoBlock(t.pdfSeat, seatDetailsString);

  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor("black")
    .text(t.pdfPassengerInfo, LEFT_COL_X, infoY);
  infoY = doc.y + 5;

  drawInfoBlock(t.pdfName, data.passengerName);
  const formattedPrice = new Intl.NumberFormat(
    lang === "en" ? "en-US" : "vi-VN",
    {
      style: "currency",
      currency: "VND",
    }
  ).format(data.totalPrice);
  drawInfoBlock(t.pdfPrice, formattedPrice);

  // --- Cột phải (Mã QR và Mã đặt chỗ) ---
  if (qrCodeBuffer) {
    doc.image(qrCodeBuffer, RIGHT_COL_X + 10, TICKET_FRAME_Y + 15, {
      width: 140,
      height: 140,
    });
  } else {
    doc.fillColor("red").text("Lỗi QR Code", RIGHT_COL_X, TICKET_FRAME_Y + 50);
  }

  // Mã đặt chỗ
  doc
    .fillColor("black")
    .fontSize(12)
    .text(t.pdfBookingCodePV, RIGHT_COL_X, TICKET_FRAME_Y + 165, {
      align: "center",
      width: 160,
    });
  doc
    .fillColor("#d9534f")
    .fontSize(20)
    .text(data.allTicketIds, RIGHT_COL_X, TICKET_FRAME_Y + 180, {
      align: "center",
      width: 160,
    });

  currentY = TICKET_FRAME_Y + TICKET_FRAME_HEIGHT + 10;
  doc.fillColor("#333").fontSize(10).text(t.pdfFooter1, PADDING, currentY);
  doc.text(t.pdfFooter2);
};
// File thông tin

const informationFile = async (
  flight,
  passenger,
  totalPrice,
  ticketInfo,
  selectedSeats,
  lang
) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  const passengerName = passenger.name;
  const flightNumber = flight.flightNumber;
  const tickets = ticketInfo.tickets;
  const ticketIds = tickets.map((ticket) => ticket.ticketID);
  const allTicketIds = ticketIds.join(", ");

  const seats = ticketInfo.seats;
  const seatInfo = seats.map((s) => ({
    seatNumber: s.seatNumber.replace(flightNumber, ""),
    seatType: s.seatType === "economy" ? t.classEconomy : t.classBusiness,
  }));
  const departureName = translateAirport(flight.departurePoint);
  const arriveName = translateAirport(flight.arrivePoint);
  const qrData = {
    dp: flight.departurePoint,
    ap: flight.arrivePoint,
    fn: flightNumber,
    dd: flight.departureDay,
    dt: flight.departureTime,
    sn: seatInfo.map((s) => s.seatNumber).join("/"),
    pn: passengerName,
    st: seatInfo.map((s) => s.seatType).join("/"),
    tp: totalPrice,
    tId: allTicketIds,
  };
  const pdfData = {
    passengerName: passengerName,
    departureName: departureName,
    arriveName: arriveName,
    flightNumber: flightNumber,
    departureDay: flight.departureDay,
    departureTime: flight.departureTime,
    seatDetails: seatInfo,
    totalPrice,
    allTicketIds: allTicketIds,
  };
  const qrDataString = JSON.stringify(qrData);

  const qrCodeBuffer = await generateQRCodeBuffer(qrDataString);

  if (!qrCodeBuffer) {
    console.error("Không thể tạo QR Code Buffer.");
    return null;
  }
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  await drawTicketPDF(doc, pdfData, qrCodeBuffer, lang);

  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });

  return {
    filename: `E-Ticket_${allTicketIds}.pdf`,
    content: pdfBuffer,
    contentType: "application/pdf",
  };
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

  const { flight, passenger, totalPrice, ticketInfo, selectedSeats, language } =
    req.body;
  const lang =
    language && language.toString().toLowerCase().startsWith("en")
      ? "en"
      : "vi";
  console.log("Ngôn ngữ nhận được:", language); // Log để kiểm tra
  console.log("Ngôn ngữ sử dụng:", lang);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi; // Fallback an toàn

  const recipientEmail = passenger.email;
  if (!recipientEmail) {
    return res.status(400).json({
      message: "Không tìm thấy email người nhận trong dữ liệu hành khách.",
    });
  }
  const attachment = await informationFile(
    flight,
    passenger,
    totalPrice,
    ticketInfo,
    selectedSeats,
    lang
  );
  const thankYouContent = createThankYouEmail(passenger.name, lang);
  const ticketInfoContent = await createTicketInfoEmail(
    flight,
    passenger,
    totalPrice,
    ticketInfo,
    selectedSeats,
    lang
  );

  const email1Options = {
    from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: t.emailSubjectSuccess,
    html: thankYouContent,
  };

  const email2Options = {
    from: `"FlightHK Support" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `${t.emailSubjectTicket} ${flight.flightNumber}`,
    html: ticketInfoContent,
    attachments: attachment
      ? [
          {
            filename: attachment.filename,
            content: attachment.content,
            contentType: "application/pdf",
          },
        ]
      : [],
  };

  const sentResults = [];
  try {
    const info1 = await transporter.sendMail(email1Options);
    sentResults.push({
      type: "ThankYouEmail",
      status: "success",
      messageId: info1.messageId,
    });
  } catch (error1) {
    console.error("Lỗi khi gửi Email Cảm ơn:", error1);
    sentResults.push({
      type: "ThankYouEmail",
      status: "error",
      message: error1.message,
    });
  }

  try {
    const info2 = await transporter.sendMail(email2Options);
    sentResults.push({
      type: "TicketInfoEmail",
      status: "success",
      messageId: info2.messageId,
    });
  } catch (error2) {
    console.error("Lỗi khi gửi Email Chi tiết Vé:", error2);
    sentResults.push({
      type: "TicketInfoEmail",
      status: "error",
      message: error2.message,
    });
  }

  const allFailed = sentResults.every((result) => result.status === "error");

  if (allFailed) {
    return res.status(500).json({
      message:
        "Không thể gửi được cả hai email. Vui lòng kiểm tra cấu hình hoặc log lỗi.",
      results: sentResults,
    });
  }

  return res.status(200).json({
    message: "Hoàn tất xử lý gửi email. Vui lòng kiểm tra chi tiết kết quả.",
    results: sentResults,
    success: "success",
  });
};

// Gửi email phản hồi bạn đã hủy vé thành công
const sendCancellationEmail = async (passengerEmail, ticketID) => {
  const mailOptions = {
    from: '"FlightHK Support" <your-email@gmail.com>',
    to: passengerEmail,
    subject: `[Thông báo hủy vé] Mã đặt chỗ: ${ticketID}`,
    html: `
      <h3>Hủy vé thành công!</h3>
      <p>Chào bạn, chúng tôi xác nhận vé <b>${ticketID}</b> của bạn đã được hủy thành công.</p>
      <p>Để tiến hành hoàn tiền, vui lòng phản hồi email này bằng cách: </p>
      <ul>
        <li>Hệ thống sẽ dựa theo số tài khoản khách hàng đã chuyển từ trước</li>
      </ul>
      <p>Trân trọng,</p>
    `,
  };
  // Gửi email phản hồi cho khách hàng đã hoàn tiền

  return await transporter.sendMail(mailOptions);
};

const sendRefundSuccessEmail = async (passengerEmail, ticketID) => {
  const mailOptions = {
    from: '"FlightHK Support" <your-email@gmail.com>',
    to: passengerEmail,
    subject: `Re: [Thông báo hủy vé] Mã đặt chỗ: ${ticketID}`, // Thêm Re:
    html: `
      <h3>Hoàn tiền thành công!</h3>
      <p>Chúng tôi đã thực hiện lệnh chuyển khoản hoàn tiền cho mã vé <b>${ticketID}</b>.</p>
      <p>Số tiền sẽ hiển thị trong tài khoản của bạn sau 1-3 ngày làm việc tùy ngân hàng.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của FlightHK.</p>
    `,
    // Logic để tạo thread trong Email
  };

  await transporter.sendMail(mailOptions);
};

// Hàm hủy chuyến bay gửi emaail xin lỗi khách hàng + hoàn tiền
const sendFlightCancellationToAll = async (
  emailList,
  flightNumber,
  reason = "Lý do khai thác / Operational reasons"
) => {
  if (!emailList || emailList.length === 0) return;

  // Mẫu Email HTML
  const mailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; background-color: #ffffff;">
        <h2 style="color: #d9534f; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
            [FLIGHTHK] THÔNG BÁO HỦY CHUYẾN BAY / FLIGHT CANCELLATION NOTICE
        </h2>
        
        <p><strong>Kính gửi Quý khách hàng / Dear Valued Customer,</strong></p>
        
        <p>Chúng tôi rất tiếc phải thông báo chuyến bay <strong>${flightNumber}</strong> của quý khách đã bị hủy.</p>
        <p><em>We regret to inform you that your flight <strong>${flightNumber}</strong> has been cancelled.</em></p>
        
        <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Lý do hủy / Reason:</strong> ${reason ? reason : ""}
        </div>

        <h3>HƯỚNG DẪN HOÀN VÉ / REFUND INSTRUCTIONS:</h3>
        <p>Hệ thống đã tự động ghi nhận yêu cầu hủy vé của quý khách. Để được hoàn tiền, quý khách vui lòng:</p>
        <ul>
            <li>Kiểm tra email xác nhận hủy vé chi tiết sẽ được gửi sau ít phút.</li>
            <li>Hoặc liên hệ tổng đài <strong>1900.599.997</strong> để được hỗ trợ đổi chuyến bay khác miễn phí.</li>
        </ul>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p>Chúng tôi thành thật xin lỗi vì sự bất tiện này và mong nhận được sự thông cảm của quý khách.</p>
        <p><em>We sincerely apologize for this inconvenience and appreciate your understanding.</em></p>
        
        <p><strong>Công ty Dịch vụ FlightHK</strong></p>
    </div>
  `;

  const sendPromises = emailList.map((email) => {
    return transporter
      .sendMail({
        from: `"FlightHK Notification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[QUAN TRỌNG] Thông báo hủy chuyến bay ${flightNumber}`,
        html: mailContent,
      })
      .catch((err) => console.error(`Lỗi gửi mail tới ${email}:`, err.message));
  });

  // Chạy song song tất cả email
  await Promise.all(sendPromises);
  console.log(
    `Đã gửi thông báo hủy chuyến ${flightNumber} tới ${emailList.length} địa chỉ email.`
  );
};
module.exports = {
  formatEmail,
  sendCancellationEmail,
  sendRefundSuccessEmail,
  sendFlightCancellationToAll,
};
