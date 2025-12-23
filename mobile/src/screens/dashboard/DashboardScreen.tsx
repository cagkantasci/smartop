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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
// Conditional import for react-native-maps (not supported on web)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  Callout = Maps.Callout;
}
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui';
import { machinesApi, jobsApi } from '../../services/api';
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

// Web Map Component using Leaflet (only loaded on web)
interface WebMapViewProps {
  machines: Machine[];
  jobs: Job[];
  getStatusColor: (status: Machine['status']) => string;
  t: any;
}

const WebMapView: React.FC<WebMapViewProps> = ({ machines, jobs, getStatusColor, t }) => {
  if (Platform.OS !== 'web') return null;

  // Dynamic imports for web
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
  const L = require('leaflet');

  // Fix Leaflet default marker icon
  React.useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Custom icon creator
  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />
      <MapContainer
        center={[DEFAULT_REGION.latitude, DEFAULT_REGION.longitude]}
        zoom={12}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        {machines.map((machine) => (
          <Marker
            key={`machine-${machine.id}`}
            position={[Number(machine.locationLat), Number(machine.locationLng)]}
            icon={createIcon(getStatusColor(machine.status))}
          >
            <Popup>
              <div style={{ padding: 4, minWidth: 120 }}>
                <strong style={{ color: '#1F2937' }}>{machine.name}</strong>
                <p style={{ margin: '4px 0', color: '#6B7280', fontSize: 12 }}>
                  {machine.brand} {machine.model}
                </p>
                <span style={{
                  backgroundColor: `${getStatusColor(machine.status)}20`,
                  color: getStatusColor(machine.status),
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {machine.status === 'active' ? t.dashboard.map.active :
                   machine.status === 'idle' ? t.dashboard.map.idle :
                   machine.status === 'maintenance' ? t.dashboard.map.maintenance : t.dashboard.map.outOfService}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
        {jobs.map((job) => (
          <Marker
            key={`job-${job.id}`}
            position={[Number(job.locationLat), Number(job.locationLng)]}
            icon={createIcon('#F59E0B')}
          >
            <Popup>
              <div style={{ padding: 4, minWidth: 120 }}>
                <strong style={{ color: '#1F2937' }}>{job.title}</strong>
                {job.locationName && (
                  <p style={{ margin: '4px 0', color: '#6B7280', fontSize: 12 }}>{job.locationName}</p>
                )}
                <p style={{ margin: 0, color: '#3B82F6', fontSize: 12 }}>
                  {t.dashboard.map.progress}: {job.progress || 0}%
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
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
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  // Get machines with location for map
  const machinesWithLocation = recentMachines.filter(
    m => m.locationLat && m.locationLng
  );
  const jobsWithLocation = activeJobs.filter(
    j => j.locationLat && j.locationLng
  );

  const isOperator = user?.role === 'operator';

  // Get current user location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setMapRegion(newRegion);

        // Animate map to user location if mapRef exists
        if (mapRef.current && Platform.OS !== 'web') {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

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
    getCurrentLocation();
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
        <View style={styles.headerLeft}>
          {/* User Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {user?.avatarUrl ? (
              <View style={styles.avatarImage}>
                {/* Image would go here if we had image support */}
              </View>
            ) : (
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                {user?.lastName?.charAt(0)?.toUpperCase() || ''}
              </Text>
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName || t.dashboard.user}</Text>
          </View>
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
                {Platform.OS === 'web' ? (
                  <WebMapView
                    machines={machinesWithLocation}
                    jobs={jobsWithLocation}
                    getStatusColor={getStatusColor}
                    t={t}
                  />
                ) : MapView ? (
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    initialRegion={mapRegion}
                    showsUserLocation
                    showsMyLocationButton
                    onMapReady={() => setMapReady(true)}
                    mapType="standard"
                    loadingEnabled={true}
                    loadingIndicatorColor="#3B82F6"
                    loadingBackgroundColor="#F3F4F6"
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
                ) : null}

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTextContainer: {
    flex: 1,
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
    marginLeft: 12,
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
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
  mapLoadingText: {
    fontSize: 14,
    marginTop: 12,
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
