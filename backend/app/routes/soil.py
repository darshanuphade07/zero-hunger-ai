import json
import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..agents.soil_agent import SoilAgent
from ..database import get_db
from ..models import HistoryRecord
from ..schemas import SoilAnalysisRequest, SoilAnalysisResponse

router = APIRouter(prefix="/api/soil", tags=["Soil Analysis"])
soil_agent = SoilAgent()

SOIL_PRESETS = [
    {
        "id": "black_cotton",
        "name": "Deep Black Cotton Soil (Regur - Vidarbha / Marathwada)",
        "ph": 7.8,
        "nitrogen": 180.0,
        "phosphorus": 14.0,
        "potassium": 290.0,
        "moisture": 26.0,
        "organic_carbon": 0.52,
        "description": "High clay content, rich in calcium and potassium, often deficient in Nitrogen and Zinc."
    },
    {
        "id": "western_loam",
        "name": "Medium Black Loam (Pune / Ahmednagar / Solapur)",
        "ph": 7.2,
        "nitrogen": 240.0,
        "phosphorus": 18.0,
        "potassium": 210.0,
        "moisture": 24.0,
        "organic_carbon": 0.65,
        "description": "Balanced texture, good water retention, suited for Sugarcane, Onion, and Vegetables."
    },
    {
        "id": "nashik_red_gravelly",
        "name": "Red Sandy & Loamy Soil (Nashik / Dhule)",
        "ph": 6.4,
        "nitrogen": 210.0,
        "phosphorus": 22.0,
        "potassium": 160.0,
        "moisture": 20.0,
        "organic_carbon": 0.58,
        "description": "Well-drained soil ideal for Vineyards, Pomegranate, and Onion nurseries."
    },
    {
        "id": "saline_alkaline_pocket",
        "name": "Calcareous / Alkaline Soil (Canal Command Zone)",
        "ph": 8.4,
        "nitrogen": 140.0,
        "phosphorus": 9.0,
        "potassium": 220.0,
        "moisture": 30.0,
        "organic_carbon": 0.38,
        "description": "High salt/carbonate buildup due to excessive flood irrigation; requires gypsum and drainage."
    }
]

@router.get("/presets")
def get_soil_presets():
    """Preset soil profiles commonly found across Maharashtra agro-ecological zones."""
    return {"presets": SOIL_PRESETS}

@router.get("/simulated-reading")
def get_simulated_soil_reading(soil_type: str = Query("black_cotton")):
    """
    Generate realistic simulated laboratory soil test values.
    Explicitly marked as simulated test data.
    """
    preset = next((p for p in SOIL_PRESETS if p["id"] == soil_type), SOIL_PRESETS[0])

    ph = round(preset["ph"] + random.uniform(-0.3, 0.3), 1)
    n = round(preset["nitrogen"] + random.uniform(-25.0, 30.0), 1)
    p = round(preset["phosphorus"] + random.uniform(-3.0, 4.0), 1)
    k = round(preset["potassium"] + random.uniform(-20.0, 25.0), 1)
    oc = round(preset["organic_carbon"] + random.uniform(-0.06, 0.08), 2)
    moisture = round(preset["moisture"] + random.uniform(-4.0, 5.0), 1)

    return {
        "ph": ph,
        "nitrogen": max(50.0, n),
        "phosphorus": max(4.0, p),
        "potassium": max(50.0, k),
        "organic_carbon": max(0.15, oc),
        "moisture": max(10.0, moisture),
        "is_simulated": True,
        "badge_label": "[SIMULATED SOIL TEST DATA]",
        "note": "Values generated synthetically for training and advisory demonstrations. Not from physical laboratory chemistry."
    }

@router.post("/analyze", response_model=SoilAnalysisResponse)
async def analyze_soil(
    req: SoilAnalysisRequest,
    save_to_history: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Evaluates soil chemical parameters and generates fertilizer prescriptions."""
    result = await soil_agent.run({
        "crop_name": req.crop_name,
        "ph": req.ph,
        "nitrogen": req.nitrogen,
        "phosphorus": req.phosphorus,
        "potassium": req.potassium,
        "moisture": req.moisture,
        "organic_carbon": req.organic_carbon,
        "is_simulated": req.is_simulated
    })

    if save_to_history:
        summary_text = (
            f"Fertility Index: {result['soil_fertility_index']}/100 | "
            f"pH: {result['ph_evaluation']['classification']} | "
            f"Key Action: {result['fertilizer_plan'][0] if result['fertilizer_plan'] else 'Balanced nutrition'}"
        )
        record = HistoryRecord(
            category="soil",
            crop_name=req.crop_name,
            location=req.location,
            summary=summary_text,
            details_json=json.dumps(result),
            urgency=result["urgency"],
            disclaimer=result["disclaimer"]
        )
        db.add(record)
        db.commit()

    return result
