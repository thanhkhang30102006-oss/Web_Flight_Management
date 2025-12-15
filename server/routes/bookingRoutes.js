const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const EmailServiceController = require("../controllers/EmailServiceController");
const authMiddleware = require("../middleware");
router.post("/search", authMiddleware, BookingController.SearchFlights);
router.post("/price", BookingController.priceStandard);
router.post("/payment/create", authMiddleware, BookingController.createPayment);

router.post("/payment/finalize-booking", BookingController.finalizeBooking);

router.get("/seats/:flightNumber", BookingController.getOccupiedSeats);

router.post("/send-email", authMiddleware, EmailServiceController.formatEmail);
module.exports = router;
