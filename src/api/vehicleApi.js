// src/api/vehicleApi.js

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST || !API_BASE_URL) {
  throw new Error(
    "Missing env vars. Ensure .env is in PROJECT ROOT (not /src) and contains:\n" +
      "VITE_RAPIDAPI_KEY=...\nVITE_RAPIDAPI_HOST=car-api2.p.rapidapi.com\nVITE_API_BASE_URL=https://car-api2.p.rapidapi.com\n" +
      "Then restart: Ctrl+C → Y → npm run dev"
  );
}

const DEFAULT_HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

function normalize(str = "") {
  return String(str).trim().toLowerCase();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: DEFAULT_HEADERS });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  // RapidAPI sometimes returns HTML when auth/endpoint is wrong
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Non-JSON response. URL: ${url}\nStatus: ${res.status}\nContent-Type: ${contentType}\nBody starts with: ${text.slice(
        0,
        120
      )}`
    );
  }

  const data = JSON.parse(text);

  if (!res.ok) {
    throw new Error(
      `API error ${res.status}: ${JSON.stringify(data).slice(0, 200)}`
    );
  }

  return data;
}

/**
 * Search vehicles (uses makes -> models)
 * Returns 6 cards
 */
export async function searchVehicles({ query = "", state = "" }) {
  const q = normalize(query);
  if (!q) return [];

  const makesRes = await fetchJson(`${API_BASE_URL}/api/makes`);

  const makesRaw =
    makesRes?.data?.data ||
    makesRes?.data ||
    makesRes?.results ||
    makesRes ||
    [];

  const makes = Array.isArray(makesRaw) ? makesRaw : [];

  const toMakeName = (m) =>
    normalize(
      m?.make ||
        m?.make_name ||
        m?.name ||
        m?.Make ||
        m?.MakeName ||
        ""
    );

  const make =
    makes.find((m) => toMakeName(m) === q) ||
    makes.find((m) => toMakeName(m).includes(q));

  if (!make) {
    const sample = makes.slice(0, 5).map((m) => ({
      make_id: m.make_id ?? m.id ?? null,
      make: m.make ?? m.make_name ?? m.name ?? null,
    }));
    throw new Error(
      `No make found for "${query}". Example API items: ${JSON.stringify(sample)}`
    );
  }

  const makeId = Number(make.make_id ?? make.id);
  if (!Number.isFinite(makeId) || makeId <= 0) {
    throw new Error(
      `Make found but make_id is invalid. Got: ${JSON.stringify({
        make_id: make.make_id ?? make.id,
        make: make.make ?? make.make_name ?? make.name,
      })}`
    );
  }

  const modelsRes = await fetchJson(
    `${API_BASE_URL}/api/models?make_id=${encodeURIComponent(makeId)}`
  );

  const modelsRaw =
    modelsRes?.data?.data ||
    modelsRes?.data ||
    modelsRes?.results ||
    modelsRes ||
    [];

  const models = Array.isArray(modelsRaw) ? modelsRaw : [];

  const displayMake = make.make || make.make_name || make.name || "Unknown";

  return models.slice(0, 6).map((model, idx) => ({
    id: String(model.model_id || model.id || idx + 1),
    year: "N/A",
    make: displayMake,
    model: model.model || model.model_name || model.name || "Unknown",
    type: "Model",
    pricePerMonth: 799,
    mpg: 25,
    drivetrain: "N/A",
    state: state || "N/A",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60",
    raw: { make, model },
  }));
}

/**
 * Details route: /vehicle/:id
 * For now, treat id as model_id and show model info.
 */
export async function getVehicleById(id) {
  const modelId = Number(id);
  if (!Number.isFinite(modelId) || modelId <= 0) {
    throw new Error("Vehicle id must be a positive number (model_id).");
  }

  const modelsRes = await fetchJson(`${API_BASE_URL}/api/models?id=${modelId}`);
  const list =
    modelsRes?.data?.data || modelsRes?.data || modelsRes?.results || [];

  const model = Array.isArray(list) ? list[0] : null;

  return {
    id: String(id),
    year: "N/A",
    make: model?.make || model?.make_name || model?.make_id || "Unknown",
    model: model?.model || model?.model_name || model?.name || "Unknown",
    type: "Model",
    pricePerMonth: 799,
    mpg: "N/A",
    drivetrain: "N/A",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60",
    raw: model,
  };
}
