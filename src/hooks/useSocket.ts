import { useEffect, useCallback, useState } from 'react';
import { socketService, AlertEvent, DashboardStatsEvent } from '../services/socketService';
import { useAuth } from './useAuth';

export function useSocket() {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    const connectSocket = async () => {
      try {
        await socketService.connect(token);
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Socket connection failed:', error);
        setConnectionError('Failed to connect to real-time server');
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  return { isConnected, connectionError };
}

// Hook for real-time alerts
export function useAlerts(onAlert?: (alert: AlertEvent) => void) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    const unsubscribe = socketService.on('alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
      onAlert?.(alert);
    });

    return unsubscribe;
  }, [onAlert]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  return { alerts, clearAlerts, dismissAlert };
}

// Hook for real-time dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStatsEvent | null>(null);

  useEffect(() => {
    const unsubscribe = socketService.on('dashboard:stats', (newStats) => {
      setStats(newStats);
    });

    return unsubscribe;
  }, []);

  return stats;
}

// Hook for machine location tracking
export function useMachineLocation(machineId: string | null) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!machineId) return;

    socketService.subscribeMachine(machineId);

    const unsubscribe = socketService.on('machine:location', (event) => {
      if (event.machineId === machineId) {
        setLocation(event.location);
      }
    });

    return () => {
      socketService.unsubscribeMachine(machineId);
      unsubscribe();
    };
  }, [machineId]);

  return location;
}

// Hook for machine status updates
export function useMachineStatus(machineId?: string) {
  const [statusUpdates, setStatusUpdates] = useState<
    Array<{ machineId: string; status: string; timestamp: string }>
  >([]);

  useEffect(() => {
    const unsubscribe = socketService.on('machine:status', (event) => {
      if (!machineId || event.machineId === machineId) {
        setStatusUpdates((prev) => [event, ...prev].slice(0, 20));
      }
    });

    return unsubscribe;
  }, [machineId]);

  return statusUpdates;
}

// Hook for job progress tracking
export function useJobProgress(jobId: string | null) {
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    socketService.subscribeJob(jobId);

    const unsubscribeProgress = socketService.on('job:progress', (event) => {
      if (event.jobId === jobId) {
        setProgress(event.progress);
        setStatus(event.status);
      }
    });

    const unsubscribeStatus = socketService.on('job:status', (event) => {
      if (event.jobId === jobId) {
        setStatus(event.status);
      }
    });

    return () => {
      socketService.unsubscribeJob(jobId);
      unsubscribeProgress();
      unsubscribeStatus();
    };
  }, [jobId]);

  return { progress, status };
}

// Hook for checklist submissions (for managers/admins)
export function useChecklistSubmissions() {
  const [submissions, setSubmissions] = useState<
    Array<{
      id: string;
      machineId: string;
      operatorName: string;
      issuesCount: number;
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    const unsubscribe = socketService.on('checklist:submitted', (event) => {
      setSubmissions((prev) => [event, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, []);

  return submissions;
}

export default useSocket;
