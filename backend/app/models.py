from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from .database import Base

class HistoryRecord(Base):
    __tablename__ = "history_records"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String, index=True)  # "irrigation", "soil", "crop_health", "coordinated"
    crop_name = Column(String, default="General")
    location = Column(String, default="Pune, Maharashtra")
    summary = Column(String, nullable=False)
    details_json = Column(Text, nullable=False)  # JSON payload
    urgency = Column(String, default="normal")   # "optimal", "advisory", "warning", "critical"
    disclaimer = Column(String, default="Illustrative advisory only. Not validated agronomic advice.")

class FarmerChatLog(Base):
    __tablename__ = "farmer_chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    mode = Column(String, default="offline_demo")  # "gemini" or "offline_demo"

class FarmProfile(Base):
    __tablename__ = "farm_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_name = Column(String, default="Pune, Maharashtra")
    latitude = Column(Float, default=18.5204)
    longitude = Column(Float, default=73.8567)
    primary_crop = Column(String, default="Soybean")
    soil_type = Column(String, default="Black Cotton Soil")
    area_acres = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)
