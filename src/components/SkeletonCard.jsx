import React from "react";
import "../pages/skeletons.css";


export default function SkeletonCard() {
  return (
    <div className="skeletonCard" aria-hidden="true">
      <div className="skMedia shimmer" />
      <div className="skBody">
        <div className="skLine shimmer" />
        <div className="skLine short shimmer" />
      </div>
    </div>
  );
}
