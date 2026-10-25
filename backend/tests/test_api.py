import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AgriSmart" in data["app"]

def test_weather_locations():
    response = client.get("/api/weather/locations")
    assert response.status_code == 200
    data = response.json()
    assert "locations" in data
    assert len(data["locations"]) >= 5

def test_irrigation_crops():
    response = client.get("/api/irrigation/crops")
    assert response.status_code == 200
    data = response.json()
    assert "crops" in data
    assert any(c["name"] == "Soybean" for c in data["crops"])

def test_irrigation_simulated_reading():
    response = client.get("/api/irrigation/simulated-reading?crop_name=Soybean&scenario=dry")
    assert response.status_code == 200
    data = response.json()
    assert data["is_simulated_sensor"] is True
    assert "[SIMULATED SENSOR READING]" in data["sensor_label"]

def test_soil_presets():
    response = client.get("/api/soil/presets")
    assert response.status_code == 200
    data = response.json()
    assert len(data["presets"]) >= 3

def test_crop_health_samples():
    response = client.get("/api/crop-health/samples")
    assert response.status_code == 200
    data = response.json()
    assert len(data["samples"]) >= 4

def test_offline_chat():
    response = client.post("/api/chat", json={
        "message": "How to control pink bollworm in cotton?",
        "crop_context": "Cotton"
    })
    assert response.status_code == 200
    data = response.json()
    assert "Pink Bollworm" in data["reply"]
    assert "offline" in data["mode"] or "gemini" in data["mode"]

def test_history_list():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
