const db = require("../models");
const { sequelize } = require("../models");
const Flight = db.FlightInformation;
const Seat = db.Seat;
const Ticket = db.Ticket;
const Payment = db.Payment;
const { Op } = require("sequelize");
const { getCurrentWeekRange } = require("../../../utils/weekData");
const { startOfWeek, endOfWeek } = getCurrentWeekRange();
const averageTicketPriceInWeek = async () => {
  try {
  } catch (error) {}
};
