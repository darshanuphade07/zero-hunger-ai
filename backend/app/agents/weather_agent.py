import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List
from .base_agent import BaseAgent

# WMO Weather code dictionary
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

class WeatherAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="WeatherAgent",
            description="Fetches live forecast and agricultural agro-meteorology indicators from Open-Meteo."
        )

    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        lat = inputs.get("latitude", 18.5204)
        lon = inputs.get("longitude", 73.8567)
        location_name = inputs.get("location_name", "Pune, Maharashtra")

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                url = (
                    f"https://api.open-meteo.com/v1/forecast?"
                    f"latitude={lat}&longitude={lon}&"
                    f"current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&"
                    f"hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,et0_fao_evapotranspiration&"
                    f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&"
                    f"timezone=auto"
                )
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return self._process_open_meteo_data(data, location_name, lat, lon)
        except Exception:
            # Fallback to simulated agricultural weather for offline or network issues
            pass

        return self._generate_fallback_data(location_name, lat, lon)

    def _process_open_meteo_data(self, data: Dict[str, Any], location_name: str, lat: float, lon: float) -> Dict[str, Any]:
        current = data.get("current", {})
        daily = data.get("daily", {})
        hourly = data.get("hourly", {})

        current_temp = current.get("temperature_2m", 28.5)
        current_humidity = current.get("relative_humidity_2m", 62)
        current_wind = current.get("wind_speed_10m", 9.5)
        current_rain = current.get("precipitation", 0.0)
        wmo_code = current.get("weather_code", 1)
        weather_desc = WMO_CODES.get(wmo_code, "Partly Cloudy")

        # 7-day forecast items
        forecast_7days: List[Dict[str, Any]] = []
        dates = daily.get("time", [])
        t_max = daily.get("temperature_2m_max", [])
        t_min = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])
        rain_prob = daily.get("precipitation_probability_max", [])
        w_codes = daily.get("weather_code", [])
        et0_list = daily.get("et0_fao_evapotranspiration", [])

        for i in range(min(len(dates), 7)):
            d_code = w_codes[i] if i < len(w_codes) else 1
            forecast_7days.append({
                "date": dates[i],
                "temp_max": t_max[i] if i < len(t_max) else 30.0,
                "temp_min": t_min[i] if i < len(t_min) else 19.0,
                "precipitation_mm": precip[i] if i < len(precip) else 0.0,
                "rain_probability_pct": int(rain_prob[i]) if (i < len(rain_prob) and rain_prob[i] is not None) else 15,
                "weather_code": d_code,
                "weather_description": WMO_CODES.get(d_code, "Partly Cloudy"),
                "et0_mm": et0_list[i] if (i < len(et0_list) and et0_list[i] is not None) else 4.2
            })

        # Next 24h hourly forecast preview (every 2 hours)
        hourly_temps: List[Dict[str, Any]] = []
        h_times = hourly.get("time", [])
        h_t = hourly.get("temperature_2m", [])
        h_prob = hourly.get("precipitation_probability", [])
        h_rh = hourly.get("relative_humidity_2m", [])

        for i in range(0, min(len(h_times), 24), 2):
            time_str = h_times[i].split("T")[1][:5] if "T" in h_times[i] else h_times[i]
            hourly_temps.append({
                "time": time_str,
                "temperature": h_t[i] if i < len(h_t) else current_temp,
                "rain_probability": h_prob[i] if (i < len(h_prob) and h_prob[i] is not None) else 10,
                "humidity": h_rh[i] if i < len(h_rh) else current_humidity
            })

        rain_prob_24h = int(forecast_7days[0]["rain_probability_pct"]) if forecast_7days else 15
        et0_today = float(forecast_7days[0]["et0_mm"]) if forecast_7days else 4.5

        # Evaluate spraying suitability
        spraying_status, spraying_advice = self._evaluate_spraying_conditions(
            current_wind, current_humidity, rain_prob_24h, current_rain
        )

        return {
            "location": location_name,
            "latitude": lat,
            "longitude": lon,
            "current_temp": current_temp,
            "current_humidity": current_humidity,
            "current_wind_speed_kmh": current_wind,
            "current_rain_mm": current_rain,
            "current_weather_desc": weather_desc,
            "rain_probability_next_24h": rain_prob_24h,
            "spraying_conditions": spraying_status,
            "spraying_advisory": spraying_advice,
            "et0_today_mm": et0_today,
            "forecast_7days": forecast_7days,
            "hourly_temperatures": hourly_temps,
            "is_live_data": True,
            "disclaimer": "Live data sourced from Open-Meteo."
        }

    def _evaluate_spraying_conditions(self, wind: float, humidity: int, rain_prob: int, current_rain: float) -> tuple:
        if current_rain > 0.2 or rain_prob > 50:
            return "Poor (Rain Risk)", "Avoid spraying agrochemicals; rain wash-off risk is high within 24 hours."
        elif wind > 18.0:
            return "Poor (High Wind Drift)", f"Wind speed ({wind} km/h) exceeds safe threshold (15 km/h). Severe chemical drift hazard."
        elif humidity > 85:
            return "Moderate (High Humidity)", "Foliage drying will be slow; increased risk of fungal wash."
        elif wind < 12.0 and humidity >= 40:
            return "Optimal", "Ideal weather window for crop spraying (calm winds, moderate humidity, low wash-off risk)."
        else:
            return "Moderate", "Suitable for spraying with medium droplet nozzles. Monitor local wind gusts."

    def _generate_fallback_data(self, location_name: str, lat: float, lon: float) -> Dict[str, Any]:
        """Realistic fallback for Maharashtra agro-climate."""
        today = datetime.now()
        forecast_7days = []
        for i in range(7):
            day = today + timedelta(days=i)
            forecast_7days.append({
                "date": day.strftime("%Y-%m-%d"),
                "temp_max": 31.0 + (i % 3) * 0.8,
                "temp_min": 19.5 + (i % 2) * 0.5,
                "precipitation_mm": 0.0 if i != 2 else 4.5,
                "rain_probability_pct": 10 if i != 2 else 65,
                "weather_code": 1 if i != 2 else 61,
                "weather_description": "Partly cloudy" if i != 2 else "Slight rain",
                "et0_mm": 4.6 - (0.8 if i == 2 else 0.0)
            })

        hourly_temps = [
            {"time": "06:00", "temperature": 20.5, "rain_probability": 5, "humidity": 78},
            {"time": "08:00", "temperature": 23.2, "rain_probability": 5, "humidity": 68},
            {"time": "10:00", "temperature": 27.0, "rain_probability": 10, "humidity": 55},
            {"time": "12:00", "temperature": 30.5, "rain_probability": 10, "humidity": 45},
            {"time": "14:00", "temperature": 32.0, "rain_probability": 15, "humidity": 40},
            {"time": "16:00", "temperature": 30.8, "rain_probability": 15, "humidity": 44},
            {"time": "18:00", "temperature": 28.0, "rain_probability": 10, "humidity": 52},
            {"time": "20:00", "temperature": 25.4, "rain_probability": 5, "humidity": 62},
            {"time": "22:00", "temperature": 23.0, "rain_probability": 5, "humidity": 70},
        ]

        return {
            "location": location_name,
            "latitude": lat,
            "longitude": lon,
            "current_temp": 28.5,
            "current_humidity": 58,
            "current_wind_speed_kmh": 8.5,
            "current_rain_mm": 0.0,
            "current_weather_desc": "Mainly clear (Demo Agro-Met)",
            "rain_probability_next_24h": 10,
            "spraying_conditions": "Optimal",
            "spraying_advisory": "Ideal window for foliar sprays (calm wind, moderate humidity).",
            "et0_today_mm": 4.6,
            "forecast_7days": forecast_7days,
            "hourly_temperatures": hourly_temps,
            "is_live_data": False,
            "disclaimer": "Offline illustrative agro-weather estimate."
        }
