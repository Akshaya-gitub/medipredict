import json
import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models.models import Patient, Appointment, Prediction, Alert, Notification, AuditLog, Department, PredictionRule
from app.prediction_engine.engine import run_prediction_engine
from app.schemas.schemas import PredictionRequest, PredictionResponse, AlertActionRequest

def log_audit_event(
    db: Session,
    user: str,
    action: str,
    target: Optional[str] = None,
    result: str = "Success",
    details: Optional[str] = None
):
    """Records audit trail entry in the database."""
    log = AuditLog(
        timestamp=datetime.datetime.utcnow(),
        user=user,
        action=action,
        target=target,
        result=result,
        details=details
    )
    db.add(log)
    db.commit()

def create_notification(
    db: Session,
    title: str,
    message: str,
    n_type: str = "high_risk",
    link: Optional[str] = None
):
    notif = Notification(
        title=title,
        message=message,
        type=n_type,
        is_read=False,
        link=link,
        created_at=datetime.datetime.utcnow()
    )
    db.add(notif)
    db.commit()

def predict_and_store_appointment(
    db: Session,
    request: PredictionRequest,
    current_user: str = "Hospital Staff"
) -> PredictionResponse:
    """
    Workflow:
    Appointment Data Submitted
    ↓ Validate Patient & Appointment Data
    ↓ Feature Extraction
    ↓ Risk Factor Analysis
    ↓ Prediction Engine
    ↓ No-Show Probability Calculation
    ↓ Classification
    ↓ Generate Explanation
    ↓ Generate Recommended Action
    ↓ Store Prediction
    ↓ Generate Alert if Required
    ↓ Update Hospital Dashboard
    """
    # 1. Check or create Patient
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        # Create new patient entry
        patient = Patient(
            id=request.patient_id,
            full_name=f"Patient {request.patient_id}",
            age=request.age,
            gender=request.gender or "Female",
            phone="+1 (555) 019-2834",
            distance_km=request.distance_km,
            total_appointments=request.previous_appointments,
            attended_count=max(0, request.previous_appointments - request.previous_no_shows - request.previous_cancellations),
            no_show_count=request.previous_no_shows,
            cancellation_count=request.previous_cancellations,
            days_since_previous_visit=request.days_since_previous_visit,
            created_at=datetime.datetime.utcnow()
        )
        db.add(patient)
        db.commit()
    else:
        # Update distance & days since previous visit
        patient.distance_km = request.distance_km
        patient.days_since_previous_visit = request.days_since_previous_visit
        db.commit()

    # Parse appointment date
    apt_datetime = datetime.datetime.utcnow() + datetime.timedelta(days=2, hours=10)
    if request.appointment_date:
        try:
            apt_datetime = datetime.datetime.fromisoformat(request.appointment_date.replace("Z", "+00:00"))
        except Exception:
            try:
                apt_datetime = datetime.datetime.strptime(request.appointment_date, "%Y-%m-%d %H:%M")
            except Exception:
                pass

    # 2. Run Prediction Engine
    engine_result = run_prediction_engine(
        patient_id=request.patient_id,
        age=request.age,
        gender=request.gender or patient.gender,
        department=request.department,
        appointment_type=request.appointment_type,
        previous_appointments=request.previous_appointments,
        previous_no_shows=request.previous_no_shows,
        previous_cancellations=request.previous_cancellations,
        days_since_previous_visit=request.days_since_previous_visit,
        distance_km=request.distance_km,
        sms_sent=request.sms_sent,
        sms_confirmed=request.sms_confirmed,
        waiting_time_minutes=request.waiting_time_minutes,
        appointment_date_obj=apt_datetime
    )

    no_show_prob = engine_result["no_show_probability"]
    risk_level = engine_result["risk_level"]
    risk_label = engine_result["risk_label"]
    confidence = engine_result["confidence"]
    risk_factors = engine_result["risk_factors"]
    scoring_breakdown = engine_result["scoring_breakdown"]
    explanation = engine_result["explanation"]
    recommendation = engine_result["recommendation"]
    patient_profile = engine_result["patient_profile"]

    # 3. Create or update Appointment record
    import random
    apt_id = f"APT-{random.randint(10000, 99999)}"
    appointment = Appointment(
        id=apt_id,
        patient_id=request.patient_id,
        department=request.department,
        appointment_type=request.appointment_type,
        scheduled_date=datetime.datetime.utcnow(),
        appointment_date=apt_datetime,
        status="Scheduled",
        sms_sent=request.sms_sent,
        sms_confirmed=request.sms_confirmed,
        distance_km=request.distance_km,
        waiting_time_minutes=request.waiting_time_minutes,
        days_since_previous_visit=request.days_since_previous_visit,
        notes=f"Predicted Risk: {risk_label} ({no_show_prob}%)",
        created_at=datetime.datetime.utcnow()
    )
    db.add(appointment)
    db.commit()

    # 4. Save Prediction record
    pred_id = f"PRD-{apt_id}"
    risk_factors_json = json.dumps([rf.model_dump() for rf in risk_factors])
    breakdown_json = json.dumps([sb.model_dump() for sb in scoring_breakdown])

    prediction = Prediction(
        id=pred_id,
        appointment_id=apt_id,
        patient_id=request.patient_id,
        no_show_probability=no_show_prob,
        risk_level=risk_level,
        confidence=confidence,
        risk_factors=risk_factors_json,
        scoring_breakdown=breakdown_json,
        explanation=explanation,
        recommendation=recommendation,
        created_at=datetime.datetime.utcnow()
    )
    db.add(prediction)
    db.commit()

    # 5. Generate Alert if Required (High or Very High Risk: >= 61%)
    alert_created = False
    alert_id = None
    if risk_level in ["high", "very_high"]:
        alert_id = f"ALT-{random.randint(1000, 9999)}"
        desc_text = f"High probability of appointment no-show ({no_show_prob}%) detected for {request.patient_id} in {request.department}."
        if not request.sms_confirmed:
            desc_text += " SMS reminder is unconfirmed."
        alert = Alert(
            id=alert_id,
            patient_id=request.patient_id,
            appointment_id=apt_id,
            risk_level=risk_level,
            detection_time=datetime.datetime.utcnow(),
            description=desc_text,
            recommended_action=recommendation.split("\n")[0] if recommendation else "Contact patient for confirmation",
            status="New",
            action_taken=None
        )
        db.add(alert)
        db.commit()
        alert_created = True

        # Generate notification in Notification Center
        create_notification(
            db,
            title=f"High-Risk Appointment Detected: {request.patient_id}",
            message=f"{request.department} appointment on {apt_datetime.strftime('%b %d, %Y')} has a {no_show_prob}% no-show risk.",
            n_type="very_high_risk" if risk_level == "very_high" else "high_risk",
            link="/high-risk"
        )

    # 6. Audit Logging
    log_audit_event(
        db,
        user=current_user,
        action="Appointment Prediction Generated",
        target=f"{apt_id} ({request.patient_id})",
        result="Success",
        details=f"Calculated no-show probability: {no_show_prob}%, Risk Level: {risk_label}, Confidence: {confidence}%. Alert Created: {alert_created}"
    )

    return PredictionResponse(
        prediction_id=pred_id,
        appointment_id=apt_id,
        patient_id=request.patient_id,
        no_show_probability=no_show_prob,
        risk_level=risk_level,
        risk_label=risk_label,
        confidence=confidence,
        risk_factors=risk_factors,
        scoring_breakdown=scoring_breakdown,
        explanation=explanation,
        recommendation=recommendation,
        patient_profile=patient_profile,
        alert_created=alert_created,
        alert_id=alert_id,
        created_at=datetime.datetime.utcnow()
    )

