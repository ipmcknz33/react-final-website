import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page container">
      <h2 className="pageTitle">404</h2>
      <p className="pageHint">That route doesn’t exist.</p>
      <Link className="primaryBtn" to="/">
        Go Home
      </Link>
    </section>
  );
}
