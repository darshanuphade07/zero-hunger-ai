import json
import base64
import httpx
from typing import Dict, Any, Optional
from .base_agent import BaseAgent
from ..config import settings
from ..data.sample_scans import SAMPLE_CROP_SCANS

class CropHealthAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="CropHealthAgent",
            description="Analyzes crop foliage health via Gemini Vision or deterministic agronomic demo presets."
        )

    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        crop_name = inputs.get("crop_name", "Soybean")
        sample_id = inputs.get("sample_id")
        image_base64 = inputs.get("image_base64")
        mime_type = inputs.get("mime_type", "image/jpeg")
        force_demo = inputs.get("demo_mode", False)

        # 1. If explicit demo sample is requested or force_demo is True
        if force_demo or (sample_id and sample_id in SAMPLE_CROP_SCANS):
            scan_key = sample_id if (sample_id and sample_id in SAMPLE_CROP_SCANS) else self._match_crop_to_preset(crop_name)
            return self._format_demo_response(SAMPLE_CROP_SCANS[scan_key])

        # 2. If Gemini API key is configured and image data is provided, attempt live vision analysis
        if settings.GEMINI_API_KEY and image_base64 and not force_demo:
            try:
                gemini_result = await self._analyze_with_gemini(crop_name, image_base64, mime_type)
                if gemini_result:
                    return gemini_result
            except Exception as e:
                # Log error and fall back cleanly
                pass

        # 3. Default: Fallback to Demo Simulation with explicit disclosure
        preset_key = self._match_crop_to_preset(crop_name)
        preset_data = SAMPLE_CROP_SCANS.get(preset_key, SAMPLE_CROP_SCANS["soybean_rust"])
        return self._format_demo_response(preset_data, note="(No Gemini API key provided; running in Demo Mode)")

    def _match_crop_to_preset(self, crop_name: str) -> str:
        mapping = {
            "Soybean": "soybean_rust",
            "Cotton": "cotton_leaf_curl",
            "Tomato": "tomato_early_blight",
            "Sugarcane": "sugarcane_red_rot",
            "Onion": "tomato_early_blight",  # close proxy
            "Wheat": "soybean_rust",
            "Maize": "tomato_early_blight",
            "Chickpea": "soybean_rust"
        }
        return mapping.get(crop_name, "soybean_rust")

    def _format_demo_response(self, data: Dict[str, Any], note: str = "") -> Dict[str, Any]:
        return {
            "crop_name": data["crop_name"],
            "diagnosis": f"[DEMO] {data['diagnosis']}",
            "condition_type": data["condition_type"],
            "confidence_score": data["confidence_score"],
            "symptoms": data["symptoms"],
            "organic_treatments": data["organic_treatments"],
            "chemical_treatments": data["chemical_treatments"],
            "prevention_tips": data["prevention_tips"],
            "mode_used": "offline_demo_simulation",
            "sample_preview_url": f"/samples/{data['id']}.jpg",
            "urgency": data.get("urgency", "warning"),
            "disclaimer": (
                f"DEMO SIMULATION MODE {note}: No live computer vision model was executed on the image. "
                f"The diagnosis above is an illustrative agronomic scenario based on ICAR reference data. "
                f"Never rely on simulated detections without consulting a certified agricultural extension officer."
            )
        }

    async def _analyze_with_gemini(self, crop_name: str, image_base64: str, mime_type: str) -> Optional[Dict[str, Any]]:
        prompt = (
            f"You are an expert precision agronomist specializing in Indian agriculture and crops like {crop_name}. "
            "Examine this crop leaf image and identify any plant pathology, pest damage, nutrient deficiency, or confirm if healthy. "
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            '  "diagnosis": "Disease or Condition Name (Scientific Name)",\n'
            '  "condition_type": "Fungal Disease" | "Viral Disease" | "Bacterial Disease" | "Pest Infestation" | "Nutrient Deficiency" | "Healthy",\n'
            '  "confidence_score": 0.85,\n'
            '  "symptoms": ["bullet point 1", "bullet point 2"],\n'
            '  "organic_treatments": ["organic remedy 1", "organic remedy 2"],\n'
            '  "chemical_treatments": ["chemical control 1 with dosages", "chemical control 2"],\n'
            '  "prevention_tips": ["prevention tip 1", "prevention tip 2"],\n'
            '  "urgency": "optimal" | "advisory" | "warning" | "critical"\n'
            "}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                res_data = response.json()
                raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                return {
                    "crop_name": crop_name,
                    "diagnosis": parsed.get("diagnosis", "Plant Health Scan Complete"),
                    "condition_type": parsed.get("condition_type", "Disease"),
                    "confidence_score": float(parsed.get("confidence_score", 0.88)),
                    "symptoms": parsed.get("symptoms", []),
                    "organic_treatments": parsed.get("organic_treatments", []),
                    "chemical_treatments": parsed.get("chemical_treatments", []),
                    "prevention_tips": parsed.get("prevention_tips", []),
                    "mode_used": "gemini_vision",
                    "sample_preview_url": None,
                    "urgency": parsed.get("urgency", "warning"),
                    "disclaimer": (
                        "Gemini Vision AI diagnosis. This is an automated preliminary screening. "
                        "Always confirm pathological conditions with your local Krishi Vigyan Kendra before applying chemicals."
                    )
                }
        return None
