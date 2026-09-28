import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { AuditLogItem, UserRole } from '../types';
import { api } from '../services/api';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const AuditPage: React.FC<Props> = ({ currentRole }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const s = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.user.toLowerCase().includes(s) ||
      (log.target && log.target.toLowerCase().includes(s)) ||
      (log.details && log.details.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Compliance & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              HIPAA Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable system event log recording all predictions, reminder dispatches, alert transitions, and administrative operations.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Trail
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by action, user, or target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor / User</th>
                <th className="px-5 py-3.5">Operational Action</th>
                <th className="px-5 py-3.5">Target Record</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline mr-2" /> Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                      {log.user}
                    </td>
                    <td className="px-5 py-3 font-bold text-hospital-700 dark:text-hospital-300 font-sans">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {log.target || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate font-sans">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
