const express = require("express");
const router = express.Router();
const FlightManagementController = require("../controllers/FlightManagementController");
router.get("/showflight", FlightManagementController.showAllFlight);
router.get(
  "/hasflight/:flightNumber",
  FlightManagementController.showOnlyOneFlight
);

router.post("/create-flight", FlightManagementController.addingFlight);
router.put("/update/:flightNumber", FlightManagementController.updateFlight);
router.put("/cancel/:flightNumber", FlightManagementController.cancelledFlight);
router.post(
  "/flight-seats/:flightNumber/:seatID",
  FlightManagementController.showSeatDetails
);
module.exports = router;
