const express = require("express");
const router = express.Router();

const StaffController = require("../controllers/StaffController");

router.post("/loginStaff", StaffController.LoginStaff);
router.post("/loginAdmin", StaffController.LoginAdmin);
router.post("/logout", StaffController.logout);
module.exports = router;
