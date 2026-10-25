"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Droplets,
  CloudSun,
  ShieldCheck,
  FlaskConical,
  MessageSquareText,
  History,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";
import { fetchDashboard } from "../lib/api";
import { MAHARASHTRA_LOCATIONS, CROPS, GROWTH_STAGES } from "../lib/constants";
import DisclaimerBanner from "../components/DisclaimerBanner";
import SimulatedSensorBadge from "../components/SimulatedSensorBadge";
import AgentBadge from "../components/AgentBadge";
import { DashboardOverview } from "../types";

export default function DashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState(MAHARASHTRA_LOCATIONS[0]);
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0].name);
  const [selectedStage, setSelectedStage] = useState(CROPS[0].defaultStage);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboard({
        crop_name: selectedCrop,
        growth_stage: selectedStage,
        location_name: selectedLocation.name,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        soil_moisture: 23.5,
        is_simulated: true,
      });
      setData(res);
    } catch (err: any) {
      setError("Unable to connect to AgriSmart AI backend. Ensure the backend server is running on http://127.0.0.1:8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation, selectedCrop, selectedStage]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Multi-Agent Precision Agriculture System</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Farm Operations Command
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Coordinated agronomic intelligence driving UN Sustainable Development Goal 2 (Zero Hunger).
            </p>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Location Select */}
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const found = MAHARASHTRA_LOCATIONS.find((l) => l.name === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 font-medium"
            >
              {MAHARASHTRA_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  📍 {loc.name}
                </option>
              ))}
            </select>

            {/* Crop Select */}
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                const c = CROPS.find((cr) => cr.name === e.target.value);
                if (c) setSelectedStage(c.defaultStage);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 font-medium"
            >
              {CROPS.map((crop) => (
                <option key={crop.name} value={crop.name}>
                  🌱 {crop.name} ({crop.marathi})
                </option>
              ))}
            </select>

            {/* Growth Stage Select */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 font-medium"
            >
              {GROWTH_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  Stage: {stg}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
              title="Refresh farm telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimers & Alerts */}
      <DisclaimerBanner />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Farm Health Index */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Farm Health Score
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loading ? "--" : data?.farm_health_score}
            </span>
            <span className="text-sm font-semibold text-gray-500">/ 100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-700">
              Status: {loading ? "Evaluating..." : data?.overall_status}
            </span>
            <span className="text-gray-400">Coordinator Index</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${data?.farm_health_score ?? 70}%` }}
            />
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Soil Moisture Index
            </span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-900">23.5%</span>
            <span className="text-xs font-medium text-gray-500">(Target: 28%)</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <SimulatedSensorBadge label="SIMULATED SENSOR" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Capacitance reading generated for demonstration.
          </p>
        </div>

        {/* Live Weather Indicator */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Live Weather
            </span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {loading ? "--" : `${data?.weather_details?.current_temp ?? 28}°C`}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {data?.weather_details?.current_weather_desc ?? "Partly Cloudy"}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-600 flex justify-between">
            <span>Rain Risk: <strong>{data?.weather_details?.rain_probability_next_24h ?? 15}%</strong></span>
            <span>ET₀: <strong>{data?.weather_details?.et0_today_mm ?? 4.5} mm</strong></span>
          </div>
          <div className="mt-2 text-[10px] text-sky-700 font-semibold">
            Open-Meteo Live API Active
          </div>
        </div>

        {/* Irrigation Recommendation */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Irrigation Urgency
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {loading ? "Calculating..." : data?.irrigation_details?.urgency ?? "Moderate Needed"}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Water Deficit: <strong>{data?.irrigation_details?.net_irrigation_needed_mm ?? 14} mm</strong>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Runtime: ~{data?.irrigation_details?.recommended_duration_minutes ?? 330} mins (Drip)
          </div>
        </div>
      </div>

      {/* Coordinated Multi-Agent Advisory Panel */}
      <div className="bg-gradient-to-br from-emerald-900 via-green-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <AgentBadge name="CoordinatorAgent" />
            <h2 className="text-lg font-bold tracking-tight">
              Coordinated Farm Advisory & Synthesis
            </h2>
          </div>
          <div className="text-xs text-emerald-200 font-medium">
            Crop: <strong>{selectedCrop}</strong> ({selectedStage} Stage)
          </div>
        </div>

        {/* Primary Action Box */}
        <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Primary Agronomic Action
          </div>
          <div className="text-base font-semibold text-white mt-1 leading-relaxed">
            {loading ? "Aggregating agent telemetry..." : data?.primary_action}
          </div>
        </div>

        {/* Cross-Domain Agronomic Insights */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">
            Cross-Domain Multi-Agent Insights:
          </h3>
          <div className="space-y-2">
            {data?.cross_domain_insights?.map((insight, idx) => (
              <div
                key={idx}
                className="text-xs p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-100 flex items-start space-x-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Contributions Grid */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-3">
            Modular Agent Contributions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data?.agents &&
              Object.entries(data.agents).map(([agentName, details]) => (
                <div
                  key={agentName}
                  className="p-3 rounded-xl bg-black/25 border border-white/5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <AgentBadge name={agentName} size="sm" />
                    <span className="text-[10px] text-gray-400">{details.status}</span>
                  </div>
                  <p className="text-gray-200 text-[11px] leading-relaxed line-clamp-3">
                    {details.summary}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 7-Day Agricultural Weather Forecast Strip */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">
              7-Day Agricultural Agro-Met Forecast ({selectedLocation.name})
            </h2>
          </div>
          <Link
            href="/weather"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Full Weather View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data?.weather_details?.forecast_7days?.map((day, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center space-y-1 hover:border-emerald-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-gray-500">
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
              </span>
              <CloudSun className="w-6 h-6 text-amber-500 my-1" />
              <div className="text-xs font-bold text-gray-900">
                {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°C
              </div>
              <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">
                💧 {day.rain_probability_pct}%
              </span>
              <span className="text-[10px] text-gray-400">
                ET₀: {day.et0_mm}mm
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/irrigation"
          className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-cyan-50 text-cyan-700 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mt-3 text-sm">
              Smart Irrigation Calculator
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Calculate exact litres/acre, drip durations, and crop coefficients ($K_c$) with simulated sensor tools.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
            <span>Configure Irrigation</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/crop-health"
          className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mt-3 text-sm">
              Crop Health Diagnosis
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Upload leaf images or test curated demo presets (Soybean Rust, Cotton Bollworm, Blight) with organic remedies.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
            <span>Inspect Crop Health</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/soil-analysis"
          className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 text-amber-800 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mt-3 text-sm">
              Soil & Fertilizer Advisory
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              NPK stoichiometry, pH correction (Gypsum/Lime), and organic amendments tailored for Maharashtra soils.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
            <span>Analyze Soil Health</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
