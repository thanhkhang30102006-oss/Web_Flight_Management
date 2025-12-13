const express = require("express");
const router = express.Router();
const passengerController = require("../controllers/PassengerController"); 

// API Lấy thông tin
router.get("/profile", authMiddleware.verifyToken, passengerController.getPassengerProfile);

// API Cập nhật thông tin (bao gồm cả Avatar dạng base64/url)
router.put("/update-profile", authMiddleware.verifyToken, passengerController.updatePassengerProfile);

// API Đổi mật khẩu
router.put("/change-password", authMiddleware.verifyToken, passengerController.changePassengerPassword);

module.exports = router;