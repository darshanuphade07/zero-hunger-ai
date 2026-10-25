"use client";

import React, { useState, useEffect } from "react";
import {
  Droplets,
  CloudRain,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Save,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { calculateIrrigation, fetchSimulatedMoisture, fetchWeather } from "../../lib/api";
import { MAHARASHTRA_LOCATIONS, CROPS, GROWTH_STAGES, SOIL_TEXTURES, IRRIGATION_METHODS } from "../../lib/constants";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import SimulatedSensorBadge from "../../components/SimulatedSensorBadge";
import AgentBadge from "../../components/AgentBadge";
import { IrrigationResult } from "../../types";

export default function SmartIrrigationPage() {
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [soilMoisture, setSoilMoisture] = useState<number>(22.0);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [soilTexture, setSoilTexture] = useState(SOIL_TEXTURES[0]);
  const [farmArea, setFarmArea] = useState<number>(2.5);
  const [method, setMethod] = useState(IRRIGATION_METHODS[0]);
  const [selectedLocation, setSelectedLocation] = useState(MAHARASHTRA_LOCATIONS[0]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [forecastRain, setForecastRain] = useState<number>(0.0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch rain forecast when location changes
  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name)
      .then((data) => {
        if (data.forecast_7days && data.forecast_7days.length > 0) {
          setForecastRain(data.forecast_7days[0].precipitation_mm);
        }
      })
      .catch(() => setForecastRain(0.0));
  }, [selectedLocation]);

  // Load simulated readings
  const handleLoadSimulated = async (scenario: "dry" | "optimal" | "wet") => {
    try {
      const data = await fetchSimulatedMoisture(selectedCrop, scenario);
      setSoilMoisture(data.simulated_soil_moisture_pct);
      setIsSimulated(true);
    } catch {
      setSoilMoisture(scenario === "dry" ? 14.5 : scenario === "wet" ? 36.0 : 25.0);
      setIsSimulated(true);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await calculateIrrigation({
        crop_name: selectedCrop,
        growth_stage: growthStage,
        soil_moisture_pct: soilMoisture,
        soil_texture: soilTexture,
        farm_area_acres: farmArea,
        irrigation_method: method,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        location_name: selectedLocation.name,
        is_simulated_sensor: isSimulated,
      });
      setResult(res);
      setSavedSuccess(true);
    } catch (err) {
      alert("Error calculating irrigation. Ensure backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AgentBadge name="IrrigationAgent" />
            <span className="text-xs font-semibold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
              FAO-56 Water Balance Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Smart Precision Irrigation
          </h1>
          <p className="text-sm text-gray-500">
            Soil-moisture driven water budget calculations tailored for Maharashtra smallholders.
          </p>
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Farm Hub:</label>
          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const loc = MAHARASHTRA_LOCATIONS.find((l) => l.name === e.target.value);
              if (loc) setSelectedLocation(loc);
            }}
            className="bg-gray-50 border border-gray-300 text-xs rounded-lg p-2 font-medium"
          >
            {MAHARASHTRA_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DisclaimerBanner customText="Advisory Notice: Irrigation calculations are illustrative heuristics and do NOT automatically activate any physical valves, pumps, or irrigation actuators. Always verify field conditions before irrigating." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-600" />
            <span>Field & Soil Moisture Telemetry</span>
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Crop & Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Crop Cultivated
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-medium"
                >
                  {CROPS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.marathi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phenological Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-medium"
                >
                  {GROWTH_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s} Stage
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Soil Moisture with Simulated Helpers */}
            <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-cyan-950">
                  Soil Moisture Content (%)
                </label>
                {isSimulated && <SimulatedSensorBadge label="SIMULATED DATA" />}
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="0.5"
                  value={soilMoisture}
                  onChange={(e) => {
                    setSoilMoisture(parseFloat(e.target.value));
                    setIsSimulated(true);
                  }}
                  className="w-full accent-cyan-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="text-xl font-black text-cyan-900 w-16 text-right">
                  {soilMoisture}%
                </span>
              </div>

              {/* Realistic Simulated Generator Buttons */}
              <div className="pt-2 border-t border-cyan-200/60">
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <span>Generate Realistic Simulated Readings (Educational Test Scenarios):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSimulated("dry")}
                    className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-medium"
                  >
                    Simulate Deficit / Drought (14%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSimulated("optimal")}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-medium"
                  >
                    Simulate Adequate (25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSimulated("wet")}
                    className="text-xs px-2.5 py-1 rounded bg-sky-100 text-sky-900 hover:bg-sky-200 font-medium"
                  >
                    Simulate Saturated (36%)
                  </button>
                </div>
              </div>
            </div>

            {/* Farm Area & Soil Texture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Farm Plot Area (Acres)
                </label>
                <input
                  type="number"
                  min="0.25"
                  max="100"
                  step="0.25"
                  value={farmArea}
                  onChange={(e) => setFarmArea(parseFloat(e.target.value) || 1)}
                  className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Soil Texture Type
                </label>
                <select
                  value={soilTexture}
                  onChange={(e) => setSoilTexture(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-medium"
                >
                  {SOIL_TEXTURES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Irrigation Method */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Irrigation Delivery System
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 font-medium"
              >
                {IRRIGATION_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Weather Rain Preview */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span className="text-gray-600">
                  Open-Meteo 24h Rain Forecast for {selectedLocation.name}:
                </span>
              </div>
              <span className="font-bold text-sky-900">{forecastRain} mm</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Droplets className="w-5 h-5" />
              <span>{loading ? "Calculating Crop Water Balance..." : "Calculate Irrigation Advisory"}</span>
            </button>
          </form>
        </div>

        {/* Results Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Agent Advisory Output
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    result.urgency.includes("Critical")
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : result.urgency.includes("Rain Delay")
                      ? "bg-sky-100 text-sky-900 border border-sky-300"
                      : result.urgency.includes("Moderate")
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {result.urgency}
                </span>
              </div>

              {/* Action summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  Action Recommendation
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {result.action_summary}
                </div>
              </div>

              {/* Volume & Runtime Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase">
                    Water Required (Acre)
                  </span>
                  <div className="text-lg font-black text-cyan-950 mt-1">
                    {result.volume_litres_per_acre.toLocaleString()} L
                  </div>
                  <span className="text-[11px] text-cyan-700">
                    Depth: {result.net_irrigation_needed_mm} mm
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">
                    Drip Runtime
                  </span>
                  <div className="text-lg font-black text-emerald-950 mt-1">
                    {result.recommended_duration_minutes} mins
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    (~{(result.recommended_duration_minutes / 60).toFixed(1)} hours)
                  </span>
                </div>
              </div>

              {/* Agronomic Reasoning */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Agronomic Reasoning:
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {result.reasoning}
                </p>
              </div>

              {/* Detailed Metrics */}
              <div className="text-xs space-y-1.5 text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Crop Coefficient (Kc):</span>
                  <strong className="text-gray-800">{result.crop_coefficient_kc}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Reference ET₀:</span>
                  <strong className="text-gray-800">{result.reference_et0_mm} mm/day</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gross Crop ETc:</span>
                  <strong className="text-gray-800">{result.crop_water_requirement_mm} mm/day</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Farm Plot Volume ({farmArea} ac):</span>
                  <strong className="text-gray-800">{result.total_volume_litres.toLocaleString()} Litres</strong>
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Notice: </strong>
                  {result.equipment_notice}
                </span>
              </div>

              {savedSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Observation recorded to local SQLite history log.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400 space-y-3">
              <Droplets className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 text-sm">Awaiting Calculation</h3>
              <p className="text-xs max-w-xs mx-auto">
                Select your crop, enter or simulate soil moisture, and click Calculate to view precision irrigation schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
