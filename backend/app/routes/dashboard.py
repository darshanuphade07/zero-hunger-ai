from fastapi import APIRouter, Query
from ..agents.coordinator_agent import CoordinatorAgent
from ..data.maharashtra_crops import MAHARASHTRA_LOCATIONS, MAHARASHTRA_CROPS

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
coordinator_agent = CoordinatorAgent()

@router.get("/overview")
async def get_dashboard_overview(
    crop_name: str = Query("Soybean"),
    growth_stage: str = Query("Vegetative"),
    location_name: str = Query("Pune, Maharashtra"),
    lat: float = Query(18.5204),
    lon: float = Query(73.8567),
    soil_moisture: float = Query(24.0),
    is_simulated: bool = Query(True)
):
    """
    Synthesized precision dashboard endpoint.
    Coordinates Weather, Irrigation, Soil, and Crop Health agents.
    """
    result = await coordinator_agent.run({
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "location_name": location_name,
        "latitude": lat,
        "longitude": lon,
        "soil_moisture_pct": soil_moisture,
        "is_simulated_sensor": is_simulated,
        "soil_ph": 7.2,
        "soil_nitrogen": 220.0,
        "soil_phosphorus": 18.0,
        "soil_potassium": 190.0,
        "soil_organic_carbon": 0.58,
        "farm_area_acres": 3.0,
        "demo_mode": True
    })

    return result
