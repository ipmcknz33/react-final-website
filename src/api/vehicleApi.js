// src/api/vehicleApi.js
// car-api2 (RapidAPI) — axios + URL placeholder images (NO local assets)

import axios from "axios";

/* -------------------- Placeholder Images (URLs) -------------------- */
const PLACEHOLDER_CAR =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=60"; // Porsche vibe
const PLACEHOLDER_SUV =
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=60";
const PLACEHOLDER_TRUCK =
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=60";

// Results page rotates through these so cards don’t all look identical
const RESULT_PLACEHOLDERS = [
  PLACEHOLDER_CAR,
  PLACEHOLDER_SUV,
  PLACEHOLDER_TRUCK,
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1511391409280-dc2e4e1f50df?auto=format&fit=crop&w=1600&q=60",
];

function pickResultsPlaceholder(index = 0) {
  return RESULT_PLACEHOLDERS[index % RESULT_PLACEHOLDERS.length];
}

function pickPlaceholderByType(type = "") {
  const t = String(type).toLowerCase();
  if (t.includes("truck")) return PLACEHOLDER_TRUCK;
  if (t.includes("suv")) return PLACEHOLDER_SUV;
  return PLACEHOLDER_CAR;
}

/* -------------------- ENV -------------------- */
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SAFE_YEAR_ENV = Number(import.meta.env.VITE_SAFE_YEAR || 2018);

const DEFAULT_HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

function assertEnv() {
  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST || !API_BASE_URL) {
    throw new Error(
      "Missing env vars. Ensure .env is in project ROOT (same folder as package.json):\n" +
        "VITE_RAPIDAPI_KEY, VITE_RAPIDAPI_HOST, VITE_API_BASE_URL\n" +
        "Then restart Vite.",
    );
  }
}

/* -------------------- Cache + Throttle -------------------- */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const cache = new Map(); // url -> { t, data }
let lastCallAt = 0;
const MIN_TIME_BETWEEN_CALLS_MS = 700;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clampYear(y) {
  let year = Number(y);
  if (!Number.isFinite(year)) year = SAFE_YEAR_ENV;
  if (year < 2015) year = 2015;
  if (year > 2020) year = 2020;
  return year;
}

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

function pickArray(payload) {
  return payload?.data || payload?.results || payload || [];
}

function pickFirst(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

/* -------------------- Deterministic hash for stable detail images -------------------- */
function hashToInt(str) {
  let h = 0;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// stable placeholder selection (always same for same vehicle)
function pickStablePlaceholder({ seed, type }) {
  const base = pickPlaceholderByType(type);
  const idx = hashToInt(seed) % RESULT_PLACEHOLDERS.length;
  // mix in variety but keep type preference:
  return idx === 0 ? base : RESULT_PLACEHOLDERS[idx];
}

/* -------------------- Axios GET JSON -------------------- */
async function getJson(url) {
  assertEnv();

  const hit = cache.get(url);
  const now = Date.now();
  if (hit && now - hit.t < CACHE_TTL_MS) return hit.data;

  const wait = MIN_TIME_BETWEEN_CALLS_MS - (now - lastCallAt);
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();

  try {
    const res = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 15000,
    });

    cache.set(url, { t: Date.now(), data: res.data });
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Request failed";
    throw new Error(msg);
  }
}

/* -------------------- Helpers -------------------- */
function computeMpg(t) {
  const combined = Number(t?.combined_mpg);
  if (Number.isFinite(combined)) return combined;

  const city = Number(t?.city_mpg);
  const highway = Number(t?.highway_mpg);
  if (Number.isFinite(city) && Number.isFinite(highway)) {
    return Math.round((city + highway) / 2);
  }

  const mpg = Number(t?.mpg);
  if (Number.isFinite(mpg)) return mpg;

  return 25;
}

/* -------------------- Route IDs -------------------- */
// format: makeId:modelId:year:makeName:modelName
function buildModelRouteId({ makeId, modelId, year, makeName, modelName }) {
  return [
    makeId,
    modelId,
    year,
    encodeURIComponent(makeName || ""),
    encodeURIComponent(modelName || ""),
  ].join(":");
}

function parseRouteId(id) {
  const s = String(id || "");

  if (s.toLowerCase().startsWith("vin:")) {
    return { kind: "vin", vin: s.slice(4) };
  }

  const parts = s.split(":");
  return {
    kind: "model",
    makeId: Number(parts[0]),
    modelId: Number(parts[1]),
    year: clampYear(parts[2]),
    makeFromRoute: decodeURIComponent(parts[3] || ""),
    modelFromRoute: decodeURIComponent(parts[4] || ""),
  };
}

