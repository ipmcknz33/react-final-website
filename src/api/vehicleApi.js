// src/api/vehicleApi.js
// RapidAPI car-api2 (key only, no JWT)
// Adds VIN snippet endpoint + stable matching placeholder images.

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

// ----- simple cache + throttle (prevents 429 while testing) -----
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

async function getJson(url) {
  assertEnv();

  const hit = cache.get(url);
  const now = Date.now();
  if (hit && now - hit.t < CACHE_TTL_MS) return hit.data;

  const wait = MIN_TIME_BETWEEN_CALLS_MS - (now - lastCallAt);
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();

  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Non-JSON response from API.\nURL: ${url}\nStatus: ${res.status}\nContent-Type: ${contentType}\nBody starts: ${text.slice(0, 120)}`,
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Bad JSON from API: ${text.slice(0, 160)}`);
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  cache.set(url, { t: Date.now(), data });
  return data;
}

// ---- Matching placeholder image (ALWAYS matches vehicle text) ----
function escapeXml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function placeholderImage({ year, make, model, extra = "" }) {
  const title = escapeXml(`${year} ${make} ${model}`.trim());
  const sub = escapeXml(extra);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1020"/>
        <stop offset="100%" stop-color="#2b1240"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="60" y="60" width="1080" height="580" rx="34"
      fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
    <text x="110" y="210" fill="rgba(255,255,255,0.92)"
      font-family="Arial, sans-serif" font-size="56" font-weight="800">
      ${title}
    </text>
    <text x="110" y="285" fill="rgba(255,255,255,0.72)"
      font-family="Arial, sans-serif" font-size="26">
      ${sub || "Placeholder image (matches API data)"}
    </text>
  </svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// build mpg from whatever fields exist
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

function pickFirst(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

// Route id supports two formats:
//
// A) model-based (your current flow):
//    makeId:modelId:year:makeName:modelName
//
// B) VIN-based (snippet flow):
//    vin:<VIN>
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

  // VIN route
  if (s.toLowerCase().startsWith("vin:")) {
    return { kind: "vin", vin: s.slice(4) };
  }

  // Model route
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

/**
 * ✅ VIN LOOKUP (this matches your snippet)
 * GET /api/vin/{vin}
 */
export async function decodeVin(vin) {
  const clean = String(vin || "")
    .trim()
    .toUpperCase();
  if (!clean) throw new Error("VIN is required.");

  const payload = await getJson(
    `${API_BASE_URL}/api/vin/${encodeURIComponent(clean)}`,
  );

  // car-api2 sometimes wraps in { data: ... }
  const d = payload?.data || payload || {};

  // Normalize likely keys
  const year = Number(d.year ?? d.model_year ?? d.modelYear) || SAFE_YEAR_ENV;
  const make = d.make ?? d.make_name ?? d.makeName ?? "Unknown";
  const model = d.model ?? d.model_name ?? d.modelName ?? "Unknown";
  const trim = d.trim ?? d.trim_name ?? d.trimName ?? "";

  return {
    vin: clean,
    year: clampYear(year),
    make,
    model,
    trim,
    raw: d,
  };
}

/**
 * SEARCH (Results page)
 * Input: { query, state, year }
 * Output: cards []
 *
 * Uses:
 *  - GET /api/makes
 *  - GET /api/models?make_id=###
 */
export async function searchVehicles({ query = "", state = "", year } = {}) {
  const q = norm(query);
  const y = clampYear(year);
  if (!q) return [];

  const makesRes = await getJson(`${API_BASE_URL}/api/makes`);
  const makes = pickArray(makesRes);

  const exact = makes.find((m) => norm(m.make || m.make_name || m.name) === q);
  const fuzzy =
    exact ||
    makes.find((m) => norm(m.make || m.make_name || m.name).includes(q));

  if (!fuzzy) throw new Error(`No make found for "${query}"`);

  const makeName = fuzzy.make || fuzzy.make_name || fuzzy.name || query;
  const makeId = Number(fuzzy.make_id ?? fuzzy.id);
  if (!Number.isFinite(makeId) || makeId <= 0) {
    throw new Error("Make found but make_id is invalid.");
  }

  const modelsRes = await getJson(
    `${API_BASE_URL}/api/models?make_id=${makeId}&year=${y}`,
  );
  const models = pickArray(modelsRes);

  return models
    .filter((m) => Number.isFinite(Number(m.model_id ?? m.id)))
    .slice(0, 6)
    .map((m) => {
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
        type: "Vehicle",
        pricePerMonth: 699,
        mpg: 25,
        drivetrain: "N/A",
        state: state || "N/A",
        // ✅ placeholder that MATCHES the API data text
        imageUrl: placeholderImage({
          year: y,
          make: makeName,
          model: modelName,
        }),
        raw: m,
      };
    });
}

/**
 * DETAILS (Vehicle page)
 * Accepts:
 *  A) model route id (makeId:modelId:year:makeName:modelName)
 *  B) VIN route id (vin:1GTG6CEN0L1139305)
 */
export async function getVehicleById(id) {
  const parsed = parseRouteId(id);

  // --- VIN details (snippet-based) ---
  if (parsed.kind === "vin") {
    const vinData = await decodeVin(parsed.vin);

    return {
      id: String(id),
      year: vinData.year,
      make: vinData.make,
      model: vinData.model,
      type: "Vehicle",
      trim: vinData.trim || "N/A",
      pricePerMonth: 699,
      mpg: 25,
      drivetrain: "N/A",
      fuel: "N/A",
      transmission: "N/A",
      cylinders: "N/A",
      // ✅ placeholder image that EXACTLY matches decoded VIN data
      imageUrl: placeholderImage({
        year: vinData.year,
        make: vinData.make,
        model: vinData.model,
        extra: vinData.trim
          ? `VIN: ${vinData.vin} • ${vinData.trim}`
          : `VIN: ${vinData.vin}`,
      }),
      raw: vinData.raw,
    };
  }

  // --- model details (current flow) ---
  const { makeId, modelId, year, makeFromRoute, modelFromRoute } = parsed;

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
    // ✅ placeholder image that matches the API data text
    imageUrl: placeholderImage({
      year,
      make,
      model,
      extra: trimName !== "N/A" ? `Trim: ${trimName}` : "",
    }),
    raw: { trimsCount: trims.length, sample: t0, allTrims: trims.slice(0, 10) },
  };
}
