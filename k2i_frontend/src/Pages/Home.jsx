import React from "react";
import Herosection from "../components/Herosection.jsx";
import Stats from "../components/Stats.jsx";
import Whatweoffer from "../components/Whatweoffer.jsx";
import Whyk2i from "../components/Whyk2i.jsx";
import RecentProjects from "../components/RecentProjects.jsx";
import Ourteam from "../components/Ourteam.jsx";
import Testimonials from "../components/Testimonials.jsx";
import Newsletter from "../components/Newsletter.jsx";

const Home = () => {
  return (
    <>
      <Herosection />
      <Stats />
      <Whatweoffer />
      <Whyk2i />
      <RecentProjects />
      <Ourteam />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Home;
