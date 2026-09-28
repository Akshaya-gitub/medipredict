export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

export interface RiskFactorItem {
  factor: string;
  impact: string;
  points: number;
  category: string;
  description: string;
}

export interface ScoringBreakdownItem {
  factor_name: string;
  points: number;
  reason: string;
}

export interface PatientProfileSummary {
  patient_id: string;
  total_appointments: number;
  attended_count: number;
  no_show_count: number;
  cancellation_count: number;
  attendance_rate: number;
  previous_no_show_rate: number;
  last_appointment_gap_days: number;
}

export interface PredictionRequest {
  patient_id: string;
  age: number;
  gender: string;
  department: string;
  appointment_type: string;
  appointment_date?: string;
  scheduled_date?: string;
  previous_appointments: number;
  previous_no_shows: number;
  previous_cancellations: number;
  days_since_previous_visit: number;
  distance_km: number;
  sms_sent: boolean;
  sms_confirmed: boolean;
  waiting_time_minutes: number;
}

export interface PredictionResponse {
  prediction_id?: string;
  appointment_id?: string;
  patient_id: string;
  no_show_probability: number;
  risk_level: RiskLevel;
  risk_label: string;
  confidence: number;
  risk_factors: RiskFactorItem[];
  scoring_breakdown: ScoringBreakdownItem[];
  explanation: string;
  recommendation: string;
  patient_profile?: PatientProfileSummary;
  alert_created: boolean;
  alert_id?: string;
  created_at?: string;
}

export interface AppointmentItem {
  id: string;
  patient_id: string;
  patient_name: string;
  age: number;
  department: string;
  appointment_type: string;
  scheduled_date: string;
  appointment_date: string;
  status: 'Scheduled' | 'Attended' | 'No-Show' | 'Cancelled';
  sms_sent: boolean;
  sms_confirmed: boolean;
  distance_km: number;
  waiting_time_minutes: number;
  days_since_previous_visit: number;
  no_show_probability: number;
  risk_level: RiskLevel;
  confidence: number;
  explanation: string;
  recommendation: string;
  risk_factors: RiskFactorItem[];
}

export interface AlertItem {
  id: string;
  patient_id: string;
  patient_name?: string;
  appointment_id?: string;
  department?: string;
  appointment_date?: string;
  risk_level: RiskLevel;
  no_show_probability?: number;
  detection_time: string;
  description: string;
  recommended_action: string;
  status: 'New' | 'Contacted' | 'Monitoring' | 'Resolved' | 'Dismissed';
  action_taken?: string;
  resolved_at?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface DepartmentItem {
  name: string;
  code: string;
  total: number;
  attended: number;
  no_shows: number;
  cancelled: number;
  no_show_rate: number;
  avg_probability: number;
  high_risk_count: number;
  staff: number;
}

export interface BottleneckInsight {
  id: string;
  title: string;
  category: string;
  insight: string;
  recommendation: string;
  severity: 'warning' | 'info' | 'critical';
  metric_value: string;
}

export interface DashboardStats {
  total_appointments: number;
  completed_appointments: number;
  attended_appointments: number;
  no_shows: number;
  cancellations: number;
  cancellation_rate: number;
  high_risk_appointments: number;
  avg_no_show_probability: number;
  prediction_accuracy: number;
  active_alerts: number;
  outcomes_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  department_rates: DepartmentItem[];
  daily_volume: Array<{ date: string; total: number; attended: number; no_shows: number; day_name: string }>;
  no_show_trend: Array<{ period: string; rate: number; predicted: number; volume: number }>;
  top_risk_factors: Array<{ factor: string; percentage: number; count: number; impact: string; icon: string }>;
  bottleneck_insights: BottleneckInsight[];
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  target?: string;
  result: string;
  details?: string;
}

export type UserRole = 'Administrator' | 'Hospital Staff' | 'Viewer';
