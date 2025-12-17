const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware");
const PassengerController = require("../controllers/PassengerController");

router.post("/register", PassengerController.registerInformation);
router.post("/login", PassengerController.loginUser);

router.post("/logout", authMiddleware, PassengerController.logout);
module.exports = router;
