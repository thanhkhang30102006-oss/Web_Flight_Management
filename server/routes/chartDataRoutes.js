const express = require("express");
const router = express.Router();

const OverviewChartController = require("../controllers/OverviewChartController");
const EmailServiceController = require("../controllers/EmailServiceController");
router.get("/dashboard", OverviewChartController.infoDashboard);
router.get("/statiscial", OverviewChartController.statiscialChartFlight);
router.post(
  "/send-system-report",
  EmailServiceController.sendSystemReportEmail
);

router.get("/revenue", OverviewChartController.revenueData);
module.exports = router;
