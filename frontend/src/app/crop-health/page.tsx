"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Leaf,
  Bug,
  HelpCircle,
  Cpu
} from "lucide-react";
import { fetchCropHealthSamples, analyzeCropHealthSample, uploadCropImage } from "../../lib/api";
import { CROPS } from "../../lib/constants";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import AgentBadge from "../../components/AgentBadge";
import { CropHealthResult } from "../../types";

export default function CropHealthPage() {
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [samples, setSamples] = useState<any[]>([]);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("soybean_rust");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [forceDemo, setForceDemo] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropHealthResult | null>(null);

  useEffect(() => {
    fetchCropHealthSamples().then((data) => {
      setSamples(data.samples || []);
      setIsGeminiActive(Boolean(data.gemini_api_configured));
    });
  }, []);

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setUploadedFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSelectedSampleId("");
    }
  };

  const handleDiagnose = async () => {
    setLoading(true);
    try {
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("crop_name", selectedCrop);
        formData.append("demo_mode", String(forceDemo));
        const res = await uploadCropImage(formData);
        setResult(res);
      } else {
        const res = await analyzeCropHealthSample({
          crop_name: selectedCrop,
          sample_id: selectedSampleId || "soybean_rust",
          demo_mode: forceDemo || !isGeminiActive,
        });
        setResult(res);
      }
    } catch (err) {
      alert("Error diagnosing crop photo. Ensure backend is running.");
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
            <AgentBadge name="CropHealthAgent" />
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isGeminiActive
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isGeminiActive ? "Gemini Vision API Enabled" : "Demo Simulation Mode (100% Free / Offline)"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Crop Health & Pathology Inspection
          </h1>
          <p className="text-sm text-gray-500">
            Automated leaf symptom analysis with organic treatments and integrated pest management (IPM).
          </p>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs">
          <label className="font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={forceDemo}
              onChange={(e) => setForceDemo(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Force Demo Simulation Mode</span>
          </label>
        </div>
      </div>

      <DisclaimerBanner customText="Diagnostic Notice: Automated image screenings are educational heuristics. Never apply restricted chemicals or eradicate crops without physical validation by a certified Krishi Vigyan Kendra extension officer." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Selection (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Host Crop
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

            {/* Curated Sample Scans Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Option A: Choose Curated Diagnostic Preset (Instant Offline Demo)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samples.map((s) => {
                  const isSelected = selectedSampleId === s.id && !uploadedFile;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSample(s.id)}
                      className={`text-left p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 font-semibold shadow-sm ring-1 ring-emerald-500"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-bold">{s.diagnosis.replace("[DEMO] ", "")}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Crop: {s.crop_name} · {s.condition_type}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Upload Option */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Option B: Upload Field Leaf Photo
              </label>
              <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-semibold text-gray-700">
                  {uploadedFile ? uploadedFile.name : "Click to select or drag leaf image"}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">
                  JPG, PNG, WebP up to 10MB
                </span>
              </label>
              {imagePreview && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                    Selected Image
                  </div>
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{loading ? "Analyzing Foliar Pathology..." : "Run Crop Health Diagnosis"}</span>
            </button>
          </div>
        </div>

        {/* Right: Diagnosis Results (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              {/* Diagnosis Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Diagnosis Result
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        result.mode_used === "gemini_vision"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Mode: {result.mode_used === "gemini_vision" ? "Gemini Vision AI" : "Demo Simulation Preset"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mt-1">
                    {result.diagnosis}
                  </h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Classification: <strong>{result.condition_type}</strong> · Confidence:{" "}
                    <strong>{Math.round(result.confidence_score * 100)}%</strong>
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

              {/* Symptoms Identified */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Observed Symptoms</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {result.symptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organic Remedies */}
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Organic & Biological Solutions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  {result.organic_treatments.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chemical Treatments */}
              {result.chemical_treatments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-rose-600" />
                    <span>Chemical IPM Controls (Dosages & Label Compliance)</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    {result.chemical_treatments.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention Tips */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Agronomic Cultural Prevention
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  {result.prevention_tips.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Disclaimer: </strong>
                  {result.disclaimer}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 text-sm">No Diagnosis Executed</h3>
              <p className="text-xs max-w-xs mx-auto">
                Select a diagnostic sample or upload your own leaf photo, then tap Run Diagnosis to inspect plant health.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
