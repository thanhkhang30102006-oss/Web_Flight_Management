import React, { useState } from "react";
import {
  Header,
  NotificationDropDown,
} from "../components/DashboardUser/header";
import LeftSide from "../components/DashboardUser/FunctionBar";
import {
  NextFlightCard,
  StatsComponents,
} from "../components/DashboardUser/NextFlight";
import FlightSchedule from "../components/DashboardUser/FlightSchedule";

function DashBoard() {
  return (
    <>
      <LeftSide />
      <Header />
      <NextFlightCard />
      <FlightSchedule />
    </>
  );
}
export default DashBoard;
