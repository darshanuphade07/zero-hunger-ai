"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplets,
  ShieldCheck,
  FlaskConical,
  CloudSun,
  MessageSquareText,
  History,
  Info
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/irrigation", label: "Smart Irrigation", icon: Droplets },
  { href: "/crop-health", label: "Crop Health Scan", icon: ShieldCheck },
  { href: "/soil-analysis", label: "Soil Analysis", icon: FlaskConical },
  { href: "/weather", label: "Live Weather", icon: CloudSun },
  { href: "/chat", label: "AgriMitra Chat", icon: MessageSquareText },
  { href: "/history", label: "History & Logs", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
          Precision Modules
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sustainable Development Goal 2 Card */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-emerald-800 to-green-950 text-white shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-gray-900 font-black text-xs flex items-center justify-center">
            2
          </div>
          <span className="font-bold text-xs uppercase tracking-wide text-emerald-200">
            UN SDG: Zero Hunger
          </span>
        </div>
        <p className="text-[11px] text-emerald-100/90 leading-relaxed">
          Empowering smallholder farmers through coordinated agent advisories to optimize water, soil, and yield.
        </p>
      </div>
    </aside>
  );
}
