const express = require("express");
const router = express.Router();

const OverviewChartController = require("../controllers/OverviewChartController");
router.get("/dashboard", OverviewChartController.infoDashboard);
module.exports = router;
