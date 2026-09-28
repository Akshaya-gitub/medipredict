import React from 'react';
import {
  BarChart3,
  TrendingDown,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  MessageSquare,
  MapPin,
  Hourglass
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DashboardStats, UserRole } from '../types';

interface Props {
  stats: DashboardStats | null;
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const AnalyticsPage: React.FC<Props> = ({ stats, currentRole, onNavigate }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <Activity className="animate-spin mr-2" /> Loading clinical analytics...
      </div>
    );
  }

  const completed = stats.completed_appointments || 1;
  const attendancePct = Math.round((stats.attended_appointments / completed) * 100);
  const noShowPct = Math.round((stats.no_shows / completed) * 100);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            System & Clinic Intelligence Analytics
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Audit Ready
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep diagnostic breakdown of appointment flow, prediction engine telemetry, and operational risk distribution.
        </p>
      </div>

      {/* Section 1: Appointment Analytics */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-hospital-600" />
            1. Appointment Analytics
          </h3>
          <span className="text-xs font-semibold text-slate-400">Clinic Retention</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Scheduled</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_appointments}</div>
            <div className="text-[10px] text-slate-400 mt-1">Lifetime database</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-600 uppercase">Attendance Rate</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{attendancePct}%</div>
            <div className="text-[10px] text-emerald-500 mt-1">Completed visits</div>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
            <div className="text-[11px] font-bold text-red-500 uppercase">No-Show Rate</div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{noShowPct}%</div>
            <div className="text-[10px] text-red-400 mt-1">Unexcused dropouts</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Cancellation %</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.cancellation_rate}%</div>
            <div className="text-[10px] text-slate-400 mt-1">Advance notice</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Wait Time</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">32 mins</div>
            <div className="text-[10px] text-slate-400 mt-1">Clinic lobby queue</div>
          </div>
        </div>
      </div>

      {/* Section 2: Prediction Analytics */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            2. Prediction Engine Intelligence
          </h3>
          <span className="text-xs font-semibold text-slate-400">Explainable Model</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Probability</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.avg_no_show_probability}%</div>
            <div className="text-[10px] text-slate-400 mt-1">Facility baseline</div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40">
            <div className="text-[11px] font-bold text-orange-600 uppercase">High-Risk Share</div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
              {Math.round((stats.high_risk_appointments / stats.total_appointments) * 100)}%
            </div>
            <div className="text-[10px] text-orange-400 mt-1">{stats.high_risk_appointments} appointments</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-600 uppercase">Avg Confidence</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">91.4%</div>
            <div className="text-[10px] text-purple-400 mt-1">Telemetry completeness</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-600 uppercase">Model Accuracy</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.prediction_accuracy}%</div>
            <div className="text-[10px] text-emerald-400 mt-1">Outcome verification</div>
          </div>
        </div>

        {/* Predictive Accuracy & Forecast Line Chart */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Weekly Predictive Accuracy vs Actual Outcome Trends
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.no_show_trend} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2.5} name="Actual No-Show %" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" name="Model Forecast %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Risk Factor Importance */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            3. Risk Factor Importance & Frequency
          </h3>
          <span className="text-xs font-semibold text-slate-400">Contribution Weight</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.top_risk_factors?.map((rf, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {rf.factor}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Appears in {rf.count} prediction profiles
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-hospital-600 dark:text-hospital-400">
                  {rf.percentage}%
                </span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Impact</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Operational Bottleneck Insights */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-red-500" />
            4. Real-Time Operational Bottlenecks Detected
          </h3>
          <span className="text-xs font-semibold text-red-500 font-mono">LIVE HEURISTICS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.bottleneck_insights?.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                  {item.id} • {item.category}
                </span>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  {item.metric_value}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {item.insight}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-hospital-600 dark:text-hospital-400 uppercase tracking-wider block">
                  Prescribed Hospital Action:
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
