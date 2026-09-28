import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.database.session import get_db
from app.models.models import Appointment, Prediction, Alert, Notification, AuditLog, Department, Patient
from app.schemas.schemas import (
    PredictionRequest,
    PredictionResponse,
    AppointmentResponse,
    AlertResponse,
    AlertActionRequest,
    NotificationResponse,
    DashboardStatsResponse,
    AuditLogResponse,
    DepartmentSummary
)
from app.services.hospital_service import (
    predict_and_store_appointment,
    handle_alert_action,
    send_mock_reminder,
    log_audit_event
)
from app.services.analytics import get_dashboard_analytics

router = APIRouter(prefix="/api")

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Provides high-level command center KPIs, charts, and operational insights."""
    try:
        return get_dashboard_analytics(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard analytics: {str(e)}")

@router.post("/predict", response_model=PredictionResponse)
def predict_appointment(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header("Hospital Staff")
):
    """
    Core AI/Rule-based prediction endpoint.
    Performs validation, scoring, explanation, alert generation, and persistence.
    """
    try:
        return predict_and_store_appointment(db, request, current_user=x_user_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/appointments")
def list_appointments(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    sort_by: str = "date_desc",
    db: Session = Depends(get_db)
):
    """List appointments with filtering, search, sorting, and pagination."""
    query = db.query(Appointment)

    if status and status != "All":
        query = query.filter(Appointment.status == status)

    if department and department != "All":
        query = query.filter(Appointment.department == department)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Appointment.id.ilike(search_fmt),
                Appointment.patient_id.ilike(search_fmt),
                Appointment.department.ilike(search_fmt),
                Appointment.appointment_type.ilike(search_fmt)
            )
        )

    # Risk level filtering via joined Prediction
    if risk_level and risk_level != "All":
        query = query.join(Prediction, Appointment.id == Prediction.appointment_id).filter(
            Prediction.risk_level == risk_level.lower()
        )

    # Sort
    if sort_by == "date_asc":
        query = query.order_by(Appointment.appointment_date.asc())
    elif sort_by == "date_desc":
        query = query.order_by(Appointment.appointment_date.desc())
    else:
        query = query.order_by(Appointment.appointment_date.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    results = []
    for apt in items:
        pred = apt.prediction
        factors = []
        if pred and pred.risk_factors:
            try:
                factors = json.loads(pred.risk_factors)
            except Exception:
                factors = []

        patient = apt.patient
        results.append({
            "id": apt.id,
            "patient_id": apt.patient_id,
            "patient_name": patient.full_name if patient else f"Patient {apt.patient_id}",
            "age": patient.age if patient else 45,
            "department": apt.department,
            "appointment_type": apt.appointment_type,
            "scheduled_date": apt.scheduled_date,
            "appointment_date": apt.appointment_date,
            "status": apt.status,
            "sms_sent": apt.sms_sent,
            "sms_confirmed": apt.sms_confirmed,
            "distance_km": apt.distance_km,
            "waiting_time_minutes": apt.waiting_time_minutes,
            "days_since_previous_visit": apt.days_since_previous_visit,
            "no_show_probability": pred.no_show_probability if pred else 15.0,
            "risk_level": pred.risk_level if pred else "low",
            "confidence": pred.confidence if pred else 85.0,
            "explanation": pred.explanation if pred else "Standard low risk profile.",
            "recommendation": pred.recommendation if pred else "Send standard reminder.",
            "risk_factors": factors
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": results
    }

@router.get("/appointments/{id}")
def get_appointment(id: str, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    pred = apt.prediction
    factors = []
    if pred and pred.risk_factors:
        try:
            factors = json.loads(pred.risk_factors)
        except Exception:
            pass

    return {
        "id": apt.id,
        "patient_id": apt.patient_id,
        "patient_name": apt.patient.full_name if apt.patient else f"Patient {apt.patient_id}",
        "department": apt.department,
        "appointment_type": apt.appointment_type,
        "scheduled_date": apt.scheduled_date,
        "appointment_date": apt.appointment_date,
        "status": apt.status,
        "sms_sent": apt.sms_sent,
        "sms_confirmed": apt.sms_confirmed,
        "distance_km": apt.distance_km,
        "waiting_time_minutes": apt.waiting_time_minutes,
        "days_since_previous_visit": apt.days_since_previous_visit,
        "no_show_probability": pred.no_show_probability if pred else None,
        "risk_level": pred.risk_level if pred else None,
        "confidence": pred.confidence if pred else None,
        "explanation": pred.explanation if pred else None,
        "recommendation": pred.recommendation if pred else None,
        "risk_factors": factors,
        "patient_history": {
            "total_appointments": apt.patient.total_appointments if apt.patient else 0,
            "attended_count": apt.patient.attended_count if apt.patient else 0,
            "no_show_count": apt.patient.no_show_count if apt.patient else 0,
            "cancellation_count": apt.patient.cancellation_count if apt.patient else 0
        }
    }

@router.get("/high-risk")
def get_high_risk_appointments(db: Session = Depends(get_db)):
    """Returns appointments classified as high or very high risk."""
    predictions = db.query(Prediction).filter(
        Prediction.risk_level.in_(["high", "very_high"])
    ).order_by(desc(Prediction.no_show_probability)).limit(50).all()

    results = []
    for pred in predictions:
        apt = pred.appointment
        patient = pred.patient
        factors = []
        if pred.risk_factors:
            try:
                factors = json.loads(pred.risk_factors)
            except Exception:
                pass

        results.append({
            "prediction_id": pred.id,
            "appointment_id": apt.id if apt else "N/A",
            "patient_id": pred.patient_id,
            "patient_name": patient.full_name if patient else f"Patient {pred.patient_id}",
            "department": apt.department if apt else "Cardiology",
            "appointment_date": apt.appointment_date if apt else pred.created_at,
            "appointment_type": apt.appointment_type if apt else "Follow-up",
            "sms_sent": apt.sms_sent if apt else True,
            "sms_confirmed": apt.sms_confirmed if apt else False,
            "no_show_probability": pred.no_show_probability,
            "risk_level": pred.risk_level,
            "confidence": pred.confidence,
            "risk_factors": factors,
            "explanation": pred.explanation,
            "recommendation": pred.recommendation,
            "distance_km": apt.distance_km if apt else 15.0
        })

    return results

@router.get("/alerts")
def list_alerts(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve operational alerts."""
    query = db.query(Alert).order_by(desc(Alert.detection_time))

    if status and status != "All":
        query = query.filter(Alert.status == status)
    if risk_level and risk_level != "All":
        query = query.filter(Alert.risk_level == risk_level.lower())

    alerts = query.all()
    results = []
    for a in alerts:
        apt = a.appointment
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": a.patient.full_name if a.patient else f"Patient {a.patient_id}",
            "appointment_id": a.appointment_id,
            "department": apt.department if apt else "Outpatient",
            "appointment_date": apt.appointment_date if apt else None,
            "risk_level": a.risk_level,
            "no_show_probability": apt.prediction.no_show_probability if (apt and apt.prediction) else 80.0,
            "detection_time": a.detection_time,
            "description": a.description,
            "recommended_action": a.recommended_action,
            "status": a.status,
            "action_taken": a.action_taken,
            "resolved_at": a.resolved_at
        })
    return results

