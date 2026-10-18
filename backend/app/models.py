from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scan_type = Column(String(20), nullable=False)  # "url" or "message"
    content_preview = Column(String(255), nullable=False)
    risk_level = Column(String(20), nullable=False)  # "Low", "Medium", "High"
    risk_score = Column(Integer, nullable=False)    # 0 to 100
    indicators_json = Column(Text, nullable=False)  # JSON string
    recommendations_json = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class Indicator(BaseModel):
    name: str
    severity: str  # "low", "medium", "high"
    category: str  # "URL & Domain", "Urgent Language", "Sensitive Data Request", "Impersonation", "Deceptive Tactics"
    description: str
    evidence: Optional[str] = None

class Recommendation(BaseModel):
    title: str
    action: str
    priority: str  # "critical", "warning", "advisory"

class ScanRequest(BaseModel):
    input_type: str = Field(default="auto", description="'url', 'message', or 'auto'")
    content: str = Field(..., min_length=2, max_length=5000, description="The URL or text message to analyze")

class MLAnalysis(BaseModel):
    ml_score: int
    ml_risk: str
    confidence: float
    top_features: List[str]
    response_time_ms: float
    model_metadata: Dict[str, Any]

class ScanResponse(BaseModel):
    id: Optional[int] = None
    input_type: str
    content_preview: str
    risk_level: str
    risk_score: int
    summary: str
    indicators: List[Indicator]
    recommendations: List[Recommendation]
    detected_patterns: List[str]
    ml_analysis: Optional[MLAnalysis] = None
    created_at: str

class HistoryItem(BaseModel):
    id: int
    scan_type: str
    content_preview: str
    risk_level: str
    risk_score: int
    indicators: List[Indicator]
    recommendations: List[Recommendation]
    created_at: str

class SystemStats(BaseModel):
    total_scans: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    url_scans_count: int
    message_scans_count: int
