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
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createThankYouEmail = (pasengerName) => {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; background-color: #f7f7f7;">
            <h2 style="color: #0056b3; border-bottom: 2px solid #ddd; padding-bottom: 10px;">[ĐSVN] Thông báo mua vé thành công</h2>
            
            <p>Kính gửi Quý khách hàng,${pasengerName}</p>
            
            <p>
                Xin trân trọng cảm ơn quý khách đã lựa chọn sử dụng dịch vụ đặt vé hàng không trực tuyến công ty HKFlight của chúng tôi.
            </p>
            
            <p>
                Quý khách có thể thực hiện in vé bằng các cách sau:
                <ul style="padding-left: 20px;">
                    <li>- Tại các điểm in vé tự động của các sân bay</li>
                </ul>
            </p>
            
            <p>
                Trong trường hợp không in được vé do vấn đề kỹ thuật, quý khách có thể lưu bản mềm trên các thiết bị di động cá nhân như smart phone, máy tính bảng,... khi check-in.
            </p>
            
            <div style="border: 1px solid #ffeeba; background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="font-weight: bold; margin: 0;">
                    Ngoài ra, quý khách còn được hưởng chính sách ưu đãi của các đối tác liên kết như:
                    Voucher giảm giá tới 20% khi sử dụng dịch vụ vé thông qua thanh toán VietQR khi đi và đến tại các sân bay
                </p>
            </div>
            
            <p style="font-weight: bold; margin-bottom: 5px;">Chú ý:</p>
            <ul style="padding-left: 20px;">
                <li>- Khi in vé ở các sân bay, quý khách vui lòng mang theo giấy tờ tùy thân đã được sử dụng để mua vé cùng với mã vé khách hàng nhận được trong email này.</li>
                <li>- Để đảm bảo quyền lợi của mình, quý khách vui lòng mang theo vé và giấy tờ tùy thân ghi trên vé  trong suốt hành trình và xuất trình cho nhân viên sân bay khi có yêu cầu.</li>
                <li>- Đây là email gửi tự động. Xin vui lòng không trả lời email này.</li>
                <li>- Quý khách có thể liên hệ với trung tâm hỗ trợ khách hàng <strong>0364616619</strong> để được trợ giúp.</li>
            </ul>
            
            <p>Xin Trân trọng cảm ơn!</p>
            
            <p style="margin-top: 30px;">
                Công ty Dịch vụ HKFlight.
            </p>
        </div>
    `;
};
const createTicketInfoEmail = (
  flight,
  passenger,
  totalPrice,
  ticketInfo,
  selectedSeats
) => {
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
      const seatType = seat.seatType === "economy" ? "Phổ thông" : "Thương gia";
      return `
            <div style="margin-bottom: 15px;">
                <div style="background-color: #e9ecef; padding: 10px; border-radius: 5px;">
                    <span style="font-weight: bold;">Ghế ${seatNumber}, ${seatType}</span>
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
                Vé điện tử của quý khách trong thư này!
            </h1>
            <p style="text-align: center; color: #555; padding: 0 20px; font-size: 14px;">
                Để góp phần bảo vệ môi trường chúng tôi khuyến khích khách hàng sử dụng vé điện tử lên check-in, hạn chế in vé giấy.
            </p>
            
            <div style="padding: 20px;">
                <p style="font-weight: bold; font-size: 16px;">Kính gửi quý khách ${passengerName},</p>
                <p>Yêu cầu đặt vé của quý khách đã được xác nhận thành công. Quý khách vui lòng xem vé điện tử trong tập tin đính kèm (sẽ làm ở bước sau).</p>
            </div>
            
            <h3 style="color: #0056b3; border-bottom: 2px solid #ddd; padding: 10px 20px; margin: 0;">
                THÔNG TIN CHUYẾN BAY
            </h3>
            
            <div style="padding: 20px; background-color: #f0f8ff;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; padding: 5px 0;"><strong>NƠI ĐI, NƠI ĐẾN</strong></td>
                        <td style="width: 50%; padding: 5px 0;">${departureName} - ${arriveName}</td>
                    </tr>
                    <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #ccc; margin: 5px 0;"></td></tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Mã đặt vé:</strong></td>
                        <td style="padding: 5px 0;"><strong style="color: #d9534f;">${allTicketIds}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Máy bay: ${flightNumber}</strong></td>
                        <td style="padding: 5px 0; text-align: right;">
                            <span style="display: block;"><strong>Thứ tư, ${departureDay}</strong></span>
                            <span style="display: block; font-size: 18px;">${departureTime} - Sân bay ${departureName}</span>
                            <span style="display: block; color: #888; font-size: 12px;">${departureDay}</span>
                            <div style="width: 1px; height: 30px; background-color: #ccc; margin: 5px auto;"></div>
                            <span style="display: block; font-size: 18px;">${arriveTime} - Sân bay ${arriveName}</span>
                            <span style="display: block; color: #888; font-size: 12px;">${arriveDay}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h3 style="color: #0056b3; border-bottom: 2px solid #ddd; padding: 10px 20px; margin: 0;">
                TÊN HÀNH KHÁCH:
            </h3>
            <div style="padding: 20px;">
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                    1. ${passengerName}
                </p>
                ${seatsDetailHtml}
                <ul style="list-style-type: none; padding-left: 0; margin-top: 20px; font-size: 14px; color: #333;">
                    <li>- Vé có giá trị khi hành khách có giấy tờ tùy thân trùng khớp thông tin in trên thẻ. (Khách nước ngoài cần đem theo giấy tờ: Passport và Visa gốc, Visa còn thời hạn lưu trú).</li>
                    <li>- Quý khách vui lòng có mặt tại sân bay ${departureName} trước giờ bay 2 tiếng trước giờ khởi hành.</li>
                    <li>- Vui lòng tham khảo quy định hoàn đổi vé online <a href="LINK_QUY_DINH" style="color: #0056b3;">tại đây</a></li>
                </ul>
            </div>
            
            <div style="padding: 20px; border-top: 1px solid #ddd; background-color: #f0f0f0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <p style="font-weight: bold; margin-bottom: 5px;">Quý khách cần hỗ trợ?</p>
                            <p style="margin: 0;">Tổng đài: <strong>1900.599.997</strong></p>
                            <p style="margin: 0;"><a href="mailto:hkflight.booking@gmail.com" style="color: #0056b3;">hkflight.booking@gmail.com</a></p>
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <p style="font-weight: bold; margin-bottom: 5px;">Mã đặt chỗ PV</p>
                            <p style="font-size: 20px; font-weight: bold; color: #d9534f; margin: 0;">${allTicketIds}</p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="background-color: #343a40; color: white; text-align: center; padding: 15px 0;">
                <h3 style="margin: 0; font-size: 18px;">Kính chúc Quý khách có một chuyến đi tốt đẹp!</h3>
            </div>
        </div>
    `;
};

// Flie thông tin chi tiết

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
const drawTicketPDF = async (doc, data, qrCodeBuffer) => {
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
    .text("HKFlight", PADDING, 20)
    .text("VÉ ĐIỆN TỬ", doc.page.width - 200, 20, {
      width: 200,
      align: "right",
    });

  // --- Lời chào ---
  let currentY = HEADER_HEIGHT + PADDING;
  doc
    .fillColor("black")
    .fontSize(12)
    .text("Kính gửi Quý khách hàng,", PADDING, currentY)
    .text(
      "Xin trân trọng cảm ơn quý khách đã lựa chọn sử dụng dịch vụ của công ty HKFlight. Quý khách đã thực hiện mua vé thành công với thông tin như sau:",
      { align: "left" }
    );

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
  doc
    .fontSize(12)
    .fillColor("black")
    .text("Thông tin hành trình:", LEFT_COL_X, infoY);
  infoY = doc.y + 5;

  drawInfoBlock(
    "ĐIỂM KHỞI HÀNH - ĐIỂM ĐẾN",
    `${data.departureName} - ${data.arriveName}`
  );
  drawInfoBlock("SỐ HIỆU CHUYẾN BAY/FLIGHT", data.flightNumber);
  drawInfoBlock("NGÀY ĐI/DATE", data.departureDay);
  drawInfoBlock("GIỜ KHỞI HÀNH/TIME", data.departureTime);
  const seatDetailsString = data.seatDetails
    .map((s) => `${s.seatNumber} (${s.seatType})`)
    .join(", ");
  drawInfoBlock("GHẾ/SEAT", seatDetailsString);

  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor("black")
    .text("Thông tin hành khách:", LEFT_COL_X, infoY);
  infoY = doc.y + 5;

  drawInfoBlock("HỌ TÊN/FULL NAME", data.passengerName);
  drawInfoBlock(
    "TỔNG GIÁ VÉ/TOTAL PRICE",
    `${data.totalPrice.toLocaleString("vi-VN")} VND`
  );

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
    .text("Mã đặt chỗ PV", RIGHT_COL_X, TICKET_FRAME_Y + 165, {
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
  doc
    .fillColor("#333")
    .fontSize(10)
    .text(
      "- Mã QR này chứa tất cả thông tin quan trọng. Vui lòng xuất trình mã này khi làm thủ tục check-in.",
      PADDING,
      currentY
    );
  doc.text("- Đây là vé điện tử. Quý khách không cần in ra giấy.");
};
// File thông tin

const informationFile = async (
  flight,
  passenger,
  totalPrice,
  ticketInfo,
  selectedSeats
) => {
  const passengerName = passenger.name;
  const flightNumber = flight.flightNumber;
  const tickets = ticketInfo.tickets;
  const ticketIds = tickets.map((ticket) => ticket.ticketID);
  const allTicketIds = ticketIds.join(", ");

  const seats = ticketInfo.seats;
  const seatInfo = seats.map((s) => ({
    seatNumber: s.seatNumber.replace(flightNumber, ""),
    seatType: s.seatType === "economy" ? "Phổ thông" : "Thương gia",
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

  await drawTicketPDF(doc, pdfData, qrCodeBuffer);

  doc.end();

  const pdfBuffer = await new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });

  return {
    filename: `Vé_Bay_dien_tu_${allTicketIds}.pdf`,
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
  const { flight, passenger, totalPrice, ticketInfo, selectedSeats } = req.body;

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
    selectedSeats
  );
  const thankYouContent = createThankYouEmail(passenger.name);
  const ticketInfoContent = await createTicketInfoEmail(
    flight,
    passenger,
    totalPrice,
    ticketInfo,
    selectedSeats
  );

  const email1Options = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `[HKFLIGHT] Thông báo mua vé thành công`,
    html: thankYouContent,
  };

  const email2Options = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Vé Máy Bay Điện Tử Chuyến ${flight.flightNumber}`,
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
module.exports = {
  formatEmail,
};
