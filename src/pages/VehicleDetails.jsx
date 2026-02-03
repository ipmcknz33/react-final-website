import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleById } from "../api/vehicleApi";
import SkeletonText from "../components/SkeletonText";
import "./VehicleDetails.css";

const PORSCHE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=60";

export default function VehicleDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const data = await getVehicleById(id);
        if (!mounted) return;
        setVehicle(data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load vehicle");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <section className="page container">
      <div className="rowBetween">
        <button className="ghostBtn" onClick={() => navigate(-1)} type="button">
          ← Back
        </button>
        <div className="mutedSmall">
          Route param: <code>{id}</code>
        </div>
      </div>

      {error && <div className="errorBox">{error}</div>}

      <div className="detailGrid">
        {/* LEFT SIDEBAR */}
        <aside className="detailSidebar">
          <h3 className="sidebarTitle">Vehicle Data</h3>

          {loading ? (
            <SkeletonText lines={10} />
          ) : vehicle ? (
            <div className="kv">
              <div className="kvRow"><span>ID</span><strong>{vehicle.id}</strong></div>
              <div className="kvRow"><span>Year</span><strong>{vehicle.year}</strong></div>
              <div className="kvRow"><span>Make</span><strong>{vehicle.make}</strong></div>
              <div className="kvRow"><span>Model</span><strong>{vehicle.model}</strong></div>
              <div className="kvRow"><span>Type</span><strong>{vehicle.type}</strong></div>
              <div className="kvRow"><span>Drivetrain</span><strong>{vehicle.drivetrain}</strong></div>
              <div className="kvRow"><span>MPG</span><strong>{vehicle.mpg}</strong></div>
              <div className="kvRow"><span>Price / Month</span><strong>${vehicle.pricePerMonth}</strong></div>
            </div>
          ) : null}
        </aside>

        {/* RIGHT CONTENT */}
        <div className="detailContent">
          {loading ? (
            <div className="detailHeroSkeleton shimmer" />
          ) : vehicle ? (
            <>
              <div
                className="detailHero"
                style={{
                  backgroundImage: `url("${
                    vehicle?.imageUrl || PORSCHE_PLACEHOLDER
                  }")`,
                }}
              >
                <div className="detailOverlay">
                  <div className="detailType">{vehicle.type}</div>
                  <h1 className="detailTitle">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="detailSub">
                    ${vehicle.pricePerMonth}/mo • {vehicle.drivetrain} • {vehicle.mpg} mpg
                  </p>
                </div>
              </div>

              <div className="detailPanels">
                <div className="panel">
                  <h4>Why it’s badass</h4>
                  <p>
                    Route-driven details, stable placeholders, and API-ready data.
                  </p>
                </div>

                <div className="panel">
                  <h4>Direct URL support</h4>
                  <p>
                    Refresh-safe route loading via <code>/vehicle/:id</code>.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
