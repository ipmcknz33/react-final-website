import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../pages/Navbar.css";


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="navHeader">
      <div className="navContainer">
        <div className="brandRow">
          <NavLink to="/" className="brand">
            <span className="brandDot" aria-hidden="true" />
            <span className="brandText">blinker</span>
          </NavLink>

          <button
            className="menuBtn"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`bar ${open ? "bar1" : ""}`} />
            <span className={`bar ${open ? "bar2" : ""}`} />
            <span className={`bar ${open ? "bar3" : ""}`} />
          </button>
        </div>

        <nav className={`navLinks ${open ? "open" : ""}`}>
          <NavLink to="/" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Search
          </NavLink>
          <NavLink to="/results" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
            Results
          </NavLink>

          <a className="pillBtn" href="#contact">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
