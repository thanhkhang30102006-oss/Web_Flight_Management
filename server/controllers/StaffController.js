require("dotenv").config();
const db = require("../models");
const Staff = db.Staff;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Login với logic staff

const LoginStaff = async (req, res) => {
  try {
    const { staffID, staffPassword } = req.body;

    const staff = await Staff.findOne({
      where: {
        staffID: staffID,
      },
    });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Thông tin không đúng!",
      });
    }

    const isMatch = await bcrypt.compare(staffPassword, staff.staffPassword);

    if (isMatch) {
      const userData = {
        id: staff.staffID,
        name: staff.staffName,
        position: "staff",
      };
      const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      // Tạo access token và refresh token
      const accessToken = jwt.sign(
        userData,
        process.env.ACCESS_TOKEN_SECRET || "access_token_default",
        { expiresIn: "2d" }
      );
      const refreshToken = jwt.sign(
        userData,
        process.env.REFRESH_TOKEN_SECRET || "refresh_token_default",
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", refreshToken, cookieOptions);
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        user: userData,
        accessToken: accessToken,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không đúng!",
      });
    }
  } catch (error) {
    console.log("Lỗi Login:", error);
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};

// Admin login
const LoginAdmin = async (req, res) => {
  try {
    const { staffID, staffPassword } = req.body;

    const staff = await Staff.findOne({
      where: {
        staffID: staffID,
      },
    });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Thông tin không đúng!",
      });
    }

    const isMatch = await bcrypt.compare(staffPassword, staff.staffPassword);

    if (isMatch) {
      const userData = {
        id: staff.staffID,
        name: staff.staffName,
        email: staff.emailPrivate,
        position: "admin",
      };
      const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      // Tạo access token và refresh token
      const accessToken = jwt.sign(
        userData,
        process.env.ACCESS_TOKEN_SECRET || "access_token_default",
        { expiresIn: "2d" }
      );
      const refreshToken = jwt.sign(
        userData,
        process.env.REFRESH_TOKEN_SECRET || "refresh_token_default",
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", refreshToken, cookieOptions);
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        user: userData,
        accessToken: accessToken,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không đúng!",
      });
    }
  } catch (error) {
    console.log("Lỗi Login:", error);
    return res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
};
module.exports = { LoginStaff, LoginAdmin };
