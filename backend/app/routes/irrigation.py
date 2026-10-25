import json
import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..agents.irrigation_agent import IrrigationAgent
from ..agents.weather_agent import WeatherAgent
from ..database import get_db
from ..models import HistoryRecord
from ..schemas import IrrigationRequest, IrrigationResponse
from ..data.maharashtra_crops import MAHARASHTRA_CROPS

router = APIRouter(prefix="/api/irrigation", tags=["Smart Irrigation"])
irrigation_agent = IrrigationAgent()
weather_agent = WeatherAgent()

@router.get("/crops")
def get_supported_crops():
    """List supported crops, growth stages, and Marathi names."""
    crops_summary = []
    for name, data in MAHARASHTRA_CROPS.items():
        crops_summary.append({
            "name": name,
            "marathi_name": data["marathi_name"],
            "season": data["season"],
            "duration_days": data["duration_days"],
            "stages": list(data["kc"].keys()),
            "ideal_moisture": data["soil_moisture_ideal"]
        })
    return {"crops": crops_summary}

@router.get("/simulated-reading")
def get_simulated_moisture(
    crop_name: str = Query("Soybean"),
    scenario: str = Query("dry", description="dry, optimal, or wet")
):
    """
    Returns realistic simulated soil moisture readings.
    Explicitly labeled as SIMULATED to comply with agronomic integrity rules.
    """
    crop = MAHARASHTRA_CROPS.get(crop_name, MAHARASHTRA_CROPS["Soybean"])
    prefs = crop["soil_moisture_ideal"]

    if scenario == "dry":
        val = round(random.uniform(prefs["critical_threshold"] - 3.0, prefs["critical_threshold"] + 1.0), 1)
    elif scenario == "wet":
        val = round(random.uniform(prefs["optimum"] + 5.0, prefs["max"]), 1)
    else:  # optimal
        val = round(random.uniform(prefs["min"] + 2.0, prefs["optimum"] + 2.0), 1)

    val = max(5.0, min(50.0, val))

    return {
        "simulated_soil_moisture_pct": val,
        "is_simulated_sensor": True,
        "sensor_label": "[SIMULATED SENSOR READING]",
        "note": "This value is mathematically simulated for demonstration. No physical capacitance or TDR sensor was queried."
    }

@router.post("/calculate", response_model=IrrigationResponse)
async def calculate_irrigation(
    req: IrrigationRequest,
    save_to_history: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Calculates crop water requirement and irrigation schedule using IrrigationAgent."""
    # Obtain latest ET0 and rain forecast from WeatherAgent
    weather_info = await weather_agent.run({
        "latitude": req.latitude,
        "longitude": req.longitude,
        "location_name": req.location_name
    })

    et0 = weather_info.get("et0_today_mm", 4.5)
    forecast_7d = weather_info.get("forecast_7days", [])
    rain_forecast = forecast_7d[0]["precipitation_mm"] if forecast_7d else 0.0

    result = await irrigation_agent.run({
        "crop_name": req.crop_name,
        "growth_stage": req.growth_stage,
        "soil_moisture_pct": req.soil_moisture_pct,
        "soil_texture": req.soil_texture,
        "farm_area_acres": req.farm_area_acres,
        "irrigation_method": req.irrigation_method,
        "reference_et0_mm": et0,
        "effective_rainfall_forecast_mm": rain_forecast,
        "is_simulated_sensor": req.is_simulated_sensor
    })

    if save_to_history:
        record = HistoryRecord(
            category="irrigation",
            crop_name=req.crop_name,
            location=req.location_name,
            summary=result["action_summary"],
            details_json=json.dumps(result),
            urgency=result["urgency"],
            disclaimer=result["disclaimer"]
        )
        db.add(record)
        db.commit()

    return result
