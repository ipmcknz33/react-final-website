// ✅ PUT YOUR API BASE URL HERE
export const API_BASE_URL = "PASTE_YOUR_API_BASE_URL_HERE";

// ✅ Optional: headers for your API requests
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  // "X-RapidAPI-Key": "PASTE_KEY_HERE",
  // "X-RapidAPI-Host": "PASTE_HOST_HERE",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ✅ Mock vehicles so your UI works immediately
export const MOCK_VEHICLES = [
  {
    id: "101",
    year: 2021,
    make: "Ford",
    model: "F-150",
    type: "Truck",
    pricePerMonth: 899,
    mpg: 20,
    drivetrain: "4x4",
    imageUrl:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "102",
    year: 2020,
    make: "Chevrolet",
    model: "Silverado",
    type: "Truck",
    pricePerMonth: 859,
    mpg: 19,
    drivetrain: "4x4",
    imageUrl:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "103",
    year: 2022,
    make: "Tesla",
    model: "Model 3",
    type: "Car",
    pricePerMonth: 799,
    mpg: 120,
    drivetrain: "RWD",
    imageUrl:
      "https://images.unsplash.com/photo-1549921296-3ecf8e1b8dc4?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "104",
    year: 2021,
    make: "Toyota",
    model: "4Runner",
    type: "SUV",
    pricePerMonth: 819,
    mpg: 18,
    drivetrain: "AWD",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "105",
    year: 2019,
    make: "BMW",
    model: "M4",
    type: "Car",
    pricePerMonth: 1099,
    mpg: 20,
    drivetrain: "RWD",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "106",
    year: 2023,
    make: "Rivian",
    model: "R1T",
    type: "Truck",
    pricePerMonth: 1199,
    mpg: 70,
    drivetrain: "AWD",
    imageUrl:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=60",
  },
];

// ✅ Named export: searchVehicles (Results.jsx needs this)
export async function searchVehicles({ query = "", state = "" }) {
  // --- REAL API (uncomment and adjust if you have endpoints) ---
  // const url = `${API_BASE_URL}/vehicles?query=${encodeURIComponent(query)}&state=${encodeURIComponent(state)}`;
  // const res = await fetch(url, { headers: DEFAULT_HEADERS });
  // if (!res.ok) throw new Error("Search request failed");
  // return await res.json();

  // --- MOCK ---
  await sleep(700);
  const q = query.trim().toLowerCase();

  const filtered = MOCK_VEHICLES.filter((v) => {
    const hay = `${v.year} ${v.make} ${v.model} ${v.type}`.toLowerCase();
    return q ? hay.includes(q) : true;
  });

  return filtered.slice(0, 6);
}

// ✅ Named export: getVehicleById (VehicleDetails.jsx needs this)
export async function getVehicleById(id) {
  // --- REAL API (uncomment and adjust) ---
  // const url = `${API_BASE_URL}/vehicles/${encodeURIComponent(id)}`;
  // const res = await fetch(url, { headers: DEFAULT_HEADERS });
  // if (!res.ok) throw new Error("Detail request failed");
  // return await res.json();

  await sleep(650);
  const found = MOCK_VEHICLES.find((v) => v.id === String(id));
  if (!found) throw new Error("Vehicle not found");
  return found;
}
