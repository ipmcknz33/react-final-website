import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";
import SkeletonCard from "../components/SkeletonCard";
import "./Results.css";


export default function Results() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const query = params.get("query") || "";
  const state = params.get("state") || "HI";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);

  const title = useMemo(() => {
    const q = query.trim();
    return q ? `Results for "${q}" in ${state}` : `Results in ${state}`;
  }, [query, state]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const data = await searchVehicles({ query, state });
        if (!mounted) return;
        setVehicles(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [query, state]);

  return (
    <section className="page container">
      <div className="rowBetween">
        <div>
          <h2 className="pageTitle">{title}</h2>
          <p className="pageHint">Click a card to route to <code>/vehicle/:id</code>.</p>
        </div>

        <button className="ghostBtn" onClick={() => navigate("/search")}>
          New Search
        </button>
      </div>

      {error && <div className="errorBox">{error}</div>}

      <div className="cardGrid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onClick={() => navigate(`/vehicle/${v.id}`)} />
            ))}
      </div>
    </section>
  );
}
