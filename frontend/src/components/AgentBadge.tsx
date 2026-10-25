import React from "react";
import { CloudRain, Droplet, Sprout, ShieldAlert, Cpu } from "lucide-react";

interface AgentBadgeProps {
  name: "WeatherAgent" | "IrrigationAgent" | "SoilAgent" | "CropHealthAgent" | "CoordinatorAgent" | string;
  size?: "sm" | "md";
}

export default function AgentBadge({ name, size = "md" }: AgentBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  switch (name) {
    case "WeatherAgent":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
          <CloudRain className="w-3.5 h-3.5 text-sky-600" />
          <span>WeatherAgent</span>
        </span>
      );
    case "IrrigationAgent":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 ${sizeClasses}`}>
          <Droplet className="w-3.5 h-3.5 text-cyan-600" />
          <span>IrrigationAgent</span>
        </span>
      );
    case "SoilAgent":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <Sprout className="w-3.5 h-3.5 text-amber-700" />
          <span>SoilAgent</span>
        </span>
      );
    case "CropHealthAgent":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>CropHealthAgent</span>
        </span>
      );
    case "CoordinatorAgent":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold ${sizeClasses}`}>
          <Cpu className="w-3.5 h-3.5 text-emerald-700" />
          <span>CoordinatorAgent</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200 ${sizeClasses}`}>
          <span>{name}</span>
        </span>
      );
  }
}
