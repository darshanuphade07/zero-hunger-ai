from fastapi import APIRouter, Query
from ..agents.weather_agent import WeatherAgent
from ..data.maharashtra_crops import MAHARASHTRA_LOCATIONS
from ..schemas import WeatherOverviewResponse

router = APIRouter(prefix="/api/weather", tags=["Weather"])
weather_agent = WeatherAgent()

@router.get("/locations")
def get_locations():
    """Get curated agricultural locations in Maharashtra and default coordinates."""
    return {"locations": MAHARASHTRA_LOCATIONS}

@router.get("/forecast", response_model=WeatherOverviewResponse)
async def get_forecast(
    lat: float = Query(18.5204, description="Latitude"),
    lon: float = Query(73.8567, description="Longitude"),
    location_name: str = Query("Pune, Maharashtra", description="City / Region name")
):
    """Retrieve live Open-Meteo forecasts and agro-meteorological advisories."""
    result = await weather_agent.run({
        "latitude": lat,
        "longitude": lon,
        "location_name": location_name
    })
    return result
