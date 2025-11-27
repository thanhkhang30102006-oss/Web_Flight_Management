const express = require("express");
const router = express.Router();
const FlightController = require("../controllers/FlightController");

router.post("/search", FlightController.searchFlights);

module.exports = router;
