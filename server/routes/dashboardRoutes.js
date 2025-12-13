const express = require("express");
const router = express.Router();

const FlightInformationController = require("../controllers/FlightInformationController");

router.get(
  "/latestticket/passenger/:passengerID",
  FlightInformationController.getInfoToTicket
);

module.exports = router;
