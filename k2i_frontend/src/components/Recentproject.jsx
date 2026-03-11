import React from "react";
import "../assets/Css/Recentproject.css";
import { Link } from "react-router-dom";

const Recentproject = () => {
  return (
    <section className="rp-main-section">
      <div>
        <div className="rp-main-project">
          <div>
            <img src="" alt="recent project" />
          </div>
          <div>
            <h3>recent project</h3>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Perferendis ea, enim deserunt eum aliquid placeat atque nulla
              earum consectetur. Accusantium?
            </p>
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
            <Link>
              <button>Get Started</button>
            </Link>
          </div>
        </div>
        <div></div>
      </div>
    </section>
  );
};

export default Recentproject;
