const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboard(params: {
  crop_name?: string;
  growth_stage?: string;
  location_name?: string;
  lat?: number;
  lon?: number;
  soil_moisture?: number;
  is_simulated?: boolean;
}) {
  const query = new URLSearchParams({
    crop_name: params.crop_name || "Soybean",
    growth_stage: params.growth_stage || "Vegetative",
    location_name: params.location_name || "Pune, Maharashtra",
    lat: String(params.lat ?? 18.5204),
    lon: String(params.lon ?? 73.8567),
    soil_moisture: String(params.soil_moisture ?? 24.0),
    is_simulated: String(params.is_simulated ?? true),
  });
  const res = await fetch(`${API_BASE}/dashboard/overview?${query}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard overview");
  return res.json();
}

export async function fetchWeather(lat: number, lon: number, locationName: string) {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE}/weather/forecast?${query}`);
  if (!res.ok) throw new Error("Failed to fetch weather forecast");
  return res.json();
}

export async function calculateIrrigation(payload: any) {
  const res = await fetch(`${API_BASE}/irrigation/calculate?save_to_history=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Irrigation calculation failed");
  return res.json();
}

export async function fetchSimulatedMoisture(cropName: string, scenario: string = "dry") {
  const res = await fetch(`${API_BASE}/irrigation/simulated-reading?crop_name=${encodeURIComponent(cropName)}&scenario=${scenario}`);
  return res.json();
}

export async function analyzeSoil(payload: any) {
  const res = await fetch(`${API_BASE}/soil/analyze?save_to_history=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Soil analysis failed");
  return res.json();
}

export async function fetchSoilPresets() {
  const res = await fetch(`${API_BASE}/soil/presets`);
  return res.json();
}

export async function fetchSimulatedSoilReading(soilType: string) {
  const res = await fetch(`${API_BASE}/soil/simulated-reading?soil_type=${encodeURIComponent(soilType)}`);
  return res.json();
}

export async function fetchCropHealthSamples() {
  const res = await fetch(`${API_BASE}/crop-health/samples`);
  return res.json();
}

export async function analyzeCropHealthSample(payload: { crop_name: string; sample_id?: string; demo_mode?: boolean }) {
  const res = await fetch(`${API_BASE}/crop-health/analyze-sample?save_to_history=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Crop health diagnosis failed");
  return res.json();
}

export async function uploadCropImage(formData: FormData) {
  const res = await fetch(`${API_BASE}/crop-health/analyze-upload?save_to_history=true`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Crop photo analysis failed");
  return res.json();
}

export async function sendChatMessage(message: string, crop: string, location: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      crop_context: crop,
      location_context: location,
    }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function fetchHistory(category?: string) {
  const url = category ? `${API_BASE}/history?category=${category}` : `${API_BASE}/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function deleteHistoryItem(id: number) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  return res.json();
}

export async function seedDemoHistory() {
  const res = await fetch(`${API_BASE}/history/seed-demo`, { method: "POST" });
  return res.json();
}
