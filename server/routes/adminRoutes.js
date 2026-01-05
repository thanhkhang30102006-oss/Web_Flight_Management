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

// UserManagement
router.get("/passengers", AdminController.listPassenger);
router.post("/updateStateLock", AdminController.handleLockStatePassenger);
router.post("/updateStateUnLock", AdminController.handleUnLockStatePassenger);

// StaffManagement
router.get("/staffs", AdminController.staffList);
router.post("/staff/add", AdminController.addStaff);
router.post("/staff/delete", AdminController.deleteStaff);
module.exports = router;
