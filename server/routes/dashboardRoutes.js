const express = require("express");
const router = express.Router();

const FlightInformationController = require("../controllers/FlightInformationController");

router.get(
  "/latestticket/passenger/:passengerID",
  FlightInformationController.getInfoToTicket
);
router.get(
  "/flightschedule/:passengerID",
  FlightInformationController.flightSchedule
);
module.exports = router;
