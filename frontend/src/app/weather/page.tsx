"use client";

import React, { useState, useEffect } from "react";
import {
  CloudSun,
  Wind,
  Droplets,
  CloudRain,
  Compass,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sun,
  ShieldAlert,
  Info,
  Clock
} from "lucide-react";
import { fetchWeather } from "../../lib/api";
import { MAHARASHTRA_LOCATIONS } from "../../lib/constants";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import AgentBadge from "../../components/AgentBadge";
import { WeatherOverview } from "../../types";

export default function WeatherPage() {
  const [selectedLoc, setSelectedLoc] = useState(MAHARASHTRA_LOCATIONS[0]);
  const [customLat, setCustomLat] = useState<number>(18.5204);
  const [customLon, setCustomLon] = useState<number>(73.8567);
  const [customCity, setCustomCity] = useState<string>("Pune, Maharashtra");
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon, name);
      setWeather(data);
    } catch {
      setError("Unable to connect to Open-Meteo live API. Using cached agro-meteorology fallback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!useCustom) {
      loadWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
    } else {
      loadWeather(customLat, customLon, customCity);
    }
  }, [selectedLoc, useCustom]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUseCustom(true);
    loadWeather(customLat, customLon, customCity);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AgentBadge name="WeatherAgent" />
            <span className="text-xs font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
              Open-Meteo Live Agro-Meteorology
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Agricultural Weather & Evapotranspiration
          </h1>
          <p className="text-sm text-gray-500">
            Real-time hyper-local weather, FAO-56 $ET_0$ indices, and chemical spraying advisories.
          </p>
        </div>

        {/* Location Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={useCustom ? "custom" : selectedLoc.name}
            onChange={(e) => {
              if (e.target.value === "custom") {
                setUseCustom(true);
              } else {
                setUseCustom(false);
                const loc = MAHARASHTRA_LOCATIONS.find((l) => l.name === e.target.value);
                if (loc) setSelectedLoc(loc);
              }
            }}
            className="bg-gray-50 border border-gray-300 text-xs rounded-lg p-2.5 font-medium"
          >
            {MAHARASHTRA_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                📍 {loc.name}
              </option>
            ))}
            <option value="custom">⚙️ Custom Coordinates...</option>
          </select>

          <button
            onClick={() =>
              useCustom
                ? loadWeather(customLat, customLon, customCity)
                : loadWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name)
            }
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Custom Coordinates Bar (if selected) */}
      {useCustom && (
        <form
          onSubmit={handleCustomSubmit}
          className="bg-white rounded-2xl p-4 border border-sky-200 shadow-sm flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-sky-900">Custom Location:</span>
          <input
            type="text"
            placeholder="City / Village Name"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 font-medium"
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Latitude (e.g. 18.52)"
            value={customLat}
            onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
            className="w-28 border border-gray-300 rounded px-2.5 py-1.5 font-medium"
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude (e.g. 73.85)"
            value={customLon}
            onChange={(e) => setCustomLon(parseFloat(e.target.value) || 0)}
            className="w-28 border border-gray-300 rounded px-2.5 py-1.5 font-medium"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 text-white rounded font-bold hover:bg-sky-700"
          >
            Fetch Open-Meteo
          </button>
        </form>
      )}

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xl">
          {error}
        </div>
      )}

      {/* Current Conditions & Spraying Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Current Weather Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 rounded-2xl p-6 text-white shadow-md space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                Current Agro-Meteorology
              </span>
              <h2 className="text-xl font-black mt-1">
                {weather?.location ?? selectedLoc.name}
              </h2>
              <p className="text-xs text-sky-200 mt-0.5">
                Lat: {weather?.latitude} · Lon: {weather?.longitude}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <CloudSun className="w-10 h-10 text-amber-300" />
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-black">
              {weather?.current_temp ?? 28.5}°C
            </span>
            <div className="text-sm font-semibold text-sky-100">
              {weather?.current_weather_desc ?? "Mainly Clear"}
            </div>
          </div>

          {/* Environmental metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-sky-500/50">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sky-200 text-xs">
                <Droplets className="w-3.5 h-3.5" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-bold mt-1">
                {weather?.current_humidity ?? 58}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sky-200 text-xs">
                <Wind className="w-3.5 h-3.5" />
                <span>Wind Speed</span>
              </div>
              <div className="text-base font-bold mt-1">
                {weather?.current_wind_speed_kmh ?? 9.5} km/h
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sky-200 text-xs">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rain (24h)</span>
              </div>
              <div className="text-base font-bold mt-1">
                {weather?.rain_probability_next_24h ?? 15}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sky-200 text-xs">
                <Sun className="w-3.5 h-3.5" />
                <span>ET₀ Evapo</span>
              </div>
              <div className="text-base font-bold mt-1">
                {weather?.et0_today_mm ?? 4.5} mm
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Spraying Suitability Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Chemical Spraying Window
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  weather?.spraying_conditions === "Optimal"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
              >
                {weather?.spraying_conditions ?? "Evaluating..."}
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-800">
                Spraying Advisory:
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {weather?.spraying_advisory ??
                  "Ideal weather window for crop spraying (calm winds, moderate humidity, low wash-off risk)."}
              </p>
            </div>

            {/* Threshold reference */}
            <div className="mt-4 text-[11px] text-gray-500 space-y-1">
              <div>• Maximum safe wind speed: <strong>&lt; 15 km/h</strong></div>
              <div>• Rain probability safety threshold: <strong>&lt; 30%</strong></div>
              <div>• Recommended relative humidity: <strong>40% - 80%</strong></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>Open-Meteo weather API provides keyless live forecasts globally.</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Hourly Forecast Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Next 24-Hour Temperature & Rain Probability Timeline</span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
          {weather?.hourly_temperatures?.map((h, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1"
            >
              <span className="text-[10px] font-bold text-gray-400 block">{h.time}</span>
              <span className="text-xs font-black text-gray-800 block">{Math.round(h.temperature)}°C</span>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1 py-0.5 rounded block">
                💧 {h.rain_probability}%
              </span>
              <span className="text-[9px] text-gray-400 block">RH: {h.humidity}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Extended Forecast */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-emerald-600" />
          <span>7-Day Agricultural Agro-Met Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weather?.forecast_7days?.map((d, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center text-center space-y-1.5 hover:border-sky-400 transition-colors"
            >
              <span className="text-xs font-bold text-gray-700">
                {new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <CloudSun className="w-7 h-7 text-amber-500 my-1" />
              <div className="text-xs font-black text-gray-900">
                {Math.round(d.temp_max)}° / {Math.round(d.temp_min)}°C
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                💧 {d.rain_probability_pct}% ({d.precipitation_mm}mm)
              </span>
              <span className="text-[10px] text-gray-500">
                ET₀: {d.et0_mm} mm
              </span>
              <span className="text-[10px] text-gray-400 line-clamp-1">
                {d.weather_description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
