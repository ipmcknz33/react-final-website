// src/api/vehicleApi.js

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Missing VITE_API_BASE_URL. Create a .env file in the project root (same level as package.json) and restart `npm run dev`."
  );
}

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  throw new Error(
    "Missing RapidAPI env vars. Ensure VITE_RAPIDAPI_KEY and VITE_RAPIDAPI_HOST exist in .env, then restart `npm run dev`."
  );
}
