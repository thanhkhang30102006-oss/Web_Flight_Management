const express = require("express");
const router = express.Router();
const passengerController = require("../controllers/PassengerController");
const authMiddleware = require("../middleware");
// API Lấy thông tin
router.get(
  "/profile/:passengerID",
  authMiddleware,
  passengerController.getPassengerProfile
);

router.put(
  "/update-profile/:passengerID",
  authMiddleware,
  passengerController.updatePassengerProfile
);

// API Đổi mật khẩu
router.put(
  "/change-password/:passengerID",
  authMiddleware,
  passengerController.changePassengerPassword
);

module.exports = router;
