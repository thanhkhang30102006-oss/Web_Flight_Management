// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const OverviewChartController = require("../controllers/OverviewChartController");
console.log("Loaded AdminController:", AdminController);

// Gọi đúng tên hàm: getAllEmailTemplates
router.get("/email-templates", AdminController.getAllEmailTemplates);

// Gọi đúng tên hàm: updateEmailTemplate
router.put("/email-templates/:id", AdminController.updateEmailTemplate);

router.post("/translate", AdminController.translateText);

router.get("/chart", OverviewChartController.adminChart);
module.exports = router;
