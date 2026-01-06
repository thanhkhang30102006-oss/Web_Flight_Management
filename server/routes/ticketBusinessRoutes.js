const express = require("express");
const router = express.Router();
const TicketBusinessController = require("../controllers/TicketBusinessController");

router.get("/list", TicketBusinessController.listTicket);
router.post("/info-personal", TicketBusinessController.particularlyTicketInfo);
router.post("/cancel", TicketBusinessController.cancelPersonalTicket);
router.post("/restore", TicketBusinessController.restoreTicket);
module.exports = router;
