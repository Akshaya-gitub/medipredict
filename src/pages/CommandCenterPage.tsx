import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Users,
  CheckCircle,
  TrendingDown,
  AlertTriangle,
  Flame,
  Activity,
  ShieldCheck,
  BellRing,
  Sparkles,
  ArrowUpRight,
  Clock,
  Calendar,
  MessageSquare,
  MapPin,
  Hourglass
} from 'lucide-react';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats | null;
  onNavigate: (view: string) => void;
}

export const CommandCenterPage: React.FC<Props> = ({ stats, onNavigate }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <Activity className="animate-spin mr-2" /> Loading command center telemetry...
      </div>
    );
  }

  // Outcome data for Donut Chart
  const outcomeData = [
    { name: 'Attended', value: stats.outcomes_distribution?.Attended || 58, color: '#10b981' },
    { name: 'No-Show', value: stats.outcomes_distribution?.['No-Show'] || 27, color: '#ef4444' },
    { name: 'Cancelled', value: stats.outcomes_distribution?.Cancelled || 14, color: '#94a3b8' },
  ];

  // Risk distribution for Bar Chart
  const riskData = [
    { name: 'Very Low', count: stats.risk_distribution?.very_low || 64, color: '#10b981' },
    { name: 'Low', count: stats.risk_distribution?.low || 45, color: '#3b82f6' },
    { name: 'Moderate', count: stats.risk_distribution?.moderate || 32, color: '#f59e0b' },
    { name: 'High', count: stats.risk_distribution?.high || 18, color: '#f97316' },
    { name: 'Very High', count: stats.risk_distribution?.very_high || 8, color: '#ef4444' },
  ];

  // Risk factor icons
  const getRiskIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle': return <AlertTriangle size={15} className="text-red-500" />;
      case 'Calendar': return <Calendar size={15} className="text-hospital-500" />;
      case 'MessageSquare': return <MessageSquare size={15} className="text-amber-500" />;
      case 'MapPin': return <MapPin size={15} className="text-purple-500" />;
      case 'Hourglass': return <Hourglass size={15} className="text-blue-500" />;
      default: return <Clock size={15} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-hospital-100 text-hospital-700 dark:bg-hospital-950 dark:text-hospital-300">
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time outpatient appointment flow, no-show predictive triage, and bottleneck monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('predict')}
            className="px-4 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            New Prediction
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Appointments */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Appts
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.total_appointments}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">All clinics</div>
        </div>

        {/* Attended Appointments */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Attended
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.attended_appointments}
          </div>
          <div className="text-[10px] text-emerald-500 mt-1">Completed</div>
        </div>

        {/* No-Shows */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
            No-Shows
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {stats.no_shows}
          </div>
          <div className="text-[10px] text-red-400 mt-1">Lost slots</div>
        </div>

        {/* Cancellation Rate */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Canc. Rate
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.cancellation_rate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Advanced notice</div>
        </div>

        {/* High-Risk Appointments */}
        <div
          onClick={() => onNavigate('high_risk')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-orange-200/80 dark:border-orange-900/60 shadow-sm hover:border-orange-400 transition cursor-pointer"
        >
          <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center justify-between">
            <span>High-Risk</span>
            <ArrowUpRight size={12} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {stats.high_risk_appointments}
          </div>
          <div className="text-[10px] text-orange-500 mt-1">Requires triage</div>
        </div>

        {/* Avg No-Show Risk */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Avg Risk
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.avg_no_show_probability}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Facility mean</div>
        </div>

        {/* Prediction Accuracy */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
            Accuracy
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.prediction_accuracy}%
          </div>
          <div className="text-[10px] text-purple-500 mt-1">Calibrated</div>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => onNavigate('alerts')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 shadow-sm hover:border-amber-400 transition cursor-pointer"
        >
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center justify-between">
            <span>Active Alerts</span>
            <ArrowUpRight size={12} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.active_alerts}
          </div>
          <div className="text-[10px] text-amber-500 mt-1">Pending follow-up</div>
        </div>
      </div>

      {/* Row 1: Charts (1. Appointment Outcome + 2. Risk Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Appointment Outcome */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                1. Appointment Outcome
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of Attended, No-Show, and Cancelled appointments
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Historical Total</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} visits`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: No-Show Risk Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                2. No-Show Risk Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appointments segmented by prediction risk classification tier
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">5 Tiers</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} appointments`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (3. Daily Appointment Volume + 4. No-Show Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Daily Appointment Volume */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                3. Daily Appointment Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total daily appointments vs attended vs no-show visits
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Last 14 Days</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.daily_volume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }} />
                <Area type="monotone" dataKey="total" stroke="#0284c7" fillOpacity={1} fill="url(#totalGrad)" name="Total Appts" />
                <Area type="monotone" dataKey="no_shows" stroke="#ef4444" fillOpacity={1} fill="url(#nsGrad)" name="No-Shows" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: No-Show Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                4. No-Show Trend (Actual vs Predicted)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly no-show percentage compared against prediction engine forecast
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Weekly Cadence</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.no_show_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} name="Actual No-Show %" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" name="Predicted Rate %" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Charts (5. Department Rates + 6. Top Risk Factors) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Department-wise No-Show Rate */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                5. Department-wise No-Show Rate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No-show percentage across clinical departments
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">7 Departments</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.department_rates}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'No-Show Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="no_show_rate" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Top No-Show Risk Factors */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                6. Top No-Show Risk Factors
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most frequent contributing indicators identified across predictions
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Feature Importance</span>
          </div>

          <div className="space-y-3.5 mt-2">
            {stats.top_risk_factors?.map((rf, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    {getRiskIcon(rf.icon)}
                    <span>{rf.factor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{rf.count} cases</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rf.percentage}%</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      rf.percentage >= 35 ? 'bg-red-500' :
                      rf.percentage >= 25 ? 'bg-orange-500' :
                      rf.percentage >= 20 ? 'bg-amber-500' : 'bg-hospital-500'
                    }`}
                    style={{ width: `${rf.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Bottleneck Detection Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 dark:text-hospital-400 uppercase tracking-wider">
              <Activity size={14} /> Automated System Intelligence
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Operational Bottleneck Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Heuristic patterns and actionable recommendations derived from appointment telemetry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.bottleneck_insights?.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.severity === 'critical'
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                  : item.severity === 'warning'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                  : 'bg-hospital-50/60 dark:bg-hospital-950/20 border-hospital-200 dark:border-hospital-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider bg-white dark:bg-slate-900 shadow-xs">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.metric_value}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  INSIGHT: {item.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.insight}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  RECOMMENDATION:
                </div>
                <p className="text-xs font-semibold text-hospital-700 dark:text-hospital-300 mt-0.5">
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
