import json
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ScanRecord, ScanRequest, ScanResponse, SystemStats, MLAnalysis
from ..detectors.url_detector import analyze_url
from ..detectors.message_detector import analyze_message
from ..detectors.scoring import evaluate_risk
from ..detectors.ml_classifier import predict_ml_threat

router = APIRouter(prefix="/api", tags=["Scanner"])

def detect_type(content: str, specified_type: str) -> str:
    if specified_type in ["url", "message"]:
        return specified_type
    
    clean = content.strip()
    # If no spaces and matches URL structure
    if " " not in clean and (
        clean.startswith(("http://", "https://", "ftp://")) or
        re.match(r"^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(/.*)?$", clean)
    ):
        return "url"
    return "message"

def sanitize_preview(content: str) -> str:
    """Masks potential accidental sensitive tokens in the stored history preview for privacy."""
    text = content.strip().replace("\n", " ")
    # Mask card numbers or 6-digit consecutive OTP-like numbers if entered
    text = re.sub(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b", "[CARD MASKED]", text)
    text = re.sub(r"\b\d{6}\b", "[CODE MASKED]", text)
    if len(text) > 100:
        return text[:97] + "..."
    return text

@router.post("/scan", response_model=ScanResponse)
def scan_content(req: ScanRequest, db: Session = Depends(get_db)):
    content = req.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Input content cannot be empty.")
    if len(content) > 5000:
        raise HTTPException(status_code=400, detail="Input exceeds maximum allowed length of 5000 characters.")

    input_type = detect_type(content, req.input_type)

    if input_type == "url":
        analysis = analyze_url(content)
    else:
        analysis = analyze_message(content)

    indicators = analysis.get("indicators", [])
    detected_patterns = analysis.get("detected_patterns", [])

    # Run ML Model classification in parallel with rule heuristics
    ml_analysis = predict_ml_threat(content)

    # If ML detects high statistical likelihood of fraud and rule engine hasn't caught it yet,
    # add a transparent ML indicator
    if ml_analysis.get("ml_score", 0) >= 70:
        detected_patterns.append("ml_statistical_anomaly")
        indicators.append({
            "name": "Machine Learning Phishing Signature",
            "severity": "high" if ml_analysis["ml_score"] >= 85 else "medium",
            "category": "Deceptive Tactics",
            "description": f"AI statistical classifier identified strong semantic proximity to known scam campaigns (Confidence: {int(ml_analysis['confidence'] * 100)}%).",
            "evidence": f"Top signals: {', '.join(ml_analysis.get('top_features', [])[:3])}" if ml_analysis.get('top_features') else "Semantic structure match"
        })

    risk_level, risk_score, summary, recommendations = evaluate_risk(
        indicators=indicators,
        detected_patterns=detected_patterns,
        input_type=input_type
    )

    preview = sanitize_preview(content)
    now = datetime.utcnow()

    # Save to SQLite database
    record = ScanRecord(
        scan_type=input_type,
        content_preview=preview,
        risk_level=risk_level,
        risk_score=risk_score,
        indicators_json=json.dumps(indicators),
        recommendations_json=json.dumps(recommendations),
        created_at=now
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ScanResponse(
        id=record.id,
        input_type=input_type,
        content_preview=preview,
        risk_level=risk_level,
        risk_score=risk_score,
        summary=summary,
        indicators=indicators,
        recommendations=recommendations,
        detected_patterns=detected_patterns,
        ml_analysis=MLAnalysis(**ml_analysis),
        created_at=now.isoformat()
    )

@router.get("/stats", response_model=SystemStats)
def get_system_stats(db: Session = Depends(get_db)):
    total = db.query(ScanRecord).count()
    high = db.query(ScanRecord).filter(ScanRecord.risk_level == "High").count()
    med = db.query(ScanRecord).filter(ScanRecord.risk_level == "Medium").count()
    low = db.query(ScanRecord).filter(ScanRecord.risk_level == "Low").count()
    url_count = db.query(ScanRecord).filter(ScanRecord.scan_type == "url").count()
    msg_count = db.query(ScanRecord).filter(ScanRecord.scan_type == "message").count()

    return SystemStats(
        total_scans=total,
        high_risk_count=high,
        medium_risk_count=med,
        low_risk_count=low,
        url_scans_count=url_count,
        message_scans_count=msg_count
    )