def handle_alert_action(
    db: Session,
    alert_id: str,
    action_data: AlertActionRequest,
    current_user: str = "Hospital Staff"
) -> Alert:
    """Updates alert status and writes audit log."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise ValueError(f"Alert {alert_id} not found")

    old_status = alert.status
    alert.status = action_data.status
    alert.action_taken = action_data.action_taken
    if action_data.status == "Resolved":
        alert.resolved_at = datetime.datetime.utcnow()

    db.commit()

    log_audit_event(
        db,
        user=current_user,
        action=f"Alert Status Updated: {alert_id}",
        target=f"Patient {alert.patient_id}",
        result="Success",
        details=f"Status transitioned from {old_status} to {action_data.status}. Action: {action_data.action_taken}"
    )

    return alert

def send_mock_reminder(
    db: Session,
    appointment_id: str,
    current_user: str = "Hospital Staff"
) -> Dict[str, Any]:
    """Simulates sending an urgent SMS/Phone reminder for an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise ValueError(f"Appointment {appointment_id} not found")

    appointment.sms_sent = True
    db.commit()

    log_audit_event(
        db,
        user=current_user,
        action="Appointment Reminder Dispatched",
        target=f"Appointment {appointment_id} ({appointment.patient_id})",
        result="Success",
        details="Urgent priority SMS and automated call reminder dispatched to patient"
    )

    return {
        "success": True,
        "message": f"Priority reminder successfully dispatched to patient {appointment.patient_id} for appointment {appointment_id}."
    }
