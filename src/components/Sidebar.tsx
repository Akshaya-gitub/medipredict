import React from 'react';
import {
  LayoutDashboard,
  Brain,
  AlertTriangle,
  BellRing,
  History,
  Building2,
  BarChart3,
  ShieldAlert,
  Home,
  CheckCircle2,
  Info
} from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  activeView: string;
  onSelectView: (view: string) => void;
  currentRole: UserRole;
  highRiskCount?: number;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<Props> = ({
  activeView,
  onSelectView,
  currentRole,
  highRiskCount = 0,
  activeAlertsCount = 0
}) => {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'command_center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'predict', label: 'Risk Predictor', icon: Brain, highlight: true },
    { id: 'high_risk', label: 'High-Risk Queue', icon: AlertTriangle, badge: highRiskCount },
    { id: 'alerts', label: 'Alerts Center', icon: BellRing, badge: activeAlertsCount },
    { id: 'history', label: 'Appointment History', icon: History },
    { id: 'departments', label: 'Department Analytics', icon: Building2 },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Clinical Operations
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-hospital-500 text-white shadow-md shadow-hospital-500/25 dark:bg-hospital-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-hospital-500 dark:text-hospital-400' : 'text-slate-400 dark:text-slate-500'} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-hospital-600'
                          : 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role & Ethical Notice Card */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Active Role:</span>
            <span className="font-bold text-hospital-600 dark:text-hospital-400">{currentRole}</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            {currentRole === 'Administrator' ? 'Full operational & audit administration' :
             currentRole === 'Hospital Staff' ? 'Triage, prediction & reminder actions' :
             'Read-only observation privileges'}
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>
            Operational support tool. Non-clinical simulation model.
          </span>
        </div>
      </div>
    </aside>
  );
};
