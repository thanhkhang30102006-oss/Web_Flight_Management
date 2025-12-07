const express = require("express");
const router = express.Router();

const StaffController = require("../controllers/StaffController");

router.post("/loginStaff", StaffController.LoginStaff);
router.post("/loginAdmin", StaffController.LoginAdmin);

module.exports = router;
