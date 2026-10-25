"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Sprout,
  Droplets,
  FlaskConical,
  ShieldAlert,
  Cpu,
  RefreshCw
} from "lucide-react";
import { fetchHistory, deleteHistoryItem, clearAllHistory, seedDemoHistory } from "../../lib/api";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import AgentBadge from "../../components/AgentBadge";
import { HistoryItem } from "../../types";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadHistory = async (cat?: string) => {
    setLoading(true);
    try {
      const activeCat = cat && cat !== "all" ? cat : undefined;
      const data = await fetchHistory(activeCat);
      setHistoryItems(data.records || []);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(categoryFilter);
  }, [categoryFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this observation record from SQLite?")) return;
    try {
      await deleteHistoryItem(id);
      setHistoryItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Failed to delete record.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all history logs from the SQLite database?")) return;
    try {
      await clearAllHistory();
      setHistoryItems([]);
    } catch {
      alert("Failed to clear history.");
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemoHistory();
      loadHistory(categoryFilter);
    } catch {
      alert("Failed to seed demo data.");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `agrismart_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "irrigation":
        return <AgentBadge name="IrrigationAgent" size="sm" />;
      case "soil":
        return <AgentBadge name="SoilAgent" size="sm" />;
      case "crop_health":
        return <AgentBadge name="CropHealthAgent" size="sm" />;
      case "coordinated":
        return <AgentBadge name="CoordinatorAgent" size="sm" />;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{cat}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-slate-100 text-slate-800">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              SQLite Audit & Decision Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Observation & Recommendation History
          </h1>
          <p className="text-sm text-gray-500">
            Persistent audit trail of sensor inputs, irrigation schedules, soil analyses, and diagnostic scans.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJSON}
            disabled={historyItems.length === 0}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSeedDemo}
            className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Seed Demo Logs</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={historyItems.length === 0}
            className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Ledger</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner customText="Audit Trail Notice: Historical records reflect automated calculations at the time of execution. For agronomic regulatory compliance, cross-reference with official Krishi Vigyan Kendra inspection logs." />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Observations" },
          { id: "irrigation", label: "Smart Irrigation" },
          { id: "soil", label: "Soil Analysis" },
          { id: "crop_health", label: "Crop Health" },
          { id: "coordinated", label: "Coordinated Syntheses" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === tab.id
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">Querying SQLite database...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <History className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 text-sm">No History Records Found</h3>
            <p className="text-xs max-w-xs mx-auto">
              Run an irrigation calculation, soil test, or click &ldquo;Seed Demo Logs&rdquo; to populate initial records.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {historyItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="p-4 md:p-5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(item.category)}
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        🌱 {item.crop_name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.location}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-2.5 flex items-start justify-between gap-4">
                    <p className="text-xs md:text-sm font-semibold text-gray-800 leading-relaxed">
                      {item.summary}
                    </p>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex-shrink-0"
                    >
                      {isExpanded ? "Collapse Details" : "View Telemetry"}
                    </button>
                  </div>

                  {/* Collapsible JSON details view */}
                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto shadow-inner">
                      <pre>{JSON.stringify(item.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
