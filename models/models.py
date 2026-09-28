import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), default="Hospital Staff", nullable=False) # "Administrator", "Hospital Staff", "Viewer"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(30), primary_key=True, index=True) # e.g. "P-10245"
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False) # "Male", "Female", "Other"
    phone = Column(String(20), nullable=True)
    distance_km = Column(Float, default=5.0)
    total_appointments = Column(Integer, default=0)
    attended_count = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)
    cancellation_count = Column(Integer, default=0)
    days_since_previous_visit = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="patient")
    alerts = relationship("Alert", back_populates="patient")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # e.g. "Cardiology"
    code = Column(String(10), unique=True, nullable=False) # e.g. "CARD"
    head_doctor = Column(String(100), nullable=True)
    active_staff = Column(Integer, default=12)
    avg_no_show_rate = Column(Float, default=18.5)
    description = Column(String(255), nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(30), primary_key=True, index=True) # e.g. "APT-10025"
    patient_id = Column(String(30), ForeignKey("patients.id"), nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    appointment_type = Column(String(50), nullable=False) # "New consultation", "Follow-up", "Routine check-up", "Diagnostic appointment", "Therapy session"
    scheduled_date = Column(DateTime, nullable=False) # when booking was created
    appointment_date = Column(DateTime, nullable=False, index=True) # date & time of appointment
    status = Column(String(30), default="Scheduled", index=True) # "Scheduled", "Attended", "No-Show", "Cancelled"
    sms_sent = Column(Boolean, default=True)
    sms_confirmed = Column(Boolean, default=False)
    distance_km = Column(Float, default=10.0)
    waiting_time_minutes = Column(Integer, default=30)
    days_since_previous_visit = Column(Integer, default=30)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    prediction = relationship("Prediction", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="appointment", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(40), primary_key=True, index=True) # e.g. "PRD-APT-10025"
    appointment_id = Column(String(30), ForeignKey("appointments.id"), nullable=True, index=True)
    patient_id = Column(String(30), ForeignKey("patients.id"), nullable=False, index=True)
    no_show_probability = Column(Float, nullable=False) # 0 to 100
    risk_level = Column(String(30), nullable=False, index=True) # "very_low", "low", "moderate", "high", "very_high"
    confidence = Column(Float, nullable=False) # 0 to 100
    risk_factors = Column(Text, nullable=False) # JSON encoded list of risk factors
    scoring_breakdown = Column(Text, nullable=True) # JSON encoded scoring steps
    explanation = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="predictions")
    appointment = relationship("Appointment", back_populates="prediction")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(30), primary_key=True, index=True) # e.g. "ALT-1004"
    patient_id = Column(String(30), ForeignKey("patients.id"), nullable=False, index=True)
    appointment_id = Column(String(30), ForeignKey("appointments.id"), nullable=True, index=True)
    risk_level = Column(String(30), nullable=False) # "high", "very_high", "moderate"
    detection_time = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String(255), nullable=False)
    recommended_action = Column(String(255), nullable=False)
    status = Column(String(30), default="New", index=True) # "New", "Contacted", "Monitoring", "Resolved", "Dismissed"
    action_taken = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="alerts")
    appointment = relationship("Appointment", back_populates="alerts")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(40), default="high_risk") # "high_risk", "very_high_risk", "reminder_unconfirmed", "department_spike", "system"
    is_read = Column(Boolean, default=False)
    link = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    user = Column(String(50), default="System")
    action = Column(String(100), nullable=False)
    target = Column(String(100), nullable=True)
    result = Column(String(50), default="Success")
    details = Column(Text, nullable=True)

class PredictionRule(Base):
    __tablename__ = "prediction_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    condition_desc = Column(String(200), nullable=False)
    weight = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
