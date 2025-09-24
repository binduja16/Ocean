# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
# models.py
from database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    weather = Column(String)
    sst = Column(Float)
    advice = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