@router.post("/alerts/{id}/action")
def update_alert_action(
    id: str,
    payload: AlertActionRequest,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header("Hospital Staff")
):
    """Updates an alert status (e.g. Contacted, Monitoring, Resolved, Dismissed)."""
    try:
        updated = handle_alert_action(db, id, payload, current_user=x_user_role)
        return {
            "success": True,
            "id": updated.id,
            "status": updated.status,
            "action_taken": updated.action_taken
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{id}/resolve")
def resolve_alert(
    id: str,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header("Hospital Staff")
):
    action = AlertActionRequest(status="Resolved", action_taken="Patient confirmed attendance via phone outreach")
    return update_alert_action(id, action, db, x_user_role)

@router.post("/appointments/{id}/remind")
def send_appointment_reminder(
    id: str,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header("Hospital Staff")
):
    """Sends immediate priority SMS and automated reminder to patient."""
    try:
        return send_mock_reminder(db, id, current_user=x_user_role)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    """List departments with performance metrics."""
    stats = get_dashboard_analytics(db)
    return stats.department_rates

@router.get("/notifications")
def list_notifications(limit: int = 15, db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(desc(Notification.created_at)).limit(limit).all()
    unread_count = db.query(Notification).filter(Notification.is_read == False).count()
    return {
        "unread_count": unread_count,
        "items": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "link": n.link,
                "created_at": n.created_at
            }
            for n in notifs
        ]
    }

@router.post("/notifications/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"success": True}

@router.post("/notifications/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"success": True}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()

@router.get("/patients/{id}")
def get_patient(id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "id": patient.id,
        "name": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "distance_km": patient.distance_km,
        "total_appointments": patient.total_appointments,
        "attended_count": patient.attended_count,
        "no_show_count": patient.no_show_count,
        "cancellation_count": patient.cancellation_count,
        "attendance_rate": round(patient.attended_count / patient.total_appointments * 100, 1) if patient.total_appointments > 0 else 0.0,
        "days_since_previous_visit": patient.days_since_previous_visit
    }

@router.get("/patients")
def list_patients(search: Optional[str] = None, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(Patient)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Patient.id.ilike(s), Patient.full_name.ilike(s)))
    return query.limit(limit).all()

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    stats = get_dashboard_analytics(db)
    return stats.bottleneck_insights

@router.delete("/appointments/{id}")
def delete_appointment(
    id: str,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header("Administrator")
):
    """Delete an appointment record if permitted."""
    if x_user_role != "Administrator":
        raise HTTPException(status_code=403, detail="Only Administrator role can delete appointment records.")
    
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    pid = apt.patient_id
    db.delete(apt)
    db.commit()

    log_audit_event(
        db,
        user=x_user_role,
        action="Appointment Record Deleted",
        target=f"{id} (Patient {pid})",
        result="Success",
        details="Appointment removed from system registry"
    )

    return {"success": True, "message": f"Appointment {id} deleted successfully."}
