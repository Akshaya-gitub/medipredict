import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { AppointmentItem, UserRole } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface Props {
  currentRole: UserRole;
  onNavigate: (view: string) => void;
}

export const HistoryPage: React.FC<Props> = ({ currentRole, onNavigate }) => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [page, statusFilter, riskFilter, deptFilter]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAppointments({
        page,
        page_size: 12,
        status: statusFilter,
        risk_level: riskFilter,
        department: deptFilter,
        search: search.trim()
      });
      setAppointments(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', 'Failed to load appointment records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAppointments();
  };

  const handleDelete = async (id: string) => {
    if (currentRole !== 'Administrator') {
      showToast('warning', 'Permission Required', 'Only Administrator role can delete appointment records.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete appointment ${id}? This action is logged in audit trail.`)) {
      return;
    }
    try {
      await api.deleteAppointment(id, currentRole);
      showToast('success', 'Deleted', `Appointment ${id} removed.`);
      loadAppointments();
    } catch (e: any) {
      showToast('error', 'Delete Failed', e.message);
    }
  };

  const exportCSV = () => {
    if (appointments.length === 0) return;
    const headers = ['ID', 'Patient ID', 'Department', 'Type', 'Date', 'Status', 'Risk Probability', 'Risk Level'];
    const rows = appointments.map(a => [
      a.id,
      a.patient_id,
      a.department,
      a.appointment_type,
      new Date(a.appointment_date).toISOString(),
      a.status,
      `${a.no_show_probability}%`,
      a.risk_level
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'hospital_appointment_registry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Complete', 'Downloaded appointments CSV');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Appointment History & Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {total} Total Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical attendance records, prediction scores, and outcomes across all hospital clinics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={loadAppointments}
            className="px-3.5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Patient ID, Appointment ID, or Department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-hospital-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Outcome:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="All">All Outcomes</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Attended">Attended</option>
              <option value="No-Show">No-Show</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="very_low">Likely to Attend</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
              <option value="very_high">Very High Risk</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Dental">Dental</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Appointment ID</th>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Department & Type</th>
                <th className="px-5 py-3.5">Appointment Date</th>
                <th className="px-5 py-3.5">No-Show Risk</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline mr-2" /> Loading records...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No appointment records match the selected criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      {apt.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">
                        {apt.patient_id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {apt.patient_name} ({apt.age}y)
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {apt.department}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {apt.appointment_type}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white">
                          {apt.no_show_probability}%
                        </span>
                        <RiskBadge level={apt.risk_level} size="sm" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        apt.status === 'Attended' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        apt.status === 'No-Show' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                        apt.status === 'Cancelled' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {currentRole === 'Administrator' && (
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 transition"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1 font-semibold"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1 font-semibold"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};
