export interface WeatherOverview {
  location: string;
  latitude: float;
  longitude: float;
  current_temp: number;
  current_humidity: number;
  current_wind_speed_kmh: number;
  current_rain_mm: number;
  current_weather_desc: string;
  rain_probability_next_24h: number;
  spraying_conditions: string;
  spraying_advisory: string;
  et0_today_mm: number;
  forecast_7days: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    precipitation_mm: number;
    rain_probability_pct: number;
    weather_code: number;
    weather_description: string;
    et0_mm: number;
  }>;
  hourly_temperatures: Array<{
    time: string;
    temperature: number;
    rain_probability: number;
    humidity: number;
  }>;
  is_live_data: boolean;
  disclaimer: string;
}

export type float = number;

export interface IrrigationResult {
  crop_name: string;
  growth_stage: string;
  crop_coefficient_kc: number;
  reference_et0_mm: number;
  crop_water_requirement_mm: number;
  effective_rainfall_forecast_mm: number;
  net_irrigation_needed_mm: number;
  volume_litres_per_acre: number;
  total_volume_litres: number;
  recommended_duration_minutes: number;
  urgency: string;
  action_summary: string;
  reasoning: string;
  equipment_notice: string;
  is_simulated_sensor: boolean;
  disclaimer: string;
}

export interface SoilNutrientStatus {
  value: number;
  status: string;
  ideal_range: string;
  recommendation: string;
}

export interface SoilAnalysisResult {
  ph_evaluation: {
    value: number;
    classification: string;
    risk: string;
    amendment: string;
  };
  nutrients: Record<string, SoilNutrientStatus>;
  soil_fertility_index: number;
  fertilizer_plan: string[];
  organic_amendments: string[];
  urgency: string;
  is_simulated_data: boolean;
  disclaimer: string;
}

export interface CropHealthResult {
  crop_name: string;
  diagnosis: string;
  condition_type: string;
  confidence_score: number;
  symptoms: string[];
  organic_treatments: string[];
  chemical_treatments: string[];
  prevention_tips: string[];
  mode_used: string;
  sample_preview_url?: string;
  urgency: string;
  disclaimer: string;
}

export interface AgentContribution {
  agent_name: string;
  status: string;
  summary: string;
  urgency: string;
  key_metrics: Record<string, any>;
}

export interface DashboardOverview {
  farm_health_score: number;
  overall_status: string;
  primary_action: string;
  cross_domain_insights: string[];
  agents: Record<string, AgentContribution>;
  synthesized_explanation: string;
  weather_details: WeatherOverview;
  irrigation_details: IrrigationResult;
  soil_details: SoilAnalysisResult;
  crop_health_details: CropHealthResult;
  is_simulated_sensor: boolean;
  disclaimer: string;
}

export interface HistoryItem {
  id: number;
  created_at: string;
  category: string;
  crop_name: string;
  location: string;
  summary: string;
  details: Record<string, any>;
  urgency: string;
  disclaimer: string;
}
