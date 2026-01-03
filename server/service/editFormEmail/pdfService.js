const PDFDocument = require("pdfkit");
const qrCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const { translateAirport } = require("../../storeInformation/mappingAirport");
// 2. File ngôn ngữ (Để lấy label PDF theo VI/EN)
const { TRANSLATIONS } = require("./emailTranslations");

// ĐƯỜNG DẪN FONT CHỮ (Cần font hỗ trợ tiếng Việt như Times New Roman hoặc Roboto)
const FONT_PATH = path.resolve(__dirname, "../../fonts/times.ttf");

// Hàm tạo mã QR dưới dạng Buffer ảnh

const generateQRCodeBuffer = async (dataString) => {
  try {
    return await qrCode.toBuffer(dataString, {
      type: "png",
      width: 150,
      margin: 1,
      errorCorrectionLevel: "H",
    });
  } catch (err) {
    console.error("Lỗi tạo QR Code:", err);
    return null;
  }
};

const drawTicketPDF = (doc, data, qrCodeBuffer, lang) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  
  const PADDING = 20;
  const HEADER_HEIGHT = 65;

  if (fs.existsSync(FONT_PATH)) {
    doc.font(FONT_PATH);
  } else {
    console.warn("⚠️ Cảnh báo: Không tìm thấy file font tại", FONT_PATH);
    doc.font("Helvetica"); 
  }

  // --- HEADER (Màu xanh) ---
  doc.rect(0, 0, doc.page.width, HEADER_HEIGHT).fill("#0056b3"); // Xanh dương
  
  doc.fillColor("white").fontSize(18).text("FlightHK", PADDING, 20);
  
  doc.fontSize(14).text(t.pdfTitle, doc.page.width - 220, 22, {
    width: 200,
    align: "right",
  });

  // --- LỜI CHÀO ---
  let currentY = HEADER_HEIGHT + 20;
  doc.fillColor("black").fontSize(11).text(t.greeting, PADDING, currentY);
  currentY += 15;
  doc.text(t.pdfGreetingBody, PADDING, currentY, { width: 500 });

  // --- KHUNG VÉ (Rectangle) ---
  currentY += 25;
  const TICKET_FRAME_Y = currentY;
  const TICKET_FRAME_HEIGHT = 420;
  
  doc.lineWidth(1)
     .strokeColor("#E0E0E0")
     .rect(PADDING, TICKET_FRAME_Y, doc.page.width - 2 * PADDING, TICKET_FRAME_HEIGHT)
     .stroke();

  // --- CỘT TRÁI: THÔNG TIN CHI TIẾT ---
  const LEFT_COL_X = PADDING + 15;
  const RIGHT_COL_X = doc.page.width - PADDING - 160; 
  let infoY = TICKET_FRAME_Y + 20;

  const drawInfoBlock = (label, value) => {
    doc.fillColor("#666").fontSize(9).text(label, LEFT_COL_X, infoY);
    doc.fillColor("#000").fontSize(12).font(fs.existsSync(FONT_PATH) ? FONT_PATH : "Helvetica-Bold").text(value, LEFT_COL_X, infoY + 12);
    // Reset font thường
    if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH); 
    infoY += 35; 
  };

  // Tiêu đề section
  doc.fillColor("#000").fontSize(12).text(t.pdfJourneyInfo.toUpperCase(), LEFT_COL_X, infoY);
  infoY += 25;

  drawInfoBlock(t.pdfRoute, `${data.departureName} - ${data.arriveName}`);
  drawInfoBlock(t.pdfFlightNo, data.flightNumber);
  drawInfoBlock(t.pdfDate, data.departureDay); // Hoặc format lại ngày nếu muốn
  drawInfoBlock(t.pdfTime, `${data.departureTime} -> ${data.arriveTime}`);
  
  // Xử lý hiển thị ghế
  const seatString = data.seatDetails.map(s => `${s.seatNumber} (${s.seatType})`).join(", ");
  drawInfoBlock(t.pdfSeat, seatString);

  // Kẻ đường gạch ngang mờ
  infoY += 10;
  doc.moveTo(LEFT_COL_X, infoY).lineTo(RIGHT_COL_X - 20, infoY).strokeColor("#eee").stroke();
  infoY += 20;

  // Thông tin khách hàng & Giá
  doc.fillColor("#000").fontSize(12).text(t.pdfPassengerInfo.toUpperCase(), LEFT_COL_X, infoY);
  infoY += 25;

  drawInfoBlock(t.pdfName, data.passengerName);
  
  // Format giá tiền
  const priceString = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(data.totalPrice);
  drawInfoBlock(t.pdfPrice, priceString);

  // --- CỘT PHẢI: QR CODE & MÃ ĐẶT CHỖ ---
  if (qrCodeBuffer) {
    doc.image(qrCodeBuffer, RIGHT_COL_X, TICKET_FRAME_Y + 20, { width: 140, height: 140 });
  }

  const CODE_Y = TICKET_FRAME_Y + 180;
  doc.fillColor("#000").fontSize(10).text(t.pdfBookingCodePV, RIGHT_COL_X, CODE_Y, { width: 140, align: "center" });
  
  doc.fillColor("#d9534f") 
     .fontSize(18)
     .font(fs.existsSync(FONT_PATH) ? FONT_PATH : "Helvetica-Bold")
     .text(data.allTicketIds, RIGHT_COL_X, CODE_Y + 15, { width: 140, align: "center" });
  
  if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH);

  // --- FOOTER (Lưu ý) ---
  const FOOTER_Y = TICKET_FRAME_Y + TICKET_FRAME_HEIGHT + 15;
  doc.fillColor("#555").fontSize(9).text(t.pdfFooter1, PADDING, FOOTER_Y);
  doc.text(t.pdfFooter2, PADDING, FOOTER_Y + 15);
};

