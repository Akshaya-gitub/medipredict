from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import datetime

class RiskFactorItem(BaseModel):
    factor: str
    impact: str # e.g. "+20%"
    points: int
    category: str # "History", "Communication", "Logistics", "Scheduling", "Clinic"
    description: str

class ScoringBreakdownItem(BaseModel):
    factor_name: str
    points: int
    reason: str

class PatientProfileSummary(BaseModel):
    patient_id: str
    total_appointments: int
    attended_count: int
    no_show_count: int
    cancellation_count: int
    attendance_rate: float
    previous_no_show_rate: float
    last_appointment_gap_days: int

class PredictionRequest(BaseModel):
    patient_id: str = Field(..., example="P-10245")
    age: int = Field(42, ge=0, le=120)
    gender: Optional[str] = Field("Female")
    department: str = Field(..., example="Cardiology")
    appointment_type: str = Field("Follow-up", example="Follow-up")
    appointment_date: Optional[str] = None # ISO format or YYYY-MM-DD HH:MM
    scheduled_date: Optional[str] = None
    previous_appointments: int = Field(6, ge=0)
    previous_no_shows: int = Field(2, ge=0)
    previous_cancellations: int = Field(1, ge=0)
    days_since_previous_visit: int = Field(180, ge=0)
    distance_km: float = Field(18.0, ge=0)
    sms_sent: bool = Field(True)
    sms_confirmed: bool = Field(False)
    waiting_time_minutes: int = Field(45, ge=0)
    save_appointment: bool = Field(True) # whether to persist this as a scheduled appointment

class PredictionResponse(BaseModel):
    prediction_id: Optional[str] = None
    appointment_id: Optional[str] = None
    patient_id: str
    no_show_probability: float
    risk_level: str # "very_low", "low", "moderate", "high", "very_high"
    risk_label: str # "Likely to Attend", "Low No-Show Risk", etc.
    confidence: float
    risk_factors: List[RiskFactorItem]
    scoring_breakdown: List[ScoringBreakdownItem]
    explanation: str
    recommendation: str
    patient_profile: Optional[PatientProfileSummary] = None
    alert_created: bool = False
    alert_id: Optional[str] = None
    created_at: Optional[datetime.datetime] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    age: Optional[int] = None
    department: str
    appointment_type: str
    scheduled_date: datetime.datetime
    appointment_date: datetime.datetime
    status: str
    sms_sent: bool
    sms_confirmed: bool
    distance_km: float
    waiting_time_minutes: int
    days_since_previous_visit: int
    no_show_probability: Optional[float] = None
    risk_level: Optional[str] = None
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    recommendation: Optional[str] = None
    risk_factors: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    appointment_id: Optional[str] = None
    department: Optional[str] = None
    appointment_date: Optional[datetime.datetime] = None
    risk_level: str
    no_show_probability: Optional[float] = None
    detection_time: datetime.datetime
    description: str
    recommended_action: str
    status: str
    action_taken: Optional[str] = None
    resolved_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class AlertActionRequest(BaseModel):
    status: str # "Contacted", "Monitoring", "Resolved", "Dismissed"
    action_taken: Optional[str] = "Follow-up contact initiated with patient"
    notes: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DepartmentSummary(BaseModel):
    id: int
    name: str
    code: str
    head_doctor: Optional[str]
    active_staff: int
    total_appointments: int
    attended: int
    no_shows: int
    cancellations: int
    cancellation_rate: float
    no_show_rate: float
    avg_no_show_probability: float
    high_risk_count: int

class BottleneckInsight(BaseModel):
    id: str
    title: str
    category: str
    insight: str
    recommendation: str
    severity: str # "warning", "info", "critical"
    metric_value: str

class DashboardStatsResponse(BaseModel):
    total_appointments: int
    completed_appointments: int
    attended_appointments: int
    no_shows: int
    cancellations: int
    cancellation_rate: float
    high_risk_appointments: int
    avg_no_show_probability: float
    prediction_accuracy: float
    active_alerts: int
    outcomes_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    department_rates: List[Dict[str, Any]]
    daily_volume: List[Dict[str, Any]]
    no_show_trend: List[Dict[str, Any]]
    top_risk_factors: List[Dict[str, Any]]
    bottleneck_insights: List[BottleneckInsight]

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime.datetime
    user: str
    action: str
    target: Optional[str] = None
    result: str
    details: Optional[str] = None

    class Config:
        from_attributes = True
