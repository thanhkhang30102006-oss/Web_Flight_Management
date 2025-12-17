const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware");
const MyTripController = require("../controllers/MyTripController");

router.get("/getflight/:passengerID", MyTripController.getAllInformationFlight);
router.post("/ticket/change-seat", MyTripController.changeSeat);
router.delete("/ticket/cancel-ticket/:ticketID", MyTripController.cancelTicket);
module.exports = router;
