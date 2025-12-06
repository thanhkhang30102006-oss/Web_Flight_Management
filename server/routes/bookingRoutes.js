const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const authMiddleware = require("../middleware");
router.post("/search", authMiddleware, BookingController.SearchFlights);

module.exports = router;
