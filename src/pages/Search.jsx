// src/pages/Search.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Search.css";

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export default function Search() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialQuery = params.get("query") || "";
  const initialState = params.get("state") || "HI";
  const initialYear = Number(params.get("year") || 2018);

  const safeInitialYear = useMemo(() => {
    if (YEARS.includes(initialYear)) return initialYear;
    return 2018;
  }, [initialYear]);

  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState(initialState);
  const [year, setYear] = useState(safeInitialYear);

  function onSubmit(e) {
    e.preventDefault();

    const q = query.trim();
    if (!q) return;

    // always clamp to the allowed years
    const y = YEARS.includes(Number(year)) ? Number(year) : 2018;

    navigate(
      `/results?query=${encodeURIComponent(q)}&state=${encodeURIComponent(
        state
      )}&year=${encodeURIComponent(y)}`
    );
  }

  return (
    <section className="page container search">
      <div className="search__container">
        <h1 className="search__title">Search Vehicles</h1>

        <form className="search__form" onSubmit={onSubmit}>
          <div className="search__field">
            <label>Make (ex: toyota, honda, bmw)</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="toyota"
            />
          </div>

          <div className="search__row">
            <div className="search__field">
              <label>State</label>
              <select value={state} onChange={(e) => setState(e.target.value)}>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="search__field">
              <label>Year (2015–2020)</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="search__btn" type="submit">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
