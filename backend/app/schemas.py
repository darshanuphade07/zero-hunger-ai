from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Base Disclaimer
DEFAULT_DISCLAIMER = (
    "Illustrative agronomic model only. Rules & thresholds are educational and not validated "
    "laboratory agronomic advice. Does not actuate field equipment."
)

# Soil Schemas
class SoilAnalysisRequest(BaseModel):
    crop_name: str = Field(default="Soybean", description="Target crop")
    location: str = Field(default="Pune, Maharashtra")
    ph: float = Field(default=6.8, ge=3.0, le=11.0, description="Soil pH level (3.0 - 11.0)")
    nitrogen: float = Field(default=220.0, ge=0.0, le=1000.0, description="Nitrogen (kg/ha)")
    phosphorus: float = Field(default=18.0, ge=0.0, le=300.0, description="Available P (kg/ha)")
    potassium: float = Field(default=190.0, ge=0.0, le=1000.0, description="Available K (kg/ha)")
    moisture: float = Field(default=24.0, ge=0.0, le=100.0, description="Soil moisture %")
    organic_carbon: float = Field(default=0.55, ge=0.0, le=5.0, description="Organic Carbon %")
    is_simulated: bool = Field(default=False, description="Flag indicating if inputs are simulated")

class NutrientStatus(BaseModel):
    value: float
    status: str  # Deficient, Low, Optimal, High, Excess
    ideal_range: str
    recommendation: str

class SoilAnalysisResponse(BaseModel):
    ph_evaluation: Dict[str, Any]
    nutrients: Dict[str, NutrientStatus]
    soil_fertility_index: float  # 0 to 100
    fertilizer_plan: List[str]
    organic_amendments: List[str]
    urgency: str
    is_simulated_data: bool
    disclaimer: str = DEFAULT_DISCLAIMER

# Irrigation Schemas
class IrrigationRequest(BaseModel):
    crop_name: str = Field(default="Soybean")
    growth_stage: str = Field(default="Vegetative", description="Initial, Vegetative, Flowering, Maturity")
    soil_moisture_pct: float = Field(default=22.0, ge=0.0, le=100.0, description="Current soil moisture %")
    soil_texture: str = Field(default="Black Cotton Soil (Clay Loam)")
    farm_area_acres: float = Field(default=2.5, gt=0)
    irrigation_method: str = Field(default="Drip Irrigation", description="Drip, Sprinkler, Furrow")
    latitude: float = Field(default=18.5204)
    longitude: float = Field(default=73.8567)
    location_name: str = Field(default="Pune, Maharashtra")
    is_simulated_sensor: bool = Field(default=False)

class IrrigationResponse(BaseModel):
    crop_name: str
    growth_stage: str
    crop_coefficient_kc: float
    reference_et0_mm: float
    crop_water_requirement_mm: float
    effective_rainfall_forecast_mm: float
    net_irrigation_needed_mm: float
    volume_litres_per_acre: float
    total_volume_litres: float
    recommended_duration_minutes: int
    urgency: str  # "Sufficient - No Action", "Moderate Irrigation Needed", "Critical Irrigation Needed", "Rain Delay Advised"
    action_summary: str
    reasoning: str
    equipment_notice: str = "SAFETY NOTICE: Advisory only. Does NOT actuate irrigation equipment automatically."
    is_simulated_sensor: bool
    disclaimer: str = DEFAULT_DISCLAIMER

# Crop Health Schemas
class CropHealthRequest(BaseModel):
    crop_name: str = Field(default="Soybean")
    sample_id: Optional[str] = None
    demo_mode: bool = Field(default=False)

class CropHealthResponse(BaseModel):
    crop_name: str
    diagnosis: str
    condition_type: str  # Disease, Pest, Nutrient Deficiency, Healthy
    confidence_score: float  # e.g. 0.92
    symptoms: List[str]
    organic_treatments: List[str]
    chemical_treatments: List[str]
    prevention_tips: List[str]
    mode_used: str  # "gemini_vision" or "offline_demo_simulation"
    sample_preview_url: Optional[str] = None
    urgency: str
    disclaimer: str = "Illustrative educational diagnosis only. Verify with certified local Krishi Vigyan Kendra / agricultural officer."

# Weather Schemas
class WeatherLocationQuery(BaseModel):
    city_name: Optional[str] = "Pune, Maharashtra"
    latitude: float = 18.5204
    longitude: float = 73.8567

class DailyForecastItem(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    precipitation_mm: float
    rain_probability_pct: int
    weather_code: int
    weather_description: str
    et0_mm: float

class WeatherOverviewResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current_temp: float
    current_humidity: int
    current_wind_speed_kmh: float
    current_rain_mm: float
    current_weather_desc: str
    rain_probability_next_24h: int
    spraying_conditions: str
    spraying_advisory: str
    et0_today_mm: float
    forecast_7days: List[DailyForecastItem]
    hourly_temperatures: List[Dict[str, Any]]
    disclaimer: str = "Live data sourced from Open-Meteo."

# Chatbot Schemas
class ChatMessage(BaseModel):
    message: str
    crop_context: Optional[str] = "Soybean"
    location_context: Optional[str] = "Pune, Maharashtra"

class ChatResponse(BaseModel):
    reply: str
    mode: str  # "gemini" or "offline_demo"
    source_notes: str
    suggested_followups: List[str]

# Coordinated Agent Schemas
class CoordinatedAdvisoryRequest(BaseModel):
    crop_name: str = "Soybean"
    growth_stage: str = "Vegetative"
    location_name: str = "Pune, Maharashtra"
    latitude: float = 18.5204
    longitude: float = 73.8567
    soil_moisture_pct: float = 24.0
    soil_ph: float = 6.8
    soil_nitrogen: float = 220.0
    soil_phosphorus: float = 18.0
    soil_potassium: float = 190.0
    is_simulated_sensor: bool = True

class AgentContribution(BaseModel):
    agent_name: str
    status: str
    summary: str
    urgency: str
    key_metrics: Dict[str, Any]

class CoordinatedAdvisoryResponse(BaseModel):
    farm_health_score: int  # 0 to 100
    overall_status: str     # Excellent, Good, Attention Required, Critical
    primary_action: str
    cross_domain_insights: List[str]
    agents: Dict[str, AgentContribution]
    synthesized_explanation: str
    disclaimer: str = DEFAULT_DISCLAIMER

# History Schema
class HistoryItemResponse(BaseModel):
    id: int
    created_at: datetime
    category: str
    crop_name: str
    location: str
    summary: str
    details: Dict[str, Any]
    urgency: str
    disclaimer: str
