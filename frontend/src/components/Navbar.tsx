"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, CheckCircle2, AlertCircle, HeartHandshake, MapPin } from "lucide-react";
import { fetchHealth } from "../lib/api";

export default function Navbar() {
  const [backendStatus, setBackendStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setBackendStatus("online");
        setIsGeminiActive(Boolean(data.gemini_configured));
      })
      .catch(() => {
        setBackendStatus("offline");
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-1.5">
                  AgriSmart <span className="text-emerald-600">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                  Zero Hunger · SDG 2
                </span>
              </div>
            </Link>
          </div>

          {/* Region / Farm Context */}
          <div className="hidden md:flex items-center text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            <span>Region: <strong>Maharashtra, India</strong></span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-emerald-700">Precision Smallholder Pilot</span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-3">
            {/* Gemini / Demo Mode Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                isGeminiActive
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
              title={isGeminiActive ? "Google Gemini API connected" : "Running in 100% Free Offline Demo Simulation Mode"}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isGeminiActive ? "bg-purple-500 animate-pulse" : "bg-emerald-500"}`} />
              {isGeminiActive ? "Gemini 1.5 Active" : "Offline Demo Mode (Free)"}
            </span>

            {/* Backend Connectivity Status */}
            <div className="flex items-center text-xs font-medium">
              {backendStatus === "online" ? (
                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  API Connected
                </span>
              ) : backendStatus === "connecting" ? (
                <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-ping mr-1.5" />
                  Connecting...
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200" title="Start backend on port 8000">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  Backend Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
