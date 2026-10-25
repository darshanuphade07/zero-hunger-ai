import pytest
import asyncio
from app.agents.weather_agent import WeatherAgent
from app.agents.irrigation_agent import IrrigationAgent
from app.agents.soil_agent import SoilAgent
from app.agents.crop_health_agent import CropHealthAgent
from app.agents.coordinator_agent import CoordinatorAgent

@pytest.mark.asyncio
async def test_weather_agent():
    agent = WeatherAgent()
    result = await agent.run({"latitude": 18.5204, "longitude": 73.8567, "location_name": "Pune, Maharashtra"})
    assert "current_temp" in result
    assert "forecast_7days" in result
    assert len(result["forecast_7days"]) > 0
    assert "spraying_conditions" in result

@pytest.mark.asyncio
async def test_irrigation_agent():
    agent = IrrigationAgent()
    # Test moisture below critical threshold
    result = await agent.run({
        "crop_name": "Soybean",
        "growth_stage": "Flowering",
        "soil_moisture_pct": 14.0,  # critical deficit
        "reference_et0_mm": 4.5,
        "effective_rainfall_forecast_mm": 0.0,
        "is_simulated_sensor": True
    })
    assert result["urgency"] == "Critical Irrigation Needed"
    assert result["net_irrigation_needed_mm"] > 0
    assert result["is_simulated_sensor"] is True
    assert "SAFETY NOTICE" in result["equipment_notice"]

@pytest.mark.asyncio
async def test_irrigation_rain_delay():
    agent = IrrigationAgent()
    # Test heavy rain forecast overrides irrigation
    result = await agent.run({
        "crop_name": "Soybean",
        "growth_stage": "Vegetative",
        "soil_moisture_pct": 19.0,
        "reference_et0_mm": 4.5,
        "effective_rainfall_forecast_mm": 25.0,  # Heavy rain
        "is_simulated_sensor": True
    })
    assert result["urgency"] == "Rain Delay Advised"
    assert result["net_irrigation_needed_mm"] == 0.0

@pytest.mark.asyncio
async def test_soil_agent():
    agent = SoilAgent()
    result = await agent.run({
        "crop_name": "Cotton",
        "ph": 7.8,
        "nitrogen": 160.0,
        "phosphorus": 12.0,
        "potassium": 250.0,
        "organic_carbon": 0.50,
        "is_simulated": True
    })
    assert "ph_evaluation" in result
    assert "fertilizer_plan" in result
    assert 0 <= result["soil_fertility_index"] <= 100
    assert result["is_simulated_data"] is True

@pytest.mark.asyncio
async def test_crop_health_demo_mode():
    agent = CropHealthAgent()
    result = await agent.run({
        "crop_name": "Soybean",
        "sample_id": "soybean_rust",
        "demo_mode": True
    })
    assert "Soybean Rust" in result["diagnosis"]
    assert result["mode_used"] == "offline_demo_simulation"
    assert "DEMO SIMULATION MODE" in result["disclaimer"]

@pytest.mark.asyncio
async def test_coordinator_agent():
    agent = CoordinatorAgent()
    result = await agent.run({
        "crop_name": "Soybean",
        "growth_stage": "Vegetative",
        "location_name": "Pune, Maharashtra",
        "soil_moisture_pct": 24.0,
        "is_simulated_sensor": True
    })
    assert 0 <= result["farm_health_score"] <= 100
    assert "WeatherAgent" in result["agents"]
    assert "IrrigationAgent" in result["agents"]
    assert "SoilAgent" in result["agents"]
    assert "CropHealthAgent" in result["agents"]
    assert len(result["cross_domain_insights"]) > 0
