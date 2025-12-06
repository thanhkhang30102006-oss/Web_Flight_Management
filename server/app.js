var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var app = express();
require("dotenv").config();
app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Fast checking the flights
const flightRouter = require("./routes/flightRoutes");
app.use("/api/flights/", flightRouter);

// Register call, Login call
const registerRouter = require("./routes/registerRoutes");
app.use("/api/user/", registerRouter);

// Booking
const bookingRouter = require("./routes/bookingRoutes");
app.use("/api/user/booking", bookingRouter);

module.exports = app;
