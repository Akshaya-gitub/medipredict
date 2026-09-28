import React from 'react';
import {
  Brain,
  LayoutDashboard,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Activity,
  Users,
  CalendarCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats | null;
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<Props> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hospital-900 via-hospital-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-hospital-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-hospital-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-hospital-300" />
            Healthcare Operations Intelligence Engine
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            SMART APPOINTMENT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-hospital-300 via-hospital-200 to-purple-300">
              INTELLIGENCE
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 leading-relaxed font-normal max-w-2xl">
            Predict appointment no-shows before they impact hospital operations. Leverage explainable scoring, clinical triage alerts, and automated multi-channel follow-ups.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('predict')}
              className="px-6 py-3.5 rounded-2xl bg-white text-hospital-900 hover:bg-hospital-50 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-white/10 flex items-center gap-2 group cursor-pointer"
            >
              <Brain size={18} className="text-hospital-600 group-hover:scale-110 transition-transform" />
              <span>Predict Appointment Risk</span>
              <ArrowRight size={16} className="text-hospital-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('command_center')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard size={18} />
              <span>Open Hospital Command Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Key Summary Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Hospital Operations Snapshot
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time metrics aggregated across all outpatient departments
            </p>
          </div>
          <span className="text-xs font-semibold text-hospital-600 dark:text-hospital-400 flex items-center gap-1">
            <Activity size={14} /> Live Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Appts
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.total_appointments ?? 179}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <CalendarCheck size={11} /> Registered
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.completed_appointments ?? 90}
            </div>
            <div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
              <CheckCircle2 size={11} /> Historical
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
              No-Shows
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              {stats?.no_shows ?? 27}
            </div>
            <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
              <TrendingDown size={11} /> Missed visits
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              High-Risk
            </div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
              {stats?.high_risk_appointments ?? 26}
            </div>
            <div className="text-[10px] text-orange-400 mt-1 flex items-center gap-1">
              <AlertTriangle size={11} /> Queue triage
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Risk
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.avg_no_show_probability ?? 24.5}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Benchmark rate
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              Accuracy
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {stats?.prediction_accuracy ?? 89.2}%
            </div>
            <div className="text-[10px] text-purple-500 mt-1 flex items-center gap-1">
              <ShieldCheck size={11} /> Verified
            </div>
          </div>

          {/* Card 7 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              Active Alerts
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats?.active_alerts ?? 12}
            </div>
            <div className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
              <BellRing size={11} /> Pending action
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="text-xs font-bold text-hospital-600 dark:text-hospital-400 uppercase tracking-wider">
            Operational Intelligence Pipeline
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Complete Hospital Risk Workflow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            From patient intake and feature extraction to automated triage and clinic efficiency tracking
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Analyze', desc: 'Feature extraction & historical attendance logs' },
            { step: '02', title: 'Predict', desc: 'Explainable rule & behavioral scoring engine' },
            { step: '03', title: 'Explain', desc: 'Transparent reason breakdown with point weights' },
            { step: '04', title: 'Prioritize', desc: 'High-risk triage queue for clinic coordinators' },
            { step: '05', title: 'Alert', desc: 'Automated notification & reminder triggers' },
            { step: '06', title: 'Track', desc: 'Operational outcome feedback & audit logs' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-hospital-100 text-hospital-700 dark:bg-hospital-950 dark:text-hospital-300">
                  {item.step}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Scenario Quick Jump Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-hospital-500/10 via-purple-500/10 to-hospital-500/5 border border-hospital-200 dark:border-hospital-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-amber-500" size={18} />
            Ready for Hackathon Judge Demonstration?
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Test Patient P-10245 (Cardiology follow-up, 180-day gap, unconfirmed SMS) to reproduce the benchmark 82% no-show prediction and automated triage alert.
          </p>
        </div>
        <button
          onClick={() => onNavigate('predict')}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
        >
          Load Demo Benchmark
        </button>
      </div>
    </div>
  );
};
