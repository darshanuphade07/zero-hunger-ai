import base64
import json
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..agents.crop_health_agent import CropHealthAgent
from ..database import get_db
from ..models import HistoryRecord
from ..schemas import CropHealthRequest, CropHealthResponse
from ..data.sample_scans import SAMPLE_CROP_SCANS
from ..config import settings

router = APIRouter(prefix="/api/crop-health", tags=["Crop Health"])
health_agent = CropHealthAgent()

@router.get("/samples")
def get_sample_scans():
    """Return available preset leaf diagnostic samples for immediate demo exploration."""
    samples = []
    for k, v in SAMPLE_CROP_SCANS.items():
        samples.append({
            "id": k,
            "crop_name": v["crop_name"],
            "diagnosis": v["diagnosis"],
            "condition_type": v["condition_type"],
            "preview_description": f"{v['crop_name']} showing {v['diagnosis']}"
        })
    return {
        "samples": samples,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }

@router.post("/analyze-sample", response_model=CropHealthResponse)
async def analyze_sample(
    req: CropHealthRequest,
    save_to_history: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Analyze crop health using a selected demo sample or simulation preset."""
    result = await health_agent.run({
        "crop_name": req.crop_name,
        "sample_id": req.sample_id,
        "demo_mode": req.demo_mode
    })

    if save_to_history:
        record = HistoryRecord(
            category="crop_health",
            crop_name=req.crop_name,
            location="Maharashtra Farm",
            summary=f"{result['diagnosis']} ({result['condition_type']}) - Confidence: {int(result['confidence_score']*100)}%",
            details_json=json.dumps(result),
            urgency=result["urgency"],
            disclaimer=result["disclaimer"]
        )
        db.add(record)
        db.commit()

    return result

@router.post("/analyze-upload", response_model=CropHealthResponse)
async def analyze_upload(
    file: UploadFile = File(...),
    crop_name: str = Form("Soybean"),
    demo_mode: bool = Form(False),
    save_to_history: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Upload a leaf photo for vision analysis.
    If GEMINI_API_KEY is configured on the backend, runs Gemini Vision AI.
    Otherwise, automatically executes clearly labeled Demo Simulation Mode.
    """
    image_bytes = await file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    content_type = file.content_type or "image/jpeg"

    result = await health_agent.run({
        "crop_name": crop_name,
        "image_base64": image_b64,
        "mime_type": content_type,
        "demo_mode": demo_mode
    })

    if save_to_history:
        record = HistoryRecord(
            category="crop_health",
            crop_name=crop_name,
            location="Field Camera Upload",
            summary=f"{result['diagnosis']} ({result['condition_type']}) [Mode: {result['mode_used']}]",
            details_json=json.dumps(result),
            urgency=result["urgency"],
            disclaimer=result["disclaimer"]
        )
        db.add(record)
        db.commit()

    return result
