import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Info,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  User,
  Building2,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { PredictionGauge } from '../components/PredictionGauge';
import { RiskBadge } from '../components/RiskBadge';
import { PredictionRequest, PredictionResponse, UserRole } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
  onPredictionComplete?: () => void;
}

export const PredictorPage: React.FC<Props> = ({ currentRole, onNavigate, onPredictionComplete }) => {
  const { showToast } = useToast();

  // Form State
  const [patientId, setPatientId] = useState('P-10245');
  const [age, setAge] = useState(42);
  const [gender, setGender] = useState('Female');
  const [department, setDepartment] = useState('Cardiology');
  const [appointmentType, setAppointmentType] = useState('Follow-up');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-15T10:30');
  const [previousAppointments, setPreviousAppointments] = useState(6);
  const [previousNoShows, setPreviousNoShows] = useState(2);
  const [previousCancellations, setPreviousCancellations] = useState(1);
  const [daysSincePreviousVisit, setDaysSincePreviousVisit] = useState(180);
  const [distanceKm, setDistanceKm] = useState(18.0);
  const [smsSent, setSmsSent] = useState(true);
  const [smsConfirmed, setSmsConfirmed] = useState(false);
  const [waitingTimeMinutes, setWaitingTimeMinutes] = useState(45);

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState('');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  // Demo Scenarios Handler
  const loadScenario = (scenarioNum: number) => {
    if (scenarioNum === 1) {
      // Scenario 1 — Low Risk
      setPatientId('P-10001');
      setAge(58);
      setGender('Male');
      setDepartment('General Medicine');
      setAppointmentType('Routine check-up');
      setPreviousAppointments(8);
      setPreviousNoShows(0);
      setPreviousCancellations(0);
      setDaysSincePreviousVisit(21);
      setDistanceKm(3.0);
      setSmsSent(true);
      setSmsConfirmed(true);
      setWaitingTimeMinutes(20);
      showToast('info', 'Demo Scenario 1 Loaded', 'Low Risk benchmark profile (P-10001)');
    } else if (scenarioNum === 2) {
      // Scenario 2 — Moderate Risk
      setPatientId('P-10025');
      setAge(34);
      setGender('Female');
      setDepartment('Dermatology');
      setAppointmentType('Follow-up');
      setPreviousAppointments(5);
      setPreviousNoShows(1);
      setPreviousCancellations(1);
      setDaysSincePreviousVisit(95);
      setDistanceKm(12.0);
      setSmsSent(true);
      setSmsConfirmed(false);
      setWaitingTimeMinutes(35);
      showToast('info', 'Demo Scenario 2 Loaded', 'Moderate Risk benchmark profile (P-10025)');
    } else if (scenarioNum === 3) {
      // Scenario 3 — High / Very High Risk (Benchmark 82%)
      setPatientId('P-10245');
      setAge(42);
      setGender('Female');
      setDepartment('Cardiology');
      setAppointmentType('Follow-up');
      setPreviousAppointments(6);
      setPreviousNoShows(2);
      setPreviousCancellations(1);
      setDaysSincePreviousVisit(180);
      setDistanceKm(18.0);
      setSmsSent(true);
      setSmsConfirmed(false);
      setWaitingTimeMinutes(45);
      showToast('info', 'Demo Scenario 3 Loaded', 'Official Hackathon Demo Profile (P-10245)');
    } else if (scenarioNum === 4) {
      // Scenario 4 — Very High Risk
      setPatientId('P-10420');
      setAge(67);
      setGender('Male');
      setDepartment('Orthopedics');
      setAppointmentType('Therapy session');
      setPreviousAppointments(10);
      setPreviousNoShows(5);
      setPreviousCancellations(1);
      setDaysSincePreviousVisit(240);
      setDistanceKm(35.0);
      setSmsSent(true);
      setSmsConfirmed(false);
      setWaitingTimeMinutes(55);
      showToast('info', 'Demo Scenario 4 Loaded', 'Severe Prior Absence Profile (P-10420)');
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      showToast('error', 'Validation Error', 'Please enter a valid Patient ID.');
      return;
    }

    setIsLoading(true);
    setActiveStep('Validating Patient & Appointment Telemetry...');

    try {
      // Simulate clinical intelligence progress steps
      setTimeout(() => setActiveStep('Extracting Behavioral & Logistics Features...'), 250);
      setTimeout(() => setActiveStep('Evaluating Explainable Scoring Rules...'), 500);

      const requestPayload: PredictionRequest = {
        patient_id: patientId.trim(),
        age: Number(age),
        gender,
        department,
        appointment_type: appointmentType,
        appointment_date: appointmentDate,
        previous_appointments: Number(previousAppointments),
        previous_no_shows: Number(previousNoShows),
        previous_cancellations: Number(previousCancellations),
        days_since_previous_visit: Number(daysSincePreviousVisit),
        distance_km: Number(distanceKm),
        sms_sent: smsSent,
        sms_confirmed: smsConfirmed,
        waiting_time_minutes: Number(waitingTimeMinutes)
      };

      const result = await api.predict(requestPayload, currentRole);
      
      setTimeout(() => {
        setPrediction(result);
        setIsLoading(false);
        setActiveStep('');
        showToast('success', 'Prediction Generated', `Score: ${result.no_show_probability}% (${result.risk_label})`);
        if (onPredictionComplete) onPredictionComplete();
      }, 750);
    } catch (err: any) {
      setIsLoading(false);
      setActiveStep('');
      showToast('error', 'Prediction Failed', err.message || 'Unable to compute prediction.');
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Appointment Risk Predictor
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Explainable AI
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evaluate outpatient attendance likelihood using behavioral track record, communication confirmation, and logistical factors.
        </p>
      </div>

      {/* Demo Scenarios Selection Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-hospital-600 dark:text-hospital-400" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Demo Scenarios
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click to instantly populate benchmark test profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Scenario 1 */}
          <button
            type="button"
            onClick={() => loadScenario(1)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Scenario 1</span>
              <RiskBadge level="very_low" label="Low Risk" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              P-10001 • 0 No-Shows • SMS Confirmed • 3 km
            </p>
          </button>

          {/* Scenario 2 */}
          <button
            type="button"
            onClick={() => loadScenario(2)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Scenario 2</span>
              <RiskBadge level="moderate" label="Moderate Risk" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              P-10025 • 1 No-Show • Unconfirmed • 12 km
            </p>
          </button>

          {/* Scenario 3 - Official Hackathon Demo */}
          <button
            type="button"
            onClick={() => loadScenario(3)}
            className="p-3 rounded-xl border-2 border-hospital-500 bg-hospital-50/50 dark:bg-hospital-950/40 hover:bg-hospital-100/50 text-left transition relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-hospital-900 dark:text-hospital-200 flex items-center gap-1">
                Scenario 3 (Demo) ★
              </span>
              <RiskBadge level="very_high" label="High Risk" size="sm" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
              P-10245 • 2 No-Shows • 180d Gap • 18 km
            </p>
          </button>

          {/* Scenario 4 */}
          <button
            type="button"
            onClick={() => loadScenario(4)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20 text-left transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Scenario 4</span>
              <RiskBadge level="very_high" label="Very High" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              P-10420 • 5 No-Shows • Unconfirmed • 35 km
            </p>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (Left) & Results Display (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Appointment & Patient Input
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logistical details for feature extraction
              </p>
            </div>
            <span className="text-xs font-bold text-hospital-600 dark:text-hospital-400">
              Form Complete
            </span>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* Section 1: Patient Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Patient ID *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="P-10245"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Section 2: Department & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department *
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dental">Dental</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
                >
                  <option value="New consultation">New consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Routine check-up">Routine check-up</option>
                  <option value="Diagnostic appointment">Diagnostic appointment</option>
                  <option value="Therapy session">Therapy session</option>
                </select>
              </div>
            </div>

            {/* Section 3: Historical Behavior Metrics */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Historical Attendance Track Record
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Previous Appointments
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={previousAppointments}
                    onChange={(e) => setPreviousAppointments(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-red-600 dark:text-red-400 mb-1">
                    Previous No-Shows
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={previousNoShows}
                    onChange={(e) => setPreviousNoShows(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-red-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Previous Cancellations
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={previousCancellations}
                    onChange={(e) => setPreviousCancellations(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Days Since Previous Visit (Gap)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={daysSincePreviousVisit}
                    onChange={(e) => setDaysSincePreviousVisit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 180 days</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Clinic Waiting Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={waitingTimeMinutes}
                    onChange={(e) => setWaitingTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Communication & Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Distance From Hospital
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400">in kilometers (km)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  SMS Reminder Sent
                </label>
                <select
                  value={smsSent ? 'true' : 'false'}
                  onChange={(e) => setSmsSent(e.target.value === 'true')}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="true">Sent</option>
                  <option value="false">Not Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  SMS Confirmation
                </label>
                <select
                  value={smsConfirmed ? 'true' : 'false'}
                  onChange={(e) => setSmsConfirmed(e.target.value === 'true')}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border font-bold ${
                    smsConfirmed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  <option value="true">Confirmed</option>
                  <option value="false">Not Confirmed</option>
                </select>
              </div>
            </div>

            {/* Predict Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-hospital-600 via-hospital-500 to-purple-600 hover:from-hospital-700 hover:to-purple-700 text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-hospital-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>{activeStep || 'Evaluating Risk Engine...'}</span>
                  </>
                ) : (
                  <>
                    <Brain size={19} />
                    <span>Predict No-Show Risk</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results & Intelligence Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!prediction ? (
            /* Empty State */
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                <Brain size={28} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Prediction Engine Standby
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Fill the appointment data or select a quick demo scenario above and click <span className="font-bold">"Predict No-Show Risk"</span> to compute explainable probabilities and operational actions.
              </p>
            </div>
          ) : (
            /* Results Presentation */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Gauge and Badges */}
              <PredictionGauge
                probability={prediction.no_show_probability}
                riskLevel={prediction.risk_level}
                riskLabel={prediction.risk_label}
                confidence={prediction.confidence}
              />

              {/* Alert Notification if created */}
              {prediction.alert_created && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <BellRing size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
                        Operational Alert Created: {prediction.alert_id}
                      </h4>
                      <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                        High-risk appointment auto-dispatched to triage queue for telephone outreach.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('alerts')}
                    className="shrink-0 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    View Alert →
                  </button>
                </div>
              )}

              {/* Explainable Rationale */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-purple-600 dark:text-purple-400" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Why is this appointment high risk?
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Detected Contributing Risk Factors:
                  </div>
                  <div className="space-y-1.5">
                    {prediction.risk_factors.map((rf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-hospital-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {rf.description}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-hospital-100 dark:bg-hospital-950 text-hospital-800 dark:text-hospital-300 shrink-0">
                          {rf.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-4 rounded-2xl bg-hospital-50/70 dark:bg-hospital-950/30 border border-hospital-100 dark:border-hospital-900/40">
                  <h4 className="text-xs font-bold text-hospital-900 dark:text-hospital-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-hospital-600 dark:text-hospital-400" />
                    Recommended Operational Action
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-line leading-relaxed">
                    {prediction.recommendation}
                  </p>
                </div>

                {/* Patient Attendance Profile Summary */}
                {prediction.patient_profile && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Patient Attendance Profile ({prediction.patient_profile.patient_id})
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {prediction.patient_profile.total_appointments}
                        </div>
                        <div className="text-[10px] text-slate-400">Total Visits</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {prediction.patient_profile.attendance_rate}%
                        </div>
                        <div className="text-[10px] text-slate-400">Attendance Rate</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="text-xs font-bold text-red-600 dark:text-red-400">
                          {prediction.patient_profile.previous_no_show_rate}%
                        </div>
                        <div className="text-[10px] text-slate-400">No-Show Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