// HÀM CHÍNH: Generate Ticket PDF
 
const generateTicketPDF = async (flight, passenger, totalPrice, ticketInfo, lang = 'vi') => {
  // 1. Chuẩn bị dữ liệu
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  const flightNumber = flight.flightNumber;
  
  // Xử lý danh sách vé
  const ticketIds = ticketInfo.tickets.map(t => t.ticketID);
  const allTicketIds = ticketIds.join(", ");

  // Xử lý danh sách ghế (Translate loại ghế Economy/Business)
  const seatDetails = ticketInfo.seats.map(s => ({
    seatNumber: s.seatNumber.replace(flightNumber, ""),
    seatType: s.seatType === 'economy' ? t.classEconomy : t.classBusiness
  }));

  // Translate tên sân bay
  const departureName = translateAirport(flight.departurePoint) || flight.departurePoint;
  const arriveName = translateAirport(flight.arrivePoint) || flight.arrivePoint;

  // Dữ liệu gói gọn để vẽ PDF
  const pdfData = {
    flightNumber,
    departureName,
    arriveName,
    departureDay: flight.departureDay,
    departureTime: flight.departureTime,
    arriveTime: flight.arriveTime,
    seatDetails,
    passengerName: passenger.name,
    totalPrice,
    allTicketIds
  };

  // 2. Tạo QR Code (Chứa thông tin vắn tắt để quét nhanh)
  const qrData = JSON.stringify({
    fn: flightNumber,
    day: flight.departureDay,
    pn: passenger.name,
    code: allTicketIds
  });
  const qrCodeBuffer = await generateQRCodeBuffer(qrData);

  // 3. Khởi tạo PDF Document
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const buffers = [];

  // Thu thập dữ liệu stream
  doc.on("data", (chunk) => buffers.push(chunk));
  
  // 4. Vẽ nội dung
  drawTicketPDF(doc, pdfData, qrCodeBuffer, lang);

  // Kết thúc vẽ
  doc.end();

  // 5. Trả về Promise chứa Buffer hoàn chỉnh
  return new Promise((resolve) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve({
        filename: `E-Ticket_${allTicketIds}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    });
  });
};

module.exports = { generateTicketPDF };