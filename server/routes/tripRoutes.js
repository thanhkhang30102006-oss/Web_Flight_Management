const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware");
const MyTripController = require("../controllers/MyTripController");

router.get("/getflight/:passengerID", MyTripController.getAllInformationFlight);
module.exports = router;
