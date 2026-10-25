"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Sprout,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Layers,
  Sparkles
} from "lucide-react";
import { analyzeSoil, fetchSoilPresets, fetchSimulatedSoilReading } from "../../lib/api";
import { CROPS } from "../../lib/constants";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import SimulatedSensorBadge from "../../components/SimulatedSensorBadge";
import AgentBadge from "../../components/AgentBadge";
import { SoilAnalysisResult } from "../../types";

export default function SoilAnalysisPage() {
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [ph, setPh] = useState<number>(7.2);
  const [nitrogen, setNitrogen] = useState<number>(220.0);
  const [phosphorus, setPhosphorus] = useState<number>(18.0);
  const [potassium, setPotassium] = useState<number>(190.0);
  const [moisture, setMoisture] = useState<number>(24.0);
  const [organicCarbon, setOrganicCarbon] = useState<number>(0.55);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);

  useEffect(() => {
    fetchSoilPresets().then((d) => setPresets(d.presets || []));
  }, []);

  const handleApplyPreset = (p: any) => {
    setPh(p.ph);
    setNitrogen(p.nitrogen);
    setPhosphorus(p.phosphorus);
    setPotassium(p.potassium);
    setMoisture(p.moisture);
    setOrganicCarbon(p.organic_carbon);
    setIsSimulated(true);
  };

  const handleSimulateRandom = async () => {
    try {
      const data = await fetchSimulatedSoilReading("black_cotton");
      setPh(data.ph);
      setNitrogen(data.nitrogen);
      setPhosphorus(data.phosphorus);
      setPotassium(data.potassium);
      setMoisture(data.moisture);
      setOrganicCarbon(data.organic_carbon);
      setIsSimulated(true);
    } catch {
      setPh(7.6);
      setNitrogen(190.0);
      setPhosphorus(14.0);
      setPotassium(220.0);
      setMoisture(22.0);
      setOrganicCarbon(0.48);
      setIsSimulated(true);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await analyzeSoil({
        crop_name: selectedCrop,
        ph,
        nitrogen,
        phosphorus,
        potassium,
        moisture,
        organic_carbon: organicCarbon,
        is_simulated: isSimulated,
      });
      setResult(res);
    } catch {
      alert("Error analyzing soil parameters. Ensure backend is active.");
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
            <AgentBadge name="SoilAgent" />
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              NPK & Soil Chemistry Model
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Soil Health & Nutrient Stoichiometry
          </h1>
          <p className="text-sm text-gray-500">
            Rule-based fertility evaluation, nutrient balances, and customized fertilizer prescriptions.
          </p>
        </div>

        {/* Quick Simulator Button */}
        <button
          onClick={handleSimulateRandom}
          className="px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Cpu className="w-4 h-4 text-amber-700 animate-pulse" />
          <span>Load Simulated Soil Test Data</span>
        </button>
      </div>

      <DisclaimerBanner customText="Agronomic Threshold Disclaimer: Soil fertility interpretations and fertilizer doses are illustrative heuristics based on ICAR/MPKV guidelines. Always refer to certified laboratory soil test reports before purchasing commercial inputs." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Preset Agro-Zones */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Maharashtra Soil Agro-Zone Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-left p-2.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-xs"
                >
                  <div className="font-bold text-gray-900">{p.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    pH: {p.ph} · N: {p.nitrogen} · P: {p.phosphorus}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-700" />
                <span>Chemical & Physical Inputs</span>
              </h2>
              {isSimulated && <SimulatedSensorBadge label="SIMULATED TEST DATA" />}
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Crop
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

              {/* pH Input */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                  <span>Soil Reaction (pH):</span>
                  <span className="text-base text-amber-900">{ph}</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="9.5"
                  step="0.1"
                  value={ph}
                  onChange={(e) => {
                    setPh(parseFloat(e.target.value));
                    setIsSimulated(true);
                  }}
                  className="w-full accent-amber-700 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Acidic (&lt;6.0)</span>
                  <span>Neutral (6.5 - 7.5)</span>
                  <span>Alkaline (&gt;8.0)</span>
                </div>
              </div>

              {/* N-P-K Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nitrogen N (kg/ha)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="800"
                    value={nitrogen}
                    onChange={(e) => {
                      setNitrogen(parseFloat(e.target.value) || 0);
                      setIsSimulated(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 font-medium"
                  />
                  <span className="text-[10px] text-gray-400">Ideal: 280-560</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phosphorus P (kg/ha)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={phosphorus}
                    onChange={(e) => {
                      setPhosphorus(parseFloat(e.target.value) || 0);
                      setIsSimulated(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 font-medium"
                  />
                  <span className="text-[10px] text-gray-400">Ideal: 10-25</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Potassium K (kg/ha)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={potassium}
                    onChange={(e) => {
                      setPotassium(parseFloat(e.target.value) || 0);
                      setIsSimulated(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 font-medium"
                  />
                  <span className="text-[10px] text-gray-400">Ideal: 110-280</span>
                </div>
              </div>

              {/* Organic Carbon & Moisture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organic Carbon (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="3.0"
                    value={organicCarbon}
                    onChange={(e) => {
                      setOrganicCarbon(parseFloat(e.target.value) || 0.1);
                      setIsSimulated(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 font-medium"
                  />
                  <span className="text-[10px] text-gray-400">Target: &gt;0.75%</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Soil Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="50"
                    value={moisture}
                    onChange={(e) => {
                      setMoisture(parseFloat(e.target.value) || 10);
                      setIsSimulated(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 font-medium"
                  />
                  <span className="text-[10px] text-gray-400">Target: 22-30%</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-700 to-emerald-700 hover:from-amber-800 hover:to-emerald-800 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-5 h-5" />
                <span>{loading ? "Evaluating Stoichiometry..." : "Analyze Soil Health"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Output Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              {/* Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Soil Fertility Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-amber-950">
                      {result.soil_fertility_index}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">/ 100</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    result.urgency === "critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : result.urgency === "warning"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {result.urgency.toUpperCase()}
                </span>
              </div>

              {/* pH Evaluation Box */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 uppercase">
                  pH Reaction: {result.ph_evaluation.classification} ({result.ph_evaluation.value})
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {result.ph_evaluation.risk}
                </p>
                <div className="mt-2 text-xs font-semibold text-amber-950 bg-white/70 p-2 rounded-lg border border-amber-200">
                  Amendment: {result.ph_evaluation.amendment}
                </div>
              </div>

              {/* Nutrients Status Grid */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Nutrient Status Matrix
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.nutrients).map(([nutrient, stat]) => (
                    <div
                      key={nutrient}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-0.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">{nutrient}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            stat.status === "Optimal"
                              ? "bg-emerald-100 text-emerald-800"
                              : stat.status === "High"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {stat.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Level: <strong>{stat.value}</strong> (Ideal: {stat.ideal_range})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chemical Fertilizer Plan */}
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  Recommended Fertilizer Dosage (4R Stewardship)
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {result.fertilizer_plan.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organic Amendments */}
              <div>
                <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">
                  Organic & Biological Soil Building
                </h4>
                <ul className="space-y-1 text-xs text-gray-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  {result.organic_amendments.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>🌱</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{result.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400 space-y-3">
              <FlaskConical className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 text-sm">Awaiting Soil Analysis</h3>
              <p className="text-xs max-w-xs mx-auto">
                Adjust pH, NPK, and organic carbon values or select a Maharashtra agro-zone preset to generate agronomic fertilizer recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
