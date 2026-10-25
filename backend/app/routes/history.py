import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import HistoryRecord

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("")
def get_history(
    category: Optional[str] = Query(None, description="irrigation, soil, crop_health, coordinated"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve audit history and observations stored in SQLite."""
    query = db.query(HistoryRecord).order_by(HistoryRecord.created_at.desc())
    if category:
        query = query.filter(HistoryRecord.category == category)
    records = query.limit(limit).all()

    formatted = []
    for r in records:
        try:
            details = json.loads(r.details_json)
        except Exception:
            details = {"raw": r.details_json}

        formatted.append({
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "category": r.category,
            "crop_name": r.crop_name,
            "location": r.location,
            "summary": r.summary,
            "details": details,
            "urgency": r.urgency,
            "disclaimer": r.disclaimer
        })
    return {"records": formatted, "count": len(formatted)}

@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a single history entry."""
    rec = db.query(HistoryRecord).filter(HistoryRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(rec)
    db.commit()
    return {"success": True, "deleted_id": record_id}

@router.delete("")
def clear_history(db: Session = Depends(get_db)):
    """Clear all history observations."""
    db.query(HistoryRecord).delete()
    db.commit()
    return {"success": True, "message": "History cleared"}

@router.post("/seed-demo")
def seed_demo_history(db: Session = Depends(get_db)):
    """Prepopulate realistic sample observations for Maharashtra demonstration."""
    existing = db.query(HistoryRecord).count()
    if existing >= 3:
        return {"message": "Demo data already exists", "count": existing}

    now = datetime.utcnow()
    samples = [
        HistoryRecord(
            created_at=now - timedelta(hours=2),
            category="irrigation",
            crop_name="Soybean",
            location="Pune, Maharashtra",
            summary="Moderate Irrigation Needed: Apply 14.2 mm (57,465 L/acre).",
            details_json=json.dumps({
                "crop": "Soybean", "stage": "Vegetative", "moisture": 22.0, "net_mm": 14.2,
                "runtime_minutes": 340, "is_simulated_sensor": True
            }),
            urgency="warning",
            disclaimer="Illustrative advisory. Does not actuate physical equipment."
        ),
        HistoryRecord(
            created_at=now - timedelta(days=1),
            category="soil",
            crop_name="Cotton",
            location="Nagpur, Maharashtra",
            summary="Fertility Index: 76.5/100 | pH: Moderately Alkaline (7.8) | Low Nitrogen (190 kg/ha).",
            details_json=json.dumps({
                "ph": 7.8, "nitrogen": 190.0, "phosphorus": 14.0, "potassium": 280.0,
                "organic_carbon": 0.52, "fertility_index": 76.5, "is_simulated": True
            }),
            urgency="warning",
            disclaimer="Illustrative agronomic model only."
        ),
        HistoryRecord(
            created_at=now - timedelta(days=2),
            category="crop_health",
            crop_name="Soybean",
            location="Pune, Maharashtra",
            summary="[DEMO] Soybean Rust (Phakopsora pachyrhizi) detected with 94% confidence.",
            details_json=json.dumps({
                "diagnosis": "Soybean Rust", "condition_type": "Fungal Disease", "confidence": 0.94,
                "mode": "offline_demo_simulation", "treatment": "Spray Propiconazole 25% EC @ 1ml/L"
            }),
            urgency="warning",
            disclaimer="Demo simulation mode. Verify with local agricultural extension officer."
        ),
        HistoryRecord(
            created_at=now - timedelta(days=3),
            category="coordinated",
            crop_name="Sugarcane",
            location="Kolhapur, Maharashtra",
            summary="Farm Health Score: 88/100 (Excellent). Favorable weather window for grand growth phase.",
            details_json=json.dumps({
                "score": 88, "status": "Excellent", "key_action": "Maintain routine drip fertigation schedule."
            }),
            urgency="optimal",
            disclaimer="Multi-agent precision synthesis."
        )
    ]

    db.add_all(samples)
    db.commit()
    return {"message": "Sample history seeded successfully", "count": len(samples)}
