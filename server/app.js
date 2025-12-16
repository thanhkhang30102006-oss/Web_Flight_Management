var express = require("express");
const http = require("http");
const { Server } = require("socket.io");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const { Op } = require("sequelize");
const CryptoJS = require("crypto-js");
const db = require("./models");

var app = express();
require("dotenv").config();
app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

//config server socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let seatSelections = {};

// Logic lấy Staff ngẫu nhiên để nhắn tin
async function getAvailableStaff(passengerID) {
  try {
    // 1. Kiểm tra xem khách này từng chat với ai chưa?
    const lastMessage = await db.Message.findOne({
      where: {
        passengerID: passengerID,
        staffID: { [Op.ne]: null },
      },
      order: [["createdAt", "DESC"]],
    });

    if (lastMessage && lastMessage.staffID) {
      return lastMessage.staffID;
    }
    return null;
  } catch (error) {
    console.error("Lỗi getAvailableStaff:", error);
    return null;
  }
}
const secretkey = process.env.CHAT_SECRET_KEY; // Khai báo secret key
// Mã hóa tin nhắn
const encryptMessage = (text) => {
  if (!text) return "";
  return CryptoJS.AES.encrypt(text, secretkey).toString();
};

// Giải mã tin nhắn bị mã hóa
const decryptMessage = (cipherText) => {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretkey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || cipherText;
  } catch (e) {
    return cipherText;
  }
};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. Khi người dùng vào trang chi tiết chuyến bay/chọn vé
  socket.on("joinIntoBooking", (flightId) => {
    socket.join(flightId);
    console.log(`User ${socket.id} joined flight room: ${flightId}`);

    const currentSelections = seatSelections[flightId] || {};
    socket.emit("updateSeatMap", currentSelections);

    const lockedSeatsInFlight = [];
    for (const key in global.lockedSeats) {
      if (key.startsWith(flightId)) {
        lockedSeatsInFlight.push(key.split("_")[1]);
      }
    }
    socket.emit("seatsLocked", { seats: lockedSeatsInFlight });
  });

  socket.on("selectSeat", ({ flightId, seatId }) => {
    if (!seatSelections[flightId]) {
      seatSelections[flightId] = {};
    }

    const currentHolder = seatSelections[flightId][seatId];

    if (!currentHolder) {
      seatSelections[flightId][seatId] = socket.id;
    } else if (currentHolder === socket.id) {
      delete seatSelections[flightId][seatId];
    }

    io.to(flightId).emit("updateSeatMap", seatSelections[flightId]);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // 1. DUYỆT QUA CÁC CHUYẾN BAY ĐỂ TÌM GHẾ CỦA USER NÀY
    // Giả sử bạn đang dùng biến seatSelections để lưu map ghế
    for (const flightId in seatSelections) {
      const seats = seatSelections[flightId];
      let hasChange = false;
      const seatsToRemove = [];

      // Tìm ghế nào do socket.id này giữ
      for (const seatId in seats) {
        if (seats[seatId] === socket.id) {
          delete seats[seatId]; // Xóa khỏi danh sách chọn
          seatsToRemove.push(seatId);
          hasChange = true;
        }
      }

      // 2. NẾU CÓ THAY ĐỔI -> BÁO CHO NGƯỜI KHÁC BIẾT
      if (hasChange) {
        console.log(
          `Auto release seats for flight ${flightId}:`,
          seatsToRemove
        );

        // Gửi map mới nhất cho tất cả mọi người trong phòng chuyến bay đó
        io.to(flightId).emit("updateSeatMap", seatSelections[flightId]);
      }
    }

    if (global.lockedSeats) {
      Object.keys(global.lockedSeats).forEach((key) => {
        if (global.lockedSeats[key] === socket.id) {
          delete global.lockedSeats[key];
        }
      });
    }
  });
  socket.on("unlockSeats", ({ flightId, seats }) => {
    console.log(
      `Yêu cầu mở khóa ghế từ ${socket.id} cho chuyến ${flightId}:`,
      seats
    );

    if (!global.lockedSeats) global.lockedSeats = {};

    seats.forEach((seatId) => {
      const key = `${flightId}_${seatId}`;
      if (global.lockedSeats[key]) {
        delete global.lockedSeats[key];

        io.to(flightId).emit("seatUnlocked", { seatId });
      }
    });
  });
  // ----------------- Tin Nhắn -----------------

  // Khi khách hnagf thực hiện bấm option đưa khách hàng vào luồng -> socket
  // Đối với nhân viên đều thấy tin nhắn của khách hàng và kết nối socket khi bấm vào đoạn hội thoại
  socket.on("join_room", (data) => {
    if (data.passengerID) {
      socket.join(data.passengerID);
    }
  });

  socket.on("send_message", async (data) => {
    console.log("Server nhận tin nhắn:", data); // Log để debug
    try {
      let targetStaffID = data.staffID;

      if (data.senderType === "passenger") {
        if (!targetStaffID) {
          targetStaffID = await getAvailableStaff(data.passengerID);
        }
        if (!targetStaffID) {
          console.log("⚠️ Không tìm thấy Staff cũ, gán mặc định: 25STF062");
          targetStaffID = "25STF062";
        }
      }
      // Lưu vào Database
      const encryptedContent = encryptMessage(data.content);
      const savedMessage = await db.Message.create({
        passengerID: data.passengerID,
        staffID: targetStaffID,
        contentMessage: encryptedContent,
        senderType: data.senderType, // 'passenger' hoặc 'staff'
        messageType: data.type || "text",
        isBeenChecked: "no",
        messageTime: new Date(),
      });

      const messageToEmit = {
        ...savedMessage.dataValues,
        contentMessage: data.content,
      };
      console.log("Đã lưu DB ID:", savedMessage.messageID);
      // Gửi realtime cho những người trong phòng (Passenger & Staff đang xem)
      io.in(data.passengerID).emit("receive_message", messageToEmit);
    } catch (err) {
      console.error("Lỗi lưu tin nhắn Socket:", err);
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server Socket & Express is running on port ${PORT}`);
});
app.set("socketio", io);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Fast checking the flights
const flightRouter = require("./routes/flightRoutes");
app.use("/api/flights/", flightRouter);

// Register call, Login call
const registerRouter = require("./routes/registerRoutes");
app.use("/api/user/", registerRouter);

// Booking
const bookingRouter = require("./routes/bookingRoutes");
app.use("/api/user/booking", bookingRouter);
app.use("/api/user/", bookingRouter);

// Xử lý đăng nhập staff và admin
const loginStaffRouter = require("./routes/loginStaffAdminRoutes");
app.use("/api/staff", loginStaffRouter);
app.use("/api/admin", loginStaffRouter);

// Xử lý hiện thông tin dashboard
const dashBoardRouter = require("./routes/dashboardRoutes");
app.use("/api/user/dashboard", dashBoardRouter);

// Xử lý liên quan tới quản lý chuyến bay
const flightmanagement = require("./routes/flightManagementRoutes");
app.use("/api/staff/flightmanagement", flightmanagement);
// Pending seats
if (!global.lockedSeats) {
  global.lockedSeats = {};
}

const messageRouter = require("./routes/messageRoutes");
app.use("/api/messages", messageRouter);

const passengerRouter = require("./routes/passenger");
app.use("/api/user/setting", passengerRouter);
module.exports = app;
