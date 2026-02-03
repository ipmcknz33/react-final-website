import React from "react";
import "../pages/VehicleCard.css";

export default function VehicleCard({ vehicle, onClick }) {
  return (
    <button className="vehicleCard" onClick={onClick} type="button">
      <div className="vehicleCardMedia">
      <img
  src={vehicle.imageUrl}
  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
  loading="lazy"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60";
  }}
/>

        <div className="vehicleTag">{vehicle.type}</div>
      </div>

      <div className="vehicleCardBody">
        <h3 className="vehicleTitle">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <div className="vehicleMeta">
          <span>${vehicle.pricePerMonth}/mo</span>
          <span>•</span>
          <span>{vehicle.drivetrain}</span>
          <span>•</span>
          <span>{vehicle.mpg} mpg</span>
        </div>
      </div>
    </button>
  );
}
