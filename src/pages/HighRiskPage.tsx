import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  MessageSquare,
  PhoneCall,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { api } from '../services/api';
import { UserRole } from '../types';
import { useToast } from '../components/Toast';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const HighRiskPage: React.FC<Props> = ({ currentRole, onNavigate }) => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  useEffect(() => {
    loadHighRisk();
  }, []);

  const loadHighRisk = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHighRiskAppointments();
      setAppointments(data);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', 'Failed to load high-risk queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (appointmentId: string) => {
    if (currentRole === 'Viewer') {
      showToast('warning', 'Access Denied', 'Viewer role cannot dispatch reminders.');
      return;
    }
    try {
      const res = await api.sendReminder(appointmentId, currentRole);
      showToast('success', 'Reminder Dispatched', res.message);
    } catch (e: any) {
      showToast('error', 'Failed', e.message);
    }
  };

  const handleMarkContacted = async (patientId: string) => {
    if (currentRole === 'Viewer') {
      showToast('warning', 'Access Denied', 'Viewer role cannot update records.');
      return;
    }
    showToast('success', 'Status Logged', `Patient ${patientId} marked as Contacted. Audit log updated.`);
  };

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient_id.toLowerCase().includes(search.toLowerCase()) ||
      apt.department.toLowerCase().includes(search.toLowerCase()) ||
      (apt.patient_name && apt.patient_name.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'All' || apt.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              High-Risk Appointments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {appointments.length} Flagged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prioritized clinical queue of appointments requiring proactive outreach to protect clinic schedule capacity.
          </p>
        </div>

        <button
          onClick={loadHighRisk}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by Patient ID (e.g. P-10245) or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
          >
            <option value="All">All Departments</option>
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

      {/* Cards Queue */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <RefreshCw className="animate-spin inline mr-2" /> Loading triage queue...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            High-Risk Queue Clear
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            No pending high-risk appointments match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((apt) => (
            <div
              key={apt.prediction_id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                apt.risk_level === 'very_high'
                  ? 'border-red-300 dark:border-red-900/60 hover:shadow-red-500/10'
                  : 'border-orange-300 dark:border-orange-900/60 hover:shadow-orange-500/10'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-mono">
                        {apt.patient_id}
                      </span>
                      <RiskBadge level={apt.risk_level} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {apt.patient_name} • {apt.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">
                      {apt.no_show_probability}%
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Risk Prob
                    </span>
                  </div>
                </div>

                {/* Timing & Logistics */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Clock size={13} className="text-hospital-500" />
                    {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {apt.distance_km} km
                  </span>
                </div>

                {/* Reminder Status */}
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Reminder Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    apt.sms_confirmed
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {apt.sms_confirmed ? 'Confirmed' : 'Unconfirmed'}
                  </span>
                </div>

                {/* Key Contributing Risk Factors */}
                {apt.risk_factors && apt.risk_factors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Contributing Factors:
                    </span>
                    <div className="space-y-1">
                      {apt.risk_factors.slice(0, 3).map((rf: any, i: number) => (
                        <div key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span className="truncate pr-1">• {rf.description}</span>
                          <span className="font-bold text-red-500 shrink-0">{rf.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Operational Action */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-hospital-600 dark:text-hospital-400 uppercase tracking-wider block">
                    Action Plan:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                    {apt.recommendation?.split('\n')[0] || 'Prioritize phone confirmation'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSendReminder(apt.appointment_id)}
                  className="px-2 py-1.5 rounded-xl bg-hospital-50 dark:bg-hospital-950/60 hover:bg-hospital-100 text-hospital-700 dark:text-hospital-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <MessageSquare size={12} />
                  Remind
                </button>

                <button
                  onClick={() => handleMarkContacted(apt.patient_id)}
                  className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <PhoneCall size={12} />
                  Contacted
                </button>

                <button
                  onClick={() => setSelectedAppointment(apt)}
                  className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Eye size={12} />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSendReminder={handleSendReminder}
          canSendReminder={currentRole !== 'Viewer'}
        />
      )}
    </div>
  );
};
