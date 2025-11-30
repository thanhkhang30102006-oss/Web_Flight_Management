const express = require("express");
const router = express.Router();

const PassengerController = require("../controllers/PassengerController");

router.post("/register", PassengerController.registerInformation);
router.post("/login", PassengerController.loginUser);
module.exports = router;
