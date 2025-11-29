import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, StatusBadge } from '../../components/ui';
import { machinesApi, checklistsApi, jobsApi } from '../../services/api';
import { DashboardStats, Machine, Job } from '../../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMachines, setRecentMachines] = useState<Machine[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);

  const fetchData = async () => {
    try {
      const [machinesRes, jobsRes] = await Promise.all([
        machinesApi.getAll({ limit: 5 }),
        jobsApi.getAll({ limit: 5, status: 'in_progress' }),
      ]);

      setRecentMachines(machinesRes.machines || []);
      setActiveJobs(jobsRes.jobs || []);

      // Calculate stats
      setStats({
        activeMachines: machinesRes.machines?.filter((m: Machine) => m.status === 'active').length || 0,
        pendingChecklists: 3, // Would come from API
        activeJobs: jobsRes.jobs?.length || 0,
        alerts: 2, // Would come from API
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.firstName || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Aktif Makine"
            value={stats?.activeMachines || 0}
            icon="construct"
            color="#22C55E"
            bgColor="rgba(34, 197, 94, 0.15)"
          />
          <StatCard
            title="Bekleyen Kontrol"
            value={stats?.pendingChecklists || 0}
            icon="clipboard-outline"
            color="#F59E0B"
            bgColor="rgba(245, 158, 11, 0.15)"
          />
          <StatCard
            title="Aktif İş"
            value={stats?.activeJobs || 0}
            icon="briefcase-outline"
            color="#3B82F6"
            bgColor="rgba(59, 130, 246, 0.15)"
          />
          <StatCard
            title="Uyarı"
            value={stats?.alerts || 0}
            icon="warning-outline"
            color="#EF4444"
            bgColor="rgba(239, 68, 68, 0.15)"
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Yeni Kontrol</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Ionicons name="scan-outline" size={24} color="#22C55E" />
              </View>
              <Text style={styles.actionText}>QR Tara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Arıza Bildir</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Machines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Makineler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {recentMachines.length > 0 ? (
            recentMachines.map((machine) => (
              <Card key={machine.id} style={styles.machineCard}>
                <View style={styles.machineHeader}>
                  <View>
                    <Text style={styles.machineName}>{machine.name}</Text>
                    <Text style={styles.machineInfo}>
                      {machine.brand} • {machine.plateNumber}
                    </Text>
                  </View>
                  <StatusBadge status={machine.status} size="sm" />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz makine yok</Text>
            </Card>
          )}
        </View>

        {/* Active Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif İşler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <StatusBadge status={job.status} size="sm" />
                </View>
                {job.description && (
                  <Text style={styles.jobDescription} numberOfLines={2}>
                    {job.description}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aktif iş yok</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Dark tema renkleri
const COLORS = {
  primary: '#111827',
  secondary: '#F59E0B',
  card: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  quickActions: {
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  machineCard: {
    marginBottom: 10,
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  machineInfo: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  jobCard: {
    marginBottom: 10,
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  jobDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
