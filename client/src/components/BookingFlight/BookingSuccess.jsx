import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom"; // Hook Fiều hướng
import SeatMap from "./SeatMap";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { io } from "socket.io-client";

import PaymentPage from "./PaymentPage";

const BookSuccess = () => {};

export default BookSuccess;
