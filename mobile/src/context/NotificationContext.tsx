import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { checklistsApi, machinesApi } from '../services/api';

interface NotificationCounts {
  pendingChecklists: number;
  pendingApprovals: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  refreshCounts: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingChecklists: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(false);

  const refreshCounts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch pending checklist counts
      const [machinesRes, submissionsRes] = await Promise.all([
        machinesApi.getAll({ status: 'active' }),
        checklistsApi.getSubmissions(),
      ]);

      // Count active machines that need daily checklist
      let machinesArray: any[] = [];
      if (Array.isArray(machinesRes)) {
        machinesArray = machinesRes;
      } else if (machinesRes && Array.isArray(machinesRes.machines)) {
        machinesArray = machinesRes.machines;
      } else if (machinesRes && Array.isArray(machinesRes.data)) {
        machinesArray = machinesRes.data;
      }

      // Count pending approvals
      let submissionsArray: any[] = [];
      if (Array.isArray(submissionsRes)) {
        submissionsArray = submissionsRes;
      } else if (submissionsRes && Array.isArray(submissionsRes.submissions)) {
        submissionsArray = submissionsRes.submissions;
      } else if (submissionsRes && Array.isArray(submissionsRes.data)) {
        submissionsArray = submissionsRes.data;
      }

      const pendingApprovals = submissionsArray.filter(
        (s: any) => s.status === 'pending'
      ).length;

      // For checklists, show count of machines needing daily check
      // In a real app, this would check if today's checklist was completed
      const pendingChecklists = machinesArray.length > 0 ? machinesArray.length : 0;

      setCounts({
        pendingChecklists,
        pendingApprovals,
      });
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch counts on mount
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshCounts, 30000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  return (
    <NotificationContext.Provider value={{ counts, refreshCounts, loading }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
