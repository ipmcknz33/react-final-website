import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";


export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="page container">
      <div className="heroGrid">
        <div className="heroCopy">
          <h1 className="heroTitle">
            America’s most awarded
            <br />
            car subscription platform
          </h1>

          <p className="heroSubtitle">
            FIND YOUR DREAM RIDE WITH <span className="accent">BLINKER</span>
          </p>

          <div className="heroActions">
            <button className="primaryBtn" onClick={() => navigate("/search")}>
              Start Search
            </button>
            <button className="ghostBtn" onClick={() => navigate("/results?query=&state=HI")}>
              View Results Demo
            </button>
          </div>

          <div className="heroBadgeRow">
            <div className="badge">Instant routing</div>
            <div className="badge">Skeleton loading</div>
            <div className="badge">Responsive UI</div>
          </div>
        </div>

        <div className="heroArt" aria-hidden="true">
          {/* “Badass” landing animation: car + truck sliding in */}
          <div className="road" />
          <div className="vehicleAnimWrap">
            <div className="truck">
              <div className="cab" />
              <div className="bed" />
              <div className="wheel w1" />
              <div className="wheel w2" />
            </div>

            <div className="car">
              <div className="roof" />
              <div className="body" />
              <div className="wheel w3" />
              <div className="wheel w4" />
            </div>

            <div className="spark s1" />
            <div className="spark s2" />
            <div className="spark s3" />
          </div>
        </div>
      </div>

      <footer className="footer" id="contact">
        <small>Final project scaffold • Hook your API into src/api/vehicleApi.js</small>
      </footer>
    </section>
  );
}
