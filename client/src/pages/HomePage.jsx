import React from "react";

import Header from "../components/HomePage/header/header.jsx";
import {
  SimpleInfo,
  FastChecking,
  TopRating,
  AboutUs,
} from "../components/HomePage/main/homepage.jsx";
import { AirCraft } from "../components/HomePage/main/aircraft.jsx";

function HomePage() {
  return (
    <>
      <Header />
      <SimpleInfo />
      <FastChecking />
      <TopRating />
      <AboutUs />
    </>
  );
}
export default HomePage;
