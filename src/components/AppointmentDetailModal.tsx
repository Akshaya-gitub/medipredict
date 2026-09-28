import React from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, Clock, MapPin, MessageSquare, PhoneCall, ShieldCheck, User } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { AppointmentItem } from '../types';

interface Props {
  appointment: AppointmentItem | null;
  onClose: () => void;
  onSendReminder?: (id: string) => void;
  canSendReminder?: boolean;
}

export const AppointmentDetailModal: React.FC<Props> = ({
  appointment,
  onClose,
  onSendReminder,
  canSendReminder = true
}) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {appointment.id}
              </h2>
              <RiskBadge level={appointment.risk_level} />
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                appointment.status === 'Attended' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                appointment.status === 'No-Show' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                appointment.status === 'Cancelled' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {appointment.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{appointment.patient_id} ({appointment.patient_name})</span> • {appointment.age} yrs • {appointment.department}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Prediction Intelligence Header */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              No-Show Probability
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {appointment.no_show_probability}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Prediction Confidence
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {appointment.confidence}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Transit & Timing
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              {appointment.distance_km} km • {appointment.waiting_time_minutes}m wait
            </div>
          </div>
        </div>

        {/* Explainable Prediction: Why is this high risk? */}
        <div className="mt-5 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
          <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={16} />
            Prediction Intelligence Rationale
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-line leading-relaxed">
            {appointment.explanation}
          </p>

          {/* Detected Risk Factors */}
          {appointment.risk_factors && appointment.risk_factors.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Detected Contributing Risk Factors:
              </div>
              <div className="space-y-1">
                {appointment.risk_factors.map((rf, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      <CheckCircle2 size={14} className="text-hospital-500 shrink-0" />
                      {rf.description}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-hospital-100 text-hospital-800 dark:bg-hospital-950 dark:text-hospital-300">
                      {rf.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Recommended Operational Action
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-line leading-relaxed">
            {appointment.recommendation}
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          {canSendReminder && onSendReminder && (
            <button
              onClick={() => {
                onSendReminder(appointment.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare size={14} />
              Dispatch Priority Reminder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
