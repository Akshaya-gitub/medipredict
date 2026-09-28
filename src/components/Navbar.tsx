import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  UserCheck,
  Eye,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { NotificationItem, UserRole } from '../types';
import { api } from '../services/api';

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (view: string) => void;
  onGlobalSearchSelect?: (result: any) => void;
}

export const Navbar: React.FC<Props> = ({
  currentRole,
  onRoleChange,
  isDarkMode,
  onToggleDarkMode,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.items);
      setUnreadCount(data.unread_count);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.getAppointments({ search: val.trim(), page_size: 5 });
      setSearchResults(res.items);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hospital-600 to-hospital-400 text-white flex items-center justify-center shadow-md shadow-hospital-500/20">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                MEDIPREDICT
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-hospital-100 dark:bg-hospital-900/70 text-hospital-700 dark:text-hospital-300 uppercase tracking-wider">
                Ops Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Hospital No-Show Risk Predictor
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:block max-w-md w-full mx-6">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Patient ID (e.g. P-10245), Dept, Appointment..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setIsSearching(true)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500 dark:focus:ring-hospital-400 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Appointments ({searchResults.length})
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsSearching(false);
                      onNavigate('history');
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>{item.patient_id}</span>
                        <span className="text-slate-400 font-normal">({item.patient_name})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.department} • {item.appointment_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.risk_level === 'very_high' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        item.risk_level === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                        item.risk_level === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {item.no_show_probability}% Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Role Switcher, Notifications, Dark/Light */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Engine Active (89.2% Acc)</span>
          </div>

          {/* Role Switcher */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">
                Role:
              </span>
              {(['Administrator', 'Hospital Staff', 'Viewer'] as UserRole[]).map((r) => {
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-hospital-600 dark:text-hospital-300 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r === 'Administrator' ? 'Admin' : r === 'Hospital Staff' ? 'Staff' : 'Viewer'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Center */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-hospital-100 dark:bg-hospital-950 text-hospital-700 dark:text-hospital-300">
                      {unreadCount} New
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 dark:text-hospital-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications available
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link) onNavigate(n.link.replace('/', ''));
                          setShowNotifications(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer rounded-xl transition ${
                          !n.is_read ? 'bg-hospital-50/50 dark:bg-hospital-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-hospital-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
};
