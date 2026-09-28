import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  User,
  Building2,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  XCircle,
  Filter
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { AlertItem, UserRole } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const AlertsPage: React.FC<Props> = ({ currentRole, onNavigate }) => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, riskFilter]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAlerts(statusFilter, riskFilter);
      setAlerts(data);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (alertId: string, newStatus: string, actionMsg: string) => {
    if (currentRole === 'Viewer') {
      showToast('warning', 'Access Denied', 'Viewer role cannot modify alert status.');
      return;
    }
    try {
      await api.updateAlertAction(alertId, newStatus, actionMsg, currentRole);
      showToast('success', 'Alert Updated', `Status changed to ${newStatus}`);
      loadAlerts();
    } catch (e: any) {
      showToast('error', 'Action Failed', e.message);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Appointment Alerts Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {alerts.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational alerts for unconfirmed high-risk visits, absence clusters, and clinical triage.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <Filter size={13} /> Filter Status:
        </span>
        {['All', 'New', 'Contacted', 'Monitoring', 'Resolved', 'Dismissed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === st
                ? 'bg-hospital-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <RefreshCw className="animate-spin inline mr-2" /> Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            No Active Alerts in this View
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            All appointments are currently meeting attendance thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm ${
                al.status === 'New'
                  ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
                  : al.status === 'Resolved'
                  ? 'border-emerald-200 dark:border-emerald-900/40 opacity-75'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {al.id}
                    </span>
                    <RiskBadge level={al.risk_level} size="sm" />
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      al.status === 'New' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' :
                      al.status === 'Contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      al.status === 'Monitoring' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      al.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {al.status}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto lg:ml-2">
                      <Clock size={12} />
                      {new Date(al.detection_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {al.description}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Patient: <strong className="text-slate-700 dark:text-slate-200">{al.patient_id} ({al.patient_name})</strong></span>
                    {al.department && <span>• Department: <strong className="text-slate-700 dark:text-slate-200">{al.department}</strong></span>}
                    {al.appointment_id && <span>• Appointment: <strong className="text-slate-700 dark:text-slate-200">{al.appointment_id}</strong></span>}
                  </div>

                  <div className="text-xs text-hospital-700 dark:text-hospital-300 bg-hospital-50 dark:bg-hospital-950/40 p-2.5 rounded-xl border border-hospital-100 dark:border-hospital-900/40">
                    <span className="font-bold">Recommended Operational Action:</span> {al.recommended_action}
                  </div>

                  {al.action_taken && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Action Taken: {al.action_taken}
                    </div>
                  )}
                </div>

                {/* Status Transition Action Buttons */}
                <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                  {al.status !== 'Contacted' && al.status !== 'Resolved' && (
                    <button
                      onClick={() => handleAction(al.id, 'Contacted', 'Phone call attempted by clinic staff')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall size={13} />
                      Mark Contacted
                    </button>
                  )}

                  {al.status !== 'Resolved' && (
                    <button
                      onClick={() => handleAction(al.id, 'Resolved', 'Patient confirmed attendance or rescheduled')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={13} />
                      Resolve Alert
                    </button>
                  )}

                  {al.status !== 'Dismissed' && al.status !== 'Resolved' && (
                    <button
                      onClick={() => handleAction(al.id, 'Dismissed', 'Alert dismissed after triage evaluation')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-xs font-semibold transition"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
