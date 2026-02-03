import React from "react";
import "./Skeletons.css";

export default function SkeletonText({ lines = 6 }) {
  return (
    <div className="skTextWrap" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skLine shimmer ${i === lines - 1 ? "short" : ""}`}
        />
      ))}
    </div>
  );
}
