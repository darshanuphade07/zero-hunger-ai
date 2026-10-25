from typing import Dict, Any
from .base_agent import BaseAgent
from ..data.maharashtra_crops import MAHARASHTRA_CROPS

class IrrigationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="IrrigationAgent",
            description="Calculates crop water requirements, soil moisture deficits, and drip runtime advisories."
        )

    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        crop_name = inputs.get("crop_name", "Soybean")
        growth_stage = inputs.get("growth_stage", "Vegetative")
        soil_moisture = float(inputs.get("soil_moisture_pct", 22.0))
        area_acres = float(inputs.get("farm_area_acres", 2.5))
        irrigation_method = inputs.get("irrigation_method", "Drip Irrigation")
        et0 = float(inputs.get("reference_et0_mm", 4.5))
        rain_forecast_mm = float(inputs.get("effective_rainfall_forecast_mm", 0.0))
        is_simulated = bool(inputs.get("is_simulated_sensor", False))

        # Retrieve crop agronomic parameters
        crop_info = MAHARASHTRA_CROPS.get(crop_name, MAHARASHTRA_CROPS["Soybean"])
        kc_map = crop_info.get("kc", {"Initial": 0.4, "Vegetative": 0.8, "Flowering": 1.15, "Maturity": 0.5})
        kc = kc_map.get(growth_stage, 0.8)

        moisture_prefs = crop_info.get("soil_moisture_ideal", {
            "min": 20.0, "optimum": 28.0, "max": 40.0, "critical_threshold": 18.0
        })
        optimum_moisture = moisture_prefs["optimum"]
        critical_moisture = moisture_prefs["critical_threshold"]

        # Crop evapotranspiration ETc (mm/day)
        etc_mm = round(kc * et0, 2)

        # Effective rainfall deduction (if rain >= 5 mm, 75% is effective for root zone)
        eff_rain = round(rain_forecast_mm * 0.75, 2) if rain_forecast_mm >= 5.0 else 0.0

        # Moisture deficit check
        moisture_deficit_pct = max(0.0, optimum_moisture - soil_moisture)

        # Irrigation depth calculation
        # Rule heuristic: each 1% soil moisture deficit in top 30cm root zone equals approx 1.2 mm depth
        base_irrigation_depth_mm = round(moisture_deficit_pct * 1.2, 2)

        # Combine with daily ETc minus effective rain
        net_irrigation_needed_mm = max(0.0, round(base_irrigation_depth_mm + etc_mm - eff_rain, 2))

        # Determine Urgency & Action Summary
        if eff_rain >= etc_mm or rain_forecast_mm > 15.0:
            urgency = "Rain Delay Advised"
            net_irrigation_needed_mm = 0.0
            action_summary = f"Hold irrigation. Forecasted rainfall ({rain_forecast_mm} mm) satisfies root zone demand."
            reasoning = (
                f"Upcoming precipitation ({rain_forecast_mm} mm) will replenish the crop water requirement ({etc_mm} mm/day). "
                f"Suspending irrigation conserves water, prevents nutrient leaching, and avoids root hypoxia."
            )
        elif soil_moisture <= critical_moisture:
            urgency = "Critical Irrigation Needed"
            action_summary = f"Immediate irrigation recommended: Apply {net_irrigation_needed_mm} mm ({round(net_irrigation_needed_mm * 4047)} L/acre)."
            reasoning = (
                f"Soil moisture ({soil_moisture:.1f}%) is below the critical threshold ({critical_moisture:.1f}%). "
                f"The {growth_stage.lower()} stage has a high crop coefficient (Kc={kc}), making moisture stress detrimental to yield."
            )
        elif soil_moisture < optimum_moisture:
            urgency = "Moderate Irrigation Needed"
            action_summary = f"Apply routine scheduled irrigation: {net_irrigation_needed_mm} mm."
            reasoning = (
                f"Soil moisture ({soil_moisture:.1f}%) is moderate but below optimum ({optimum_moisture:.1f}%). "
                f"Daily ETc is {etc_mm} mm. A moderate irrigation cycle will maintain peak photosynthesis."
            )
        else:
            urgency = "Sufficient - No Action"
            net_irrigation_needed_mm = 0.0
            action_summary = "Soil moisture is in the optimum zone. No irrigation required today."
            reasoning = (
                f"Current soil moisture ({soil_moisture:.1f}%) meets or exceeds optimum ({optimum_moisture:.1f}%). "
                f"Adequate reserve water is available in the root zone."
            )

        # Volume calculations: 1 mm over 1 acre = 4,047 Litres
        litres_per_acre = round(net_irrigation_needed_mm * 4046.86, 1)
        total_volume_litres = round(litres_per_acre * area_acres, 1)

        # Runtime estimation based on method
        # Drip: ~2.5 mm/hr, Sprinkler: ~6.0 mm/hr, Furrow: ~12.0 mm/hr
        rate_mm_per_hr = 2.5 if "Drip" in irrigation_method else (6.0 if "Sprinkler" in irrigation_method else 12.0)
        recommended_duration_min = int((net_irrigation_needed_mm / rate_mm_per_hr) * 60) if net_irrigation_needed_mm > 0 else 0

        return {
            "crop_name": crop_name,
            "growth_stage": growth_stage,
            "crop_coefficient_kc": kc,
            "reference_et0_mm": et0,
            "crop_water_requirement_mm": etc_mm,
            "effective_rainfall_forecast_mm": rain_forecast_mm,
            "net_irrigation_needed_mm": net_irrigation_needed_mm,
            "volume_litres_per_acre": litres_per_acre,
            "total_volume_litres": total_volume_litres,
            "recommended_duration_minutes": recommended_duration_min,
            "urgency": urgency,
            "action_summary": action_summary,
            "reasoning": reasoning,
            "equipment_notice": "SAFETY NOTICE: Advisory only. Does NOT actuate irrigation equipment automatically.",
            "is_simulated_sensor": is_simulated,
            "disclaimer": (
                "Illustrative agronomic model only. Rules & thresholds are educational heuristics "
                "and not validated laboratory agronomic advice. Does not actuate field equipment."
            )
        }
