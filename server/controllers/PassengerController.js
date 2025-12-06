require("dotenv").config();
const db = require("../models");
const Passenger = db.Passenger;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const registerInformation = async (req, res) => {
  try {
    const {
      passengerName,
      passengerGender,
      passengerNationality,
      passengerPassport,
      passengerEmail,
      passengerMobile,
      passengerAccountName,
      passengerPassword,
    } = req.body;

    const hashPassword = await encryptPassword(passengerPassword);
    const id = hashFunction(passengerName, passengerEmail, passengerMobile);
    const passenger = await Passenger.create({
      passengerID: id,
      passengerName: passengerName,
      passengerGender: passengerGender,
      passengerNationality: passengerNationality,
      passengerPassport: passengerPassport,
      passengerEmail: passengerEmail,
      passengerMobile: passengerMobile,
      passengerAccountName: passengerAccountName,
      passengerPassword: hashPassword,
    });

    res.status(200).json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function encryptPassword(password) {
  const difficult = 10;
  const hashPassword = await bcrypt.hash(password, difficult);

  return hashPassword;
}

function hashFunction(name, email, mobile) {
  let shortenName = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  let raw = name + email + mobile;
  const hash = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .toUpperCase();
  const digits = hash.slice(0, 4);
  const year = new Date().getFullYear().toString().slice(2);

  const passengerID = `${year}${shortenName}${digits}`;
  return passengerID;
}

// Login

const loginUser = async (req, res) => {
  try {
    const {
      passengerName,
      passengerEmail,
      passengerMobile,
      passengerPassword,
    } = req.body;

    const passenger = await Passenger.findOne({
      where: {
        passengerName: passengerName,
        passengerEmail: passengerEmail,
        passengerMobile: passengerMobile,
      },
    });
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Thông tin không đúng!",
      });
    }
    const isMatch = await bcrypt.compare(
      passengerPassword,
      passenger.passengerPassword
    );

    if (isMatch) {
      const userData = {
        id: passenger.passengerID,
        name: passenger.passengerName,
        email: passenger.passengerEmail,
        mobile: passenger.passengerMobile,
        role: "passenger",
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
      console.log("Access Token: ", accessToken);
      console.log("RefreshToken : ", refreshToken);
      console.log("Cookie: ", cookieOptions);
      res.cookie("refreshToken", refreshToken, cookieOptions);
      console.log("Secret trong Login:", process.env.ACCESS_TOKEN_SECRET);
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
module.exports = { registerInformation, loginUser };
