import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Activity,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DepartmentItem, UserRole } from '../types';
import { api } from '../services/api';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const DepartmentsPage: React.FC<Props> = ({ currentRole, onNavigate }) => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Department Analytics & Clinic Benchmarks
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-hospital-100 text-hospital-700 dark:bg-hospital-950 dark:text-hospital-300">
              7 Outpatient Clinics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comparative performance, attendance retention rates, and high-risk appointment volume across specialties.
          </p>
        </div>

        <button
          onClick={loadDepartments}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Comparative Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Clinic Volume & Attendance Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total appointments scheduled vs attended vs unexcused no-shows
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }} />
              <Legend />
              <Bar dataKey="total" fill="#0284c7" name="Total Scheduled" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attended" fill="#10b981" name="Attended" radius={[4, 4, 0, 0]} />
              <Bar dataKey="no_shows" fill="#ef4444" name="No-Shows" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept.code}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono">
                    {dept.code}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {dept.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black ${
                    dept.no_show_rate >= 24 ? 'text-red-500' :
                    dept.no_show_rate >= 20 ? 'text-orange-500' :
                    dept.no_show_rate >= 16 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {dept.no_show_rate}%
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    No-Show Rate
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-sm font-black text-slate-900 dark:text-white">{dept.total}</div>
                  <div className="text-[10px] text-slate-400">Total</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{dept.attended}</div>
                  <div className="text-[10px] text-slate-400">Attended</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-sm font-black text-red-500">{dept.no_shows}</div>
                  <div className="text-[10px] text-slate-400">Missed</div>
                </div>
              </div>

              {/* High Risk Count Banner */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">High-Risk Active Visits:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {dept.high_risk_count} appointments
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Active Staff: <strong>{dept.staff} clinicians</strong></span>
              <button
                onClick={() => onNavigate('history')}
                className="text-hospital-600 dark:text-hospital-400 font-bold hover:underline"
              >
                View Registry →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
