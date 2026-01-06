const express = require("express");
const router = express.Router();
const CheckInController = require("../controllers/CheckInController");

router.post("/search", CheckInController.ticketInfo);
router.post("/confirm", CheckInController.confirmCheckIn);
module.exports = router;
