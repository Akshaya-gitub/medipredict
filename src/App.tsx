import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastProvider, useToast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { PredictorPage } from './pages/PredictorPage';
import { HighRiskPage } from './pages/HighRiskPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditPage } from './pages/AuditPage';
import { DashboardStats, UserRole } from './types';
import { api } from './services/api';
import { ShieldCheck, Info } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('Hospital Staff');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadStats = async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNavigate={setActiveView}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          currentRole={currentRole}
          highRiskCount={stats?.high_risk_appointments || 0}
          activeAlertsCount={stats?.active_alerts || 0}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Mobile Navigation Pills */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'home', label: 'Overview' },
              { id: 'command_center', label: 'Command Center' },
              { id: 'predict', label: 'Predictor' },
              { id: 'high_risk', label: 'High Risk' },
              { id: 'alerts', label: 'Alerts' },
              { id: 'history', label: 'History' },
              { id: 'departments', label: 'Departments' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'audit', label: 'Audit Trail' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                  activeView === tab.id
                    ? 'bg-hospital-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Page View */}
          {activeView === 'home' && (
            <HomePage stats={stats} onNavigate={setActiveView} />
          )}

          {activeView === 'command_center' && (
            <CommandCenterPage stats={stats} onNavigate={setActiveView} />
          )}

          {activeView === 'predict' && (
            <PredictorPage
              currentRole={currentRole}
              onNavigate={setActiveView}
              onPredictionComplete={loadStats}
            />
          )}

          {activeView === 'high_risk' && (
            <HighRiskPage currentRole={currentRole} onNavigate={setActiveView} />
          )}

          {activeView === 'alerts' && (
            <AlertsPage currentRole={currentRole} onNavigate={setActiveView} />
          )}

          {activeView === 'history' && (
            <HistoryPage currentRole={currentRole} onNavigate={setActiveView} />
          )}

          {activeView === 'departments' && (
            <DepartmentsPage currentRole={currentRole} onNavigate={setActiveView} />
          )}

          {activeView === 'analytics' && (
            <AnalyticsPage stats={stats} currentRole={currentRole} onNavigate={setActiveView} />
          )}

          {activeView === 'audit' && (
            <AuditPage currentRole={currentRole} onNavigate={setActiveView} />
          )}
        </main>
      </div>

      {/* Hospital Footer & Ethical Operational Notice */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-hospital-600 dark:text-hospital-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Hospital No-Show Appointment Predictor
            </span>
            <span>• Healthcare Operations Intelligence</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Demonstration system using synthetic mock data. Ethical non-clinical decision support only.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
