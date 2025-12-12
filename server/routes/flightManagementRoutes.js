const express = require("express");
const router = express.Router();
const FlightManagementController= require("../controllers/FlightManagementController");
router.get("/showflight", FlightManagementController.showAllFlight);

module.exports= router;