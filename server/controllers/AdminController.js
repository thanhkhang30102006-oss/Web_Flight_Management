const fs = require("fs");
const axios = require("axios");
const path = require("path");
const translate = require("google-translate-api-x");
const DATA_PATH = path.resolve(
  __dirname,
  "../service/editFormEmail/emailTemplates.json"
);
const {
  getAllTemplates,
  updateTemplate,
} = require("../service/editFormEmail/templateManager");
const { sendNewStaffAccountEmail } = require("./EmailServiceController");
const { sendDeleteStaffAccountEmail } = require("./EmailServiceController");
const db = require("../models");
const { DATEONLY } = require("sequelize");
const Flight = db.FlightInformation;
const Passenger = db.Passenger;
const Payment = db.Payment;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Staff = db.Staff;
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const AdminController = {
  // API: Lấy danh sách
  getAllEmailTemplates: async (req, res) => {
    try {
      console.log("Đang lấy danh sách template..."); // Log để debug
      const templates = getAllTemplates();
      return res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Lỗi Controller lấy template:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách template",
      });
    }
  },

  // API: Cập nhật
  updateEmailTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = req.body.subject || "";
      const content = req.body.content || "";
      console.log(`Đang cập nhật template: ${id}`); // Log để debug
      if (!content.trim()) {
        console.warn("Cảnh báo: Nội dung email đang được lưu rỗng.");
      }
      const updatedTemplate = updateTemplate(id, subject, content);

      if (!updatedTemplate) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mẫu email hoặc lỗi khi lưu file.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật mẫu email thành công!",
        data: updatedTemplate,
      });
    } catch (error) {
      console.error("Lỗi Controller cập nhật template:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật template",
      });
    }
  },
  // API: Dịch văn bản sử dụng LibreTranslate
  translateText: async (req, res) => {
    try {
      const { q, source, target } = req.body;

      // Log xem Backend có nhận được dữ liệu không
      console.log(`[Translate Request] Từ ${source} sang ${target}`);
      console.log(
        `[Text Input]:`,
        q ? q.substring(0, 50) + "..." : "UNDEFINED"
      );

      if (!q) {
        console.warn("[Translate Warning] Text input rỗng");
        return res.status(200).json({ translatedText: "" });
      }

      // Gọi Google Translate
      const resGoogle = await translate(q, {
        from: source,
        to: target,
        forceBatch: false,
        autoCorrect: true,
      });

      // Log kết quả trả về từ Google
      console.log(
        `[Google Response]:`,
        resGoogle.text ? "Có kết quả" : "Không có text"
      );

      // Đảm bảo luôn trả về string (tránh undefined)
      const finalResult = resGoogle.text || q;

      return res.status(200).json({ translatedText: finalResult });
    } catch (error) {
      console.error("[Translate Error]:", error.message);
      // Fallback: Trả về văn bản gốc nếu lỗi
      return res.status(200).json({ translatedText: req.body.q || "" });
    }
  },
};

// USER - STAFF MANAGEMENT

const listPassenger = async (req, res) => {
  try {
    const passengers = await Passenger.findAll({
      attributes: [
        "passengerName",
        "passengerID",
        "passengerEmail",
        "passengerMobile",
        "passengerPassport",
        "passengerNationality",
        "passengerState",
      ],
    });

    if (!passengers) {
      return res
        .status(401)
        .json({ success: false, message: "Không thấy passneger nào cả" });
    }
    return res.status(200).json({
      success: true,
      data: passengers,
    });
  } catch (error) {
    console.error("Lỗi tính giá:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server" + error.message,
    });
  }
};

// Xử lý lock/unclock
const handleLockStatePassenger = async (req, res) => {
  const { passengerID } = req.body;
  await Passenger.update(
    { passengerState: "blocked" },
    {
      where: {
        passengerID: passengerID,
      },
    }
  );
  return res.status(200).json({
    success: true,
    message: "Block thành công",
  });
};
const handleUnLockStatePassenger = async (req, res) => {
  const { passengerID } = req.body;
  await Passenger.update(
    { passengerState: "active" },
    {
      where: {
        passengerID: passengerID,
      },
    }
  );
  return res.status(200).json({
    success: true,
    message: "Kích hoạt lại thành công",
  });
};

// LẤY DANH SÁCH STAFF
const staffList = async (req, res) => {
  try {
    const staffs = await Staff.findAll({
      attributes: ["staffID", "staffName", "staffAccountName", "staffPosition"],
    });

    if (!staffs) {
      return res
        .status(401)
        .json({ success: false, message: "Không thấy staff nào cả" });
    }
    return res.status(200).json({
      success: true,
      data: staffs,
    });
  } catch (error) {
    console.error("Lỗi tính giá:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server" + error.message,
    });
  }
};

const addStaff = async (req, res) => {
  const { formData } = req.body;
  if (!formData.emailPrivate) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email nhân viên" });
  }
  try {
    const existingStaff = await Staff.findOne({
      where: { staffID: formData.staffID },
    });
    if (existingStaff) {
      return res
        .status(400)
        .json({ success: false, message: "Mã nhân viên đã tồn tại" });
    }
    const defaultPassword = "staffpassword123@A";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    const staff = await Staff.create({
      staffID: formData.staffID,
      staffName: formData.staffName,
      staffAccountName: formData.staffAccountName,
      emailPrivate: formData.emailPrivate,
      staffPosition: formData.staffPosition,
      staffPassword: hashedPassword,
    });
    sendNewStaffAccountEmail(
      formData.emailPrivate,
      formData.staffName,
      formData.staffAccountName,
      defaultPassword,
      formData.staffPosition
    );
    return res.status(200).json({ message: "Thêm tài khoản thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" + error.message });
  }
};
const deleteStaff = async (req, res) => {
  const { staffID } = req.body;
  try {
    const staffToDelete = await Staff.findOne({
      where: { staffID: staffID },
    });

    if (!staffToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhân viên" });
    }

    if (staffToDelete.emailPrivate) {
      sendDeleteStaffAccountEmail(
        staffToDelete.emailPrivate,
        staffToDelete.staffName,
        staffToDelete.staffID
      );
    }
    const result = await Staff.destroy({
      where: { staffID: staffID },
    });

    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Xóa nhân viên thành công" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Không tìm thấy nhân viên" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server: " + error.message });
  }
};
module.exports = {
  ...AdminController,
  listPassenger,
  handleLockStatePassenger,
  handleUnLockStatePassenger,
  staffList,
  addStaff,
  deleteStaff,
};
