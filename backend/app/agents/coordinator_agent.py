from typing import Dict, Any, List
from .base_agent import BaseAgent
from .weather_agent import WeatherAgent
from .irrigation_agent import IrrigationAgent
from .soil_agent import SoilAgent
from .crop_health_agent import CropHealthAgent

class CoordinatorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="CoordinatorAgent",
            description="Synthesizes observations across Weather, Irrigation, Soil, and Crop Health agents to produce cohesive farm advisories."
        )
        self.weather_agent = WeatherAgent()
        self.irrigation_agent = IrrigationAgent()
        self.soil_agent = SoilAgent()
        self.crop_health_agent = CropHealthAgent()

    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        crop_name = inputs.get("crop_name", "Soybean")
        growth_stage = inputs.get("growth_stage", "Vegetative")
        location_name = inputs.get("location_name", "Pune, Maharashtra")
        lat = float(inputs.get("latitude", 18.5204))
        lon = float(inputs.get("longitude", 73.8567))
        moisture = float(inputs.get("soil_moisture_pct", 24.0))
        is_simulated = bool(inputs.get("is_simulated_sensor", True))

        # 1. Run WeatherAgent
        weather_out = await self.weather_agent.run({
            "latitude": lat,
            "longitude": lon,
            "location_name": location_name
        })

        # 2. Run IrrigationAgent (supplying weather outputs)
        rain_24h = weather_out.get("current_rain_mm", 0.0)
        forecast_7d = weather_out.get("forecast_7days", [])
        upcoming_rain = forecast_7d[0]["precipitation_mm"] if forecast_7d else 0.0
        et0 = weather_out.get("et0_today_mm", 4.5)

        irrigation_out = await self.irrigation_agent.run({
            "crop_name": crop_name,
            "growth_stage": growth_stage,
            "soil_moisture_pct": moisture,
            "reference_et0_mm": et0,
            "effective_rainfall_forecast_mm": upcoming_rain,
            "is_simulated_sensor": is_simulated,
            "farm_area_acres": inputs.get("farm_area_acres", 2.5),
            "irrigation_method": inputs.get("irrigation_method", "Drip Irrigation")
        })

        # 3. Run SoilAgent
        soil_out = await self.soil_agent.run({
            "crop_name": crop_name,
            "ph": inputs.get("soil_ph", 6.8),
            "nitrogen": inputs.get("soil_nitrogen", 220.0),
            "phosphorus": inputs.get("soil_phosphorus", 18.0),
            "potassium": inputs.get("soil_potassium", 190.0),
            "organic_carbon": inputs.get("soil_organic_carbon", 0.55),
            "moisture": moisture,
            "is_simulated": is_simulated
        })

        # 4. Run CropHealthAgent
        health_out = await self.crop_health_agent.run({
            "crop_name": crop_name,
            "sample_id": inputs.get("sample_id", "healthy_crop" if moisture > 20 else "soybean_rust"),
            "demo_mode": inputs.get("demo_mode", True)
        })

        # 5. Synthesize Cross-Domain Insights & Compute Overall Farm Health Score
        insights, primary_action, health_score, status = self._synthesize(
            weather_out, irrigation_out, soil_out, health_out, crop_name, growth_stage
        )

        agent_contributions = {
            "WeatherAgent": {
                "agent_name": "WeatherAgent",
                "status": weather_out.get("spraying_conditions", "Normal"),
                "summary": f"{weather_out.get('current_temp')}°C, {weather_out.get('current_weather_desc')}, {weather_out.get('rain_probability_next_24h')}% rain risk.",
                "urgency": "warning" if weather_out.get("rain_probability_next_24h", 0) > 60 else "normal",
                "key_metrics": {
                    "temperature_c": weather_out.get("current_temp"),
                    "humidity_pct": weather_out.get("current_humidity"),
                    "et0_mm": weather_out.get("et0_today_mm")
                }
            },
            "IrrigationAgent": {
                "agent_name": "IrrigationAgent",
                "status": irrigation_out.get("urgency"),
                "summary": irrigation_out.get("action_summary"),
                "urgency": "critical" if "Critical" in irrigation_out.get("urgency", "") else ("warning" if "Moderate" in irrigation_out.get("urgency", "") else "optimal"),
                "key_metrics": {
                    "net_needed_mm": irrigation_out.get("net_irrigation_needed_mm"),
                    "runtime_min": irrigation_out.get("recommended_duration_minutes"),
                    "is_simulated_sensor": is_simulated
                }
            },
            "SoilAgent": {
                "agent_name": "SoilAgent",
                "status": soil_out.get("urgency"),
                "summary": f"Fertility Index: {soil_out.get('soil_fertility_index')}/100. pH: {soil_out.get('ph_evaluation', {}).get('classification')}.",
                "urgency": soil_out.get("urgency"),
                "key_metrics": {
                    "fertility_index": soil_out.get("soil_fertility_index"),
                    "ph": soil_out.get("ph_evaluation", {}).get("value")
                }
            },
            "CropHealthAgent": {
                "agent_name": "CropHealthAgent",
                "status": health_out.get("condition_type"),
                "summary": f"{health_out.get('diagnosis')} (Mode: {health_out.get('mode_used')})",
                "urgency": health_out.get("urgency", "normal"),
                "key_metrics": {
                    "confidence": health_out.get("confidence_score"),
                    "condition_type": health_out.get("condition_type")
                }
            }
        }

        synthesized_explanation = self._build_natural_language_explanation(
            crop_name, growth_stage, primary_action, insights, agent_contributions, is_simulated
        )

        return {
            "farm_health_score": health_score,
            "overall_status": status,
            "primary_action": primary_action,
            "cross_domain_insights": insights,
            "agents": agent_contributions,
            "synthesized_explanation": synthesized_explanation,
            "weather_details": weather_out,
            "irrigation_details": irrigation_out,
            "soil_details": soil_out,
            "crop_health_details": health_out,
            "is_simulated_sensor": is_simulated,
            "disclaimer": (
                "Illustrative multi-agent precision advisory. Individual models provide automated heuristics. "
                "Always verify in-field agronomic realities before taking chemical or operational action."
            )
        }

    def _synthesize(
        self,
        weather: Dict[str, Any],
        irrigation: Dict[str, Any],
        soil: Dict[str, Any],
        health: Dict[str, Any],
        crop_name: str,
        stage: str
    ) -> tuple:
        insights: List[str] = []

        # 1. Weather + Irrigation synergy
        rain_prob = weather.get("rain_probability_next_24h", 0)
        net_water = irrigation.get("net_irrigation_needed_mm", 0.0)

        if rain_prob > 60:
            insights.append(
                f"[Weather + Irrigation] High rain likelihood ({rain_prob}%) detected. IrrigationAgent has overridden pump schedule to conserve water and prevent root waterlogging."
            )
        elif net_water > 10.0 and weather.get("current_temp", 25) > 33:
            insights.append(
                f"[Weather + Irrigation] High ambient temperature ({weather.get('current_temp')}°C) elevates daily evapotranspiration (ETc={irrigation.get('crop_water_requirement_mm')} mm). Irrigate in early morning or evening to minimize evaporative losses."
            )

        # 2. Weather + Crop Health synergy (Fungal risk)
        humidity = weather.get("current_humidity", 50)
        temp = weather.get("current_temp", 25)
        if humidity > 75 and 22 <= temp <= 32:
            insights.append(
                f"[Weather + Crop Health] Warm temperatures ({temp}°C) paired with high humidity ({humidity}%) create peak conditions for foliar fungal pathogens (e.g., Rust, Blight). Avoid overhead irrigation; apply preventive bio-fungicide (Trichoderma) early."
            )

        # 3. Soil + Crop Health synergy
        ph_val = soil.get("ph_evaluation", {}).get("value", 7.0)
        if ph_val > 8.0:
            insights.append(
                f"[Soil + Nutrition] Alkaline soil pH ({ph_val}) limits availability of micro-elements (Iron, Zinc). Even if soil NPK is adequate, monitor crop canopy for chlorotic yellowing."
            )

        # 4. Spraying suitability advisory
        if weather.get("spraying_conditions") == "Optimal":
            insights.append(
                "[Weather Advisory] Current spraying window is OPTIMAL (calm wind & no immediate rain). Ideal time for planned nutritional or protective foliar applications."
            )
        else:
            insights.append(
                f"[Weather Advisory] Spraying conditions are currently {weather.get('spraying_conditions')}: {weather.get('spraying_advisory')}"
            )

        # Compute Score
        soil_score = soil.get("soil_fertility_index", 75)
        irr_score = 100 if "Sufficient" in irrigation.get("urgency", "") or "Rain Delay" in irrigation.get("urgency", "") else (70 if "Moderate" in irrigation.get("urgency", "") else 40)
        health_score_comp = 95 if health.get("condition_type") == "Healthy" else (65 if "warning" in health.get("urgency", "") else 45)
        weather_score = 90 if weather.get("spraying_conditions") == "Optimal" else 75

        composite_score = int(soil_score * 0.35 + irr_score * 0.30 + health_score_comp * 0.25 + weather_score * 0.10)
        composite_score = max(20, min(100, composite_score))

        if composite_score >= 85:
            status = "Excellent"
            primary_action = f"Maintain routine monitoring. Crop {crop_name} is thriving in its {stage.lower()} phase."
        elif composite_score >= 70:
            status = "Good"
            primary_action = irrigation.get("action_summary", "Perform standard agronomic care.")
        elif composite_score >= 50:
            status = "Attention Required"
            primary_action = f"Address moisture deficit or nutrient imbalances: {irrigation.get('action_summary')}"
        else:
            status = "Critical Intervention Needed"
            primary_action = f"Immediate action required: {health.get('diagnosis')} treatment and soil replenishment."

        return insights, primary_action, composite_score, status

    def _build_natural_language_explanation(
        self,
        crop: str,
        stage: str,
        action: str,
        insights: List[str],
        agents: Dict[str, Any],
        is_simulated: bool
    ) -> str:
        sensor_note = " (using simulated sensor readings for demonstration)" if is_simulated else ""
        text = (
            f"Coordinator Agent Assessment for {crop} ({stage} Stage){sensor_note}:\n\n"
            f"1. Priority Directive: {action}\n\n"
            f"2. Multi-Agent Synthesis:\n"
            f"- WeatherAgent reports {agents['WeatherAgent']['summary']}\n"
            f"- IrrigationAgent recommends {agents['IrrigationAgent']['summary']}\n"
            f"- SoilAgent indicates {agents['SoilAgent']['summary']}\n"
            f"- CropHealthAgent diagnosed {agents['CropHealthAgent']['summary']}\n\n"
            f"3. Key Agronomic Insights:\n" + "\n".join([f"• {item}" for item in insights])
        )
        return text
