import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Search.css";


const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT",
  "NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export default function Search() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [query, setQuery] = useState(params.get("query") || "");
  const [state, setState] = useState(params.get("state") || "HI");

  const canSubmit = useMemo(() => query.trim().length >= 0 && state.trim().length === 2, [query, state]);

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    navigate(`/results?query=${encodeURIComponent(query)}&state=${encodeURIComponent(state)}`);
  }

  return (
    <section className="page container">
      <h2 className="pageTitle">Search</h2>
      <p className="pageHint">Pick a state, enter make/model/keyword, then route to results.</p>

      <form className="searchForm" onSubmit={onSubmit}>
        <label className="field">
          <span className="fieldLabel">Search keyword</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="textInput"
            placeholder="Search by Model, Make or Keyword"
          />
        </label>

        <label className="field">
          <span className="fieldLabel">State</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className="selectInput">
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button className="primaryBtn" type="submit">
          Search
        </button>
      </form>

      <div className="noteBox">
        <strong>API hook point:</strong> results page calls <code>searchVehicles()</code> in{" "}
        <code>src/api/vehicleApi.js</code>.
      </div>
    </section>
  );
}
