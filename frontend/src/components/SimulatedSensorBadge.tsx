import React from "react";
import { Cpu } from "lucide-react";

interface SimulatedSensorBadgeProps {
  label?: string;
  className?: string;
}

export default function SimulatedSensorBadge({
  label = "SIMULATED SENSOR DATA",
  className = "",
}: SimulatedSensorBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${className}`}
      title="This reading is synthetically generated for demonstration. Never presented as real physical hardware data."
    >
      <Cpu className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
      <span>[{label}]</span>
    </span>
  );
}
