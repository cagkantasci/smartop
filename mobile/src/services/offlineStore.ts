import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for offline queue
interface QueuedAction {
  id: string;
  type: 'checklist_submit' | 'location_update' | 'job_update';
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

interface CachedData {
  machines: any[];
  jobs: any[];
  checklistTemplates: any[];
  lastSync: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: QueuedAction[];
  cachedData: CachedData;
  lastSyncTime: number | null;

  // Actions
  setOnlineStatus: (status: boolean) => void;
  addPendingAction: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingAction: (id: string) => void;
  updateRetryCount: (id: string) => void;
  setCachedData: (data: Partial<CachedData>) => void;
  clearCache: () => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Offline store with persistence
export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingActions: [],
      cachedData: {
        machines: [],
        jobs: [],
        checklistTemplates: [],
        lastSync: 0,
      },
      lastSyncTime: null,

      setOnlineStatus: (status) => set({ isOnline: status }),

      addPendingAction: (action) => {
        const newAction: QueuedAction = {
          ...action,
          id: generateId(),
          timestamp: Date.now(),
          retryCount: 0,
        };
        set((state) => ({
          pendingActions: [...state.pendingActions, newAction],
        }));
      },

      removePendingAction: (id) => {
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        }));
      },

      updateRetryCount: (id) => {
        set((state) => ({
          pendingActions: state.pendingActions.map((a) =>
            a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
          ),
        }));
      },

      setCachedData: (data) => {
        set((state) => ({
          cachedData: { ...state.cachedData, ...data, lastSync: Date.now() },
          lastSyncTime: Date.now(),
        }));
      },

      clearCache: () => {
        set({
          cachedData: {
            machines: [],
            jobs: [],
            checklistTemplates: [],
            lastSync: 0,
          },
          pendingActions: [],
          lastSyncTime: null,
        });
      },
    }),
    {
      name: 'smartop-offline-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Network monitoring service
class NetworkService {
  private listeners: ((isOnline: boolean) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  init() {
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);
    // Check initial state
    NetInfo.fetch().then(this.handleNetworkChange);
  }

  private handleNetworkChange = (state: NetInfoState) => {
    const isOnline = state.isConnected && state.isInternetReachable !== false;
    useOfflineStore.getState().setOnlineStatus(isOnline ?? false);
    this.listeners.forEach((listener) => listener(isOnline ?? false));
  };

  addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export const networkService = new NetworkService();

// Sync service for processing offline queue
class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async processQueue() {
    const { isOnline, pendingActions, removePendingAction, updateRetryCount } =
      useOfflineStore.getState();

    if (!isOnline || this.isSyncing || pendingActions.length === 0) {
      return;
    }

    this.isSyncing = true;

    for (const action of pendingActions) {
      if (action.retryCount >= 3) {
        // Max retries reached, remove action
        console.log(`Max retries reached for action ${action.id}`);
        removePendingAction(action.id);
        continue;
      }

      try {
        await this.processAction(action);
        removePendingAction(action.id);
        console.log(`Action ${action.id} synced successfully`);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        updateRetryCount(action.id);
      }
    }

    this.isSyncing = false;
  }

  private async processAction(action: QueuedAction) {
    const { api } = await import('./api');

    switch (action.type) {
      case 'checklist_submit':
        await api.post('/checklists/submissions', action.payload);
        break;
      case 'location_update':
        await api.patch(`/machines/${action.payload.machineId}/location`, {
          lat: action.payload.lat,
          lng: action.payload.lng,
        });
        break;
      case 'job_update':
        await api.patch(`/jobs/${action.payload.jobId}`, action.payload.data);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  startAutoSync(intervalMs: number = 30000) {
    this.stopAutoSync();
    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, intervalMs);

    // Also sync when coming back online
    networkService.addListener((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();

// Hook for using offline capabilities
export function useOffline() {
  const { isOnline, pendingActions, cachedData, addPendingAction, setCachedData } =
    useOfflineStore();

  const submitChecklistOffline = (data: {
    machineId: string;
    templateId: string;
    entries: any[];
    notes?: string;
    locationLat?: number;
    locationLng?: number;
  }) => {
    addPendingAction({
      type: 'checklist_submit',
      payload: data,
    });
  };

  const updateLocationOffline = (machineId: string, lat: number, lng: number) => {
    addPendingAction({
      type: 'location_update',
      payload: { machineId, lat, lng },
    });
  };

  const updateJobOffline = (jobId: string, data: Record<string, any>) => {
    addPendingAction({
      type: 'job_update',
      payload: { jobId, data },
    });
  };

  return {
    isOnline,
    pendingActionsCount: pendingActions.length,
    cachedData,
    submitChecklistOffline,
    updateLocationOffline,
    updateJobOffline,
    setCachedData,
  };
}
