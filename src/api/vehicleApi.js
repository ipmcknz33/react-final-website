// src/api/vehicleApi.js

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL || !RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  throw new Error(
    "Missing env vars. Ensure .env has VITE_API_BASE_URL, VITE_RAPIDAPI_KEY, VITE_RAPIDAPI_HOST and restart Vite."
  );
}

const DEFAULT_HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

async function fetchJson(url) {
  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  const text = await res.text();
  const type = res.headers.get("content-type") || "";

  if (!type.includes("application/json")) {
    throw new Error(
      `Non-JSON response\nURL: ${url}\nStatus: ${res.status}\nBody: ${text.slice(
        0,
        120
      )}`
    );
  }

  const data = JSON.parse(text);
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

/**
 * ✅ EXPORT #1 — SEARCH (Results page)
 */
export async function searchVehicles({ query = "", state = "" }) {
  const q = query.trim().toLowerCase();

  // get all makes
  const makesRes = await fetchJson(`${API_BASE_URL}/api/makes`);
  const makes = makesRes.data || [];

  const make =
    makes.find((m) =>
      String(m.make || m.make_name || "")
        .toLowerCase()
        .includes(q)
    ) || makes[0];

  if (!make) return [];

  // get models for make
  const modelsRes = await fetchJson(
    `${API_BASE_URL}/api/models?make_id=${make.make_id}`
  );
  const models = modelsRes.data || [];

  return models.slice(0, 6).map((m, i) => ({
    id: String(m.model_id || i),
    year: "N/A",
    make: make.make,
    model: m.model,
    type: "Model",
    pricePerMonth: 799,
    mpg: 25,
    drivetrain: "N/A",
    state: state || "N/A",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60",
    raw: m,
  }));
}

/**
 * ✅ EXPORT #2 — DETAILS (Vehicle page)
 */
export async function getVehicleById(id) {
  // fallback model-based details (VIN optional later)
  const modelsRes = await fetchJson(`${API_BASE_URL}/api/models`);
  const list = modelsRes.data || [];

  const found = list.find(
    (m) => String(m.model_id) === String(id)
  );

  if (!found) throw new Error("Vehicle not found");

  return {
    id,
    year: "N/A",
    make: found.make || "Unknown",
    model: found.model || "Unknown",
    type: "Model",
    pricePerMonth: 799,
    mpg: "N/A",
    drivetrain: "N/A",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60",
    raw: found,
  };
}
