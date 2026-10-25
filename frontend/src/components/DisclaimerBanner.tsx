import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface DisclaimerBannerProps {
  customText?: string;
  variant?: "warning" | "info";
  className?: string;
}

export default function DisclaimerBanner({
  customText,
  variant = "info",
  className = "",
}: DisclaimerBannerProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={`rounded-lg p-3 text-xs flex items-start space-x-2 border ${
        isWarning
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-emerald-50 border-emerald-200 text-emerald-900"
      } ${className}`}
    >
      {isWarning ? (
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      ) : (
        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 leading-relaxed">
        <span className="font-semibold">Agronomic Advisory Notice: </span>
        {customText ||
          "Rules and thresholds are illustrative agronomic models based on standard ICAR heuristics and do not replace certified soil lab analysis or certified agricultural extension officer advice. Does NOT automatically actuate field irrigation equipment."}
      </div>
    </div>
  );
}
