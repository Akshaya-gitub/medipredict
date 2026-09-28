import {
  DashboardStats,
  PredictionRequest,
  PredictionResponse,
  AppointmentItem,
  AlertItem,
  NotificationItem,
  AuditLogItem,
  DepartmentItem,
  UserRole
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  async getDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  },

  async predict(request: PredictionRequest, role: UserRole = 'Hospital Staff'): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      },
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async getAppointments(params: {
    status?: string;
    risk_level?: string;
    department?: string;
    search?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
  }): Promise<{ total: number; page: number; page_size: number; total_pages: number; items: AppointmentItem[] }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.risk_level && params.risk_level !== 'All') query.set('risk_level', params.risk_level);
    if (params.department && params.department !== 'All') query.set('department', params.department);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.page_size) query.set('page_size', params.page_size.toString());
    if (params.sort_by) query.set('sort_by', params.sort_by);

    const res = await fetch(`${API_BASE}/appointments?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async getAppointment(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch appointment details');
    return res.json();
  },

  async getHighRiskAppointments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/high-risk`);
    if (!res.ok) throw new Error('Failed to fetch high-risk appointments');
    return res.json();
  },

  async getAlerts(status?: string, risk_level?: string): Promise<AlertItem[]> {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.set('status', status);
    if (risk_level && risk_level !== 'All') query.set('risk_level', risk_level);

    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async updateAlertAction(
    alertId: string,
    status: string,
    actionTaken: string,
    role: UserRole = 'Hospital Staff'
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      },
      body: JSON.stringify({ status, action_taken: actionTaken })
    });
    if (!res.ok) throw new Error('Failed to update alert');
    return res.json();
  },

  async sendReminder(appointmentId: string, role: UserRole = 'Hospital Staff'): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/remind`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      }
    });
    if (!res.ok) throw new Error('Failed to send reminder');
    return res.json();
  },

  async getNotifications(): Promise<{ unread_count: number; items: NotificationItem[] }> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: number): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
  },

  async getDepartments(): Promise<DepartmentItem[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async deleteAppointment(id: string, role: UserRole = 'Administrator'): Promise<void> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': role
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete record' }));
      throw new Error(err.detail || 'Delete failed');
    }
  }
};