/* -------------------- VIN Decode (matches your RapidAPI snippet) -------------------- */
export async function decodeVin(vin) {
  const clean = String(vin || "")
    .trim()
    .toUpperCase();
  if (!clean) throw new Error("VIN is required.");

  const payload = await getJson(
    `${API_BASE_URL}/api/vin/${encodeURIComponent(clean)}`,
  );
  const d = payload?.data || payload || {};

  const year = clampYear(Number(d.year ?? d.model_year ?? d.modelYear));
  const make = d.make ?? d.make_name ?? d.makeName ?? "Unknown";
  const model = d.model ?? d.model_name ?? d.modelName ?? "Unknown";
  const trim = d.trim ?? d.trim_name ?? d.trimName ?? "";

  return { vin: clean, year, make, model, trim, raw: d };
}

/* -------------------- SEARCH (Results page) -------------------- */
export async function searchVehicles({ query = "", state = "", year } = {}) {
  const q = norm(query);
  const y = clampYear(year);
  if (!q) return [];

  // 1) makes
  const makesRes = await getJson(`${API_BASE_URL}/api/makes`);
  const makes = pickArray(makesRes);

  const exact = makes.find((m) => norm(m.make || m.make_name || m.name) === q);
  const fuzzy =
    exact ||
    makes.find((m) => norm(m.make || m.make_name || m.name).includes(q));

  if (!fuzzy) throw new Error(`No make found for "${query}"`);

  const makeName = fuzzy.make || fuzzy.make_name || fuzzy.name || query;
  const makeId = Number(fuzzy.make_id ?? fuzzy.id);
  if (!Number.isFinite(makeId) || makeId <= 0)
    throw new Error("make_id invalid");

  // 2) models
  const modelsRes = await getJson(
    `${API_BASE_URL}/api/models?make_id=${makeId}&year=${y}`,
  );
  const models = pickArray(modelsRes);

  return models
    .filter((m) => Number.isFinite(Number(m.model_id ?? m.id)))
    .slice(0, 6)
    .map((m, index) => {
      const modelId = Number(m.model_id ?? m.id);
      const modelName = m.model || m.model_name || m.name || "Model";

      const routeId = buildModelRouteId({
        makeId,
        modelId,
        year: y,
        makeName,
        modelName,
      });

      return {
        id: String(routeId),
        year: y,
        make: makeName,
        model: modelName,
        type: "Car",
        pricePerMonth: 699,
        mpg: 25,
        drivetrain: "N/A",
        state: state || "N/A",

        // ✅ always visible placeholders in results
        imageUrl: pickResultsPlaceholder(index),

        raw: m,
      };
    });
}

/* -------------------- DETAILS (Vehicle page) -------------------- */
export async function getVehicleById(id) {
  const parsed = parseRouteId(id);

  // VIN route
  if (parsed.kind === "vin") {
    const v = await decodeVin(parsed.vin);
    const seed = `${v.year}-${v.make}-${v.model}-${v.vin}`;
    const type = "Car";

    return {
      id: String(id),
      year: v.year,
      make: v.make,
      model: v.model,
      type: "Vehicle",
      trim: v.trim || "N/A",
      pricePerMonth: 699,
      mpg: 25,
      drivetrain: "N/A",
      fuel: "N/A",
      transmission: "N/A",
      cylinders: "N/A",
      imageUrl: pickStablePlaceholder({ seed, type }),
      raw: v.raw,
    };
  }

  // model route
  const { modelId, year, makeFromRoute, modelFromRoute } = parsed;

  if (!Number.isFinite(modelId) || modelId <= 0) {
    throw new Error("Vehicle id invalid (model_id missing).");
  }

  const trimsRes = await getJson(
    `${API_BASE_URL}/api/trims?model_id=${modelId}`,
  );
  const trims = pickArray(trimsRes);
  const t0 = pickFirst(trims) || {};

  const make =
    t0.make || t0.make_name || t0.makeName || makeFromRoute || "Selected";
  const model =
    t0.model || t0.model_name || t0.modelName || modelFromRoute || "Vehicle";
  const type = t0.body_type || t0.vehicle_type || t0.type || "Car";

  const drivetrain = t0.drive_type || t0.drive || t0.drivetrain || "N/A";
  const mpg = computeMpg(t0);

  const fuel = t0.fuel_type || t0.fuel || "N/A";
  const transmission = t0.transmission || t0.transmission_type || "N/A";
  const cylinders = t0.cylinders ?? t0.cylinder ?? "N/A";
  const trimName = t0.trim || t0.trim_name || t0.name || "N/A";

  const seed = `${year}-${make}-${model}-${trimName}`;

  return {
    id: String(id),
    year,
    make,
    model,
    type,
    trim: trimName,
    pricePerMonth: 699,
    mpg,
    drivetrain,
    fuel,
    transmission,
    cylinders,

    // ✅ stable detail image
    imageUrl: pickStablePlaceholder({ seed, type }),

    raw: { trimsCount: trims.length, sample: t0, allTrims: trims.slice(0, 10) },
  };
}
