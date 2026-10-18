import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import ScanRecord, HistoryItem, Indicator, Recommendation

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=List[HistoryItem])
def get_scan_history(
    risk_level: Optional[str] = Query(None, description="Filter by risk level: High, Medium, Low"),
    scan_type: Optional[str] = Query(None, description="Filter by scan type: url, message"),
    search: Optional[str] = Query(None, description="Search in content preview"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(ScanRecord)
    
    if risk_level:
        query = query.filter(ScanRecord.risk_level.ilike(risk_level))
    if scan_type:
        query = query.filter(ScanRecord.scan_type.ilike(scan_type))
    if search:
        query = query.filter(ScanRecord.content_preview.ilike(f"%{search}%"))

    records = query.order_by(desc(ScanRecord.created_at)).offset(offset).limit(limit).all()

    result = []
    for r in records:
        try:
            indicators_data = json.loads(r.indicators_json) if r.indicators_json else []
            indicators = [Indicator(**i) for i in indicators_data]
        except Exception:
            indicators = []

        try:
            recs_data = json.loads(r.recommendations_json) if r.recommendations_json else []
            recs = [Recommendation(**rec) for rec in recs_data]
        except Exception:
            recs = []

        result.append(HistoryItem(
            id=r.id,
            scan_type=r.scan_type,
            content_preview=r.content_preview,
            risk_level=r.risk_level,
            risk_score=r.risk_score,
            indicators=indicators,
            recommendations=recs,
            created_at=r.created_at.isoformat() if r.created_at else ""
        ))

    return result

@router.delete("/{record_id}")
def delete_scan_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Scan record #{record_id} deleted successfully."}

@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    deleted_count = db.query(ScanRecord).delete()
    db.commit()
    return {"status": "success", "message": f"Cleared {deleted_count} scan records."}
