import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card, StatusBadge } from '../../components/ui';
import { machinesApi, checklistsApi, jobsApi } from '../../services/api';
import { DashboardStats, Machine, Job } from '../../types';
import { MainTabParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

// Default location (Istanbul)
const DEFAULT_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const getStatusColor = (status: Machine['status']) => {
  switch (status) {
    case 'active': return '#22C55E';
    case 'idle': return '#F59E0B';
    case 'maintenance': return '#EF4444';
    case 'out_of_service': return '#6B7280';
    default: return '#6B7280';
  }
};

type DashboardNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, bgColor, textColor, textSecondaryColor, borderColor, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: textSecondaryColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = theme.colors;
  const navigation = useNavigation<DashboardNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMachines, setRecentMachines] = useState<Machine[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [showMap, setShowMap] = useState(true);

  // Get machines with location for map
  const machinesWithLocation = recentMachines.filter(
    m => m.locationLat && m.locationLng
  );
  const jobsWithLocation = activeJobs.filter(
    j => j.locationLat && j.locationLng
  );

  const isOperator = user?.role === 'operator';

  const fetchData = async () => {
    try {
      // Operatör için sadece kendine atanan makineler ve işleri getir
      const [machinesRes, jobsRes] = await Promise.all([
        machinesApi.getAll({ limit: 10 }),
        jobsApi.getAll({ limit: 10 }),
      ]);

      // Handle different response formats safely for machines
      let machinesArray: Machine[] = [];
      if (Array.isArray(machinesRes)) {
        machinesArray = machinesRes;
      } else if (machinesRes && Array.isArray(machinesRes.machines)) {
        machinesArray = machinesRes.machines;
      } else if (machinesRes && Array.isArray(machinesRes.data)) {
        machinesArray = machinesRes.data;
      }

      // Operatör için sadece kendine atanan makineleri filtrele
      if (isOperator && user?.id) {
        machinesArray = machinesArray.filter(
          (m: Machine) => m.assignedOperatorId === user.id
        );
      }
      setRecentMachines(machinesArray.slice(0, 5));

      // Handle different response formats safely for jobs
      let jobsArray: Job[] = [];
      if (Array.isArray(jobsRes)) {
        jobsArray = jobsRes;
      } else if (jobsRes && Array.isArray(jobsRes.jobs)) {
        jobsArray = jobsRes.jobs;
      } else if (jobsRes && Array.isArray(jobsRes.data)) {
        jobsArray = jobsRes.data;
      }

      // Operatör için sadece kendine atanan işleri filtrele
      if (isOperator && user?.id) {
        jobsArray = jobsArray.filter(
          (j: Job) => j.assignments?.some((a: any) => a.userId === user.id) ||
                      j.assignedTo === user.id
        );
      }
      setActiveJobs(jobsArray.slice(0, 5));

      // Calculate stats
      setStats({
        activeMachines: machinesArray.filter((m: Machine) => m.status === 'active').length || 0,
        pendingChecklists: 3, // Would come from API
        activeJobs: jobsArray.filter((j: Job) => j.status === 'in_progress').length || 0,
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
    if (hour < 12) return t.dashboard.greeting.morning;
    if (hour < 18) return t.dashboard.greeting.afternoon;
    return t.dashboard.greeting.evening;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName || t.dashboard.user}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid - Operatör için farklı kartlar */}
        <View style={styles.statsGrid}>
          <StatCard
            title={isOperator ? t.dashboard.stats.myMachines || 'Makinelerim' : t.dashboard.stats.activeMachines}
            value={stats?.activeMachines || 0}
            icon="construct"
            color="#22C55E"
            bgColor="rgba(34, 197, 94, 0.15)"
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            borderColor={colors.cardBorder}
            onPress={isOperator ? undefined : () => navigation.navigate('Machines')}
          />
          <StatCard
            title={t.dashboard.stats.pendingChecklists}
            value={stats?.pendingChecklists || 0}
            icon="clipboard-outline"
            color="#F59E0B"
            bgColor="rgba(245, 158, 11, 0.15)"
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            borderColor={colors.cardBorder}
            onPress={() => navigation.navigate('Checklist')}
          />
          <StatCard
            title={isOperator ? t.dashboard.stats.myJobs || 'İşlerim' : t.dashboard.stats.activeJobs}
            value={stats?.activeJobs || 0}
            icon="briefcase-outline"
            color="#3B82F6"
            bgColor="rgba(59, 130, 246, 0.15)"
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            borderColor={colors.cardBorder}
            onPress={isOperator ? undefined : () => navigation.navigate('Jobs')}
          />
          {!isOperator && (
            <StatCard
              title={t.dashboard.stats.alerts}
              value={stats?.alerts || 0}
              icon="warning-outline"
              color="#EF4444"
              bgColor="rgba(239, 68, 68, 0.15)"
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              borderColor={colors.cardBorder}
              onPress={() => navigation.navigate('Approvals')}
            />
          )}
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.mapTitleRow}>
              <Ionicons name="map" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                {t.dashboard.sections.map || 'Canlı Harita'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowMap(!showMap)}>
              <Ionicons
                name={showMap ? "chevron-up" : "chevron-down"}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {showMap && (
            <Card style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  initialRegion={DEFAULT_REGION}
                  showsUserLocation
                  showsMyLocationButton={false}
                >
                  {/* Machine Markers */}
                  {machinesWithLocation.map((machine) => (
                    <Marker
                      key={`machine-${machine.id}`}
                      coordinate={{
                        latitude: Number(machine.locationLat),
                        longitude: Number(machine.locationLng),
                      }}
                      pinColor={getStatusColor(machine.status)}
                    >
                      <Callout>
                        <View style={styles.calloutContainer}>
                          <Text style={styles.calloutTitle}>{machine.name}</Text>
                          <Text style={styles.calloutSubtitle}>
                            {machine.brand} {machine.model}
                          </Text>
                          <View style={[styles.calloutStatus, { backgroundColor: `${getStatusColor(machine.status)}20` }]}>
                            <Text style={[styles.calloutStatusText, { color: getStatusColor(machine.status) }]}>
                              {machine.status === 'active' ? t.dashboard.map.active :
                               machine.status === 'idle' ? t.dashboard.map.idle :
                               machine.status === 'maintenance' ? t.dashboard.map.maintenance : t.dashboard.map.outOfService}
                            </Text>
                          </View>
                        </View>
                      </Callout>
                    </Marker>
                  ))}

                  {/* Job Markers */}
                  {jobsWithLocation.map((job) => (
                    <Marker
                      key={`job-${job.id}`}
                      coordinate={{
                        latitude: Number(job.locationLat),
                        longitude: Number(job.locationLng),
                      }}
                      pinColor="#F59E0B"
                    >
                      <Callout>
                        <View style={styles.calloutContainer}>
                          <Text style={styles.calloutTitle}>{job.title}</Text>
                          {job.locationName && (
                            <Text style={styles.calloutSubtitle}>{job.locationName}</Text>
                          )}
                          <Text style={styles.calloutProgress}>
                            {t.dashboard.map.progress}: {job.progress || 0}%
                          </Text>
                        </View>
                      </Callout>
                    </Marker>
                  ))}
                </MapView>

                {/* Map Legend */}
                <View style={[styles.mapLegend, { backgroundColor: colors.card }]}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t.dashboard.map.active}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t.dashboard.map.job}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t.dashboard.map.maintenance}</Text>
                  </View>
                </View>

                {/* Empty state */}
                {machinesWithLocation.length === 0 && jobsWithLocation.length === 0 && (
                  <View style={[styles.mapEmptyOverlay, { backgroundColor: `${colors.card}CC` }]}>
                    <Ionicons name="location-outline" size={32} color={colors.textSecondary} />
                    <Text style={[styles.mapEmptyText, { color: colors.textSecondary }]}>
                      {t.dashboard.map.noLocation}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        </View>

        {/* Makineler - Operatör için "Atanan Makinelerim" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isOperator ? (t.dashboard.sections.myMachines || 'Atanan Makinelerim') : t.dashboard.sections.machines}
            </Text>
            {!isOperator && (
              <TouchableOpacity onPress={() => navigation.navigate('Machines')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>{t.dashboard.sections.seeAll}</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentMachines.length > 0 ? (
            recentMachines.map((machine) => (
              <Card key={machine.id} style={[styles.machineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.machineHeader}>
                  <View>
                    <Text style={[styles.machineName, { color: colors.text }]}>{machine.name}</Text>
                    <Text style={[styles.machineInfo, { color: colors.textSecondary }]}>
                      {machine.brand} • {machine.plateNumber}
                    </Text>
                  </View>
                  <StatusBadge status={machine.status} size="sm" />
                </View>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isOperator ? (t.dashboard.empty.noAssignedMachines || 'Size atanmış makine bulunmuyor') : t.dashboard.empty.machines}
              </Text>
            </Card>
          )}
        </View>

        {/* İşler - Operatör için "Atanan İşlerim" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isOperator ? (t.dashboard.sections.myJobs || 'Atanan İşlerim') : t.dashboard.sections.activeJobs}
            </Text>
            {!isOperator && (
              <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>{t.dashboard.sections.seeAll}</Text>
              </TouchableOpacity>
            )}
          </View>

          {activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <Card key={job.id} style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.jobHeader}>
                  <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                  <StatusBadge status={job.status} size="sm" />
                </View>
                {job.description && (
                  <Text style={[styles.jobDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {job.description}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isOperator ? (t.dashboard.empty.noAssignedJobs || 'Size atanmış iş bulunmuyor') : t.dashboard.empty.jobs}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
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
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
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
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Map Styles
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  mapEmptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  calloutStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  calloutStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calloutProgress: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 4,
  },
  // Machine & Job Card Styles
  machineCard: {
    marginBottom: 10,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  machineInfo: {
    fontSize: 13,
  },
  jobCard: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  jobDescription: {
    fontSize: 13,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
  },
});
