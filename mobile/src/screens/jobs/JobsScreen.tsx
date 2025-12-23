import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Conditional import for react-native-maps (not supported on web)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
import * as Location from 'expo-location';
import { Card, StatusBadge, Button, Input } from '../../components/ui';
import { jobsApi, machinesApi } from '../../services/api';
import { Job, JobStatus, JobPriority, Machine } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, interpolate } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'in_progress':
      return '#3B82F6';
    case 'completed':
      return '#22C55E';
    case 'delayed':
      return '#EF4444';
    case 'scheduled':
      return '#F59E0B';
    case 'cancelled':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};


const getPriorityIcon = (priority: JobPriority) => {
  switch (priority) {
    case 'urgent':
      return 'alert-circle';
    case 'high':
      return 'arrow-up-circle';
    case 'medium':
      return 'remove-circle';
    case 'low':
      return 'arrow-down-circle';
    default:
      return 'remove-circle';
  }
};

const getPriorityColor = (priority: JobPriority) => {
  switch (priority) {
    case 'urgent':
      return '#EF4444';
    case 'high':
      return '#F59E0B';
    case 'medium':
      return '#3B82F6';
    case 'low':
      return '#22C55E';
    default:
      return '#6B7280';
  }
};


// Default location (Istanbul)
const DEFAULT_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Web Map Picker Component using Leaflet (only loaded on web)
interface WebMapPickerProps {
  selectedLocation: { latitude: number; longitude: number } | null;
  onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
  currentRegion: Region;
}

const WebMapPicker: React.FC<WebMapPickerProps> = ({ selectedLocation, onMapPress, currentRegion }) => {
  if (Platform.OS !== 'web') return null;

  const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');
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

  const MapClickHandler = () => {
    useMapEvents({
      click: (e: any) => {
        onMapPress({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });
    return null;
  };

  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />
      <MapContainer
        center={[currentRegion.latitude, currentRegion.longitude]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        <MapClickHandler />
        {selectedLocation && (
          <Marker
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={createIcon('#F59E0B')}
          />
        )}
      </MapContainer>
    </div>
  );
};

export function JobsScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const colors = theme.colors;

  const isOperator = user?.role === 'operator';
  const mapRef = useRef<MapView>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [showMyJobsOnly, setShowMyJobsOnly] = useState(false); // Default: show all jobs
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingJob, setIsUpdatingJob] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [mapPickerLoading, setMapPickerLoading] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    locationName: '',
    locationLat: null as number | null,
    locationLng: null as number | null,
    priority: 'medium' as JobPriority,
  });

  const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
    { label: t.jobs.status.all, value: 'all' },
    { label: t.jobs.status.inProgress, value: 'in_progress' },
    { label: t.common.pending, value: 'scheduled' },
    { label: t.jobs.status.cancelled, value: 'delayed' },
    { label: t.jobs.status.completed, value: 'completed' },
  ];

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case 'in_progress': return t.jobs.status.inProgress;
      case 'completed': return t.jobs.status.completed;
      case 'delayed': return t.jobs.status.cancelled;
      case 'scheduled': return t.common.pending;
      case 'cancelled': return t.jobs.status.cancelled;
      default: return status;
    }
  };

  const getPriorityLabel = (priority: JobPriority) => {
    switch (priority) {
      case 'urgent': return t.jobs.priority.urgent;
      case 'high': return t.jobs.priority.high;
      case 'medium': return t.jobs.priority.medium;
      case 'low': return t.jobs.priority.low;
      default: return priority;
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll();

      // Handle different response formats safely
      let jobsArray: Job[] = [];
      if (Array.isArray(response)) {
        jobsArray = response;
      } else if (response && Array.isArray(response.jobs)) {
        jobsArray = response.jobs;
      } else if (response && Array.isArray(response.data)) {
        jobsArray = response.data;
      }

      // Debug: Find jobs with operator assignments
      const jobsWithOperatorAssignments = jobsArray.filter(j =>
        j.jobAssignments?.some(a => a.operatorId)
      );

      // Log for debugging
      console.log('[DEBUG] User ID:', user?.id);
      console.log('[DEBUG] Total jobs:', jobsArray.length);
      console.log('[DEBUG] Jobs with operator assignments:', jobsWithOperatorAssignments.length);

      if (jobsWithOperatorAssignments.length > 0) {
        const firstJob = jobsWithOperatorAssignments[0];
        const operatorAssignment = firstJob.jobAssignments?.find(a => a.operatorId);
        console.log('[DEBUG] First assigned job operatorId:', operatorAssignment?.operatorId);
      }

      setJobs(jobsArray);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Alert.alert('Hata', 'İşler yüklenemedi: ' + (error as Error).message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await machinesApi.getAll({ status: 'active' });
      let machinesArray: Machine[] = [];
      if (Array.isArray(response)) {
        machinesArray = response;
      } else if (response && Array.isArray(response.machines)) {
        machinesArray = response.machines;
      } else if (response && Array.isArray(response.data)) {
        machinesArray = response.data;
      }
      setMachines(machinesArray);
    } catch (error) {
      console.error('Failed to load machines:', error);
      setMachines([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMachines();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let result = jobs;

    // Filter by user assignment if showMyJobsOnly is enabled
    if (showMyJobsOnly && user?.id) {
      result = result.filter((job) => {
        // Check if user is assigned as operator to this job
        const hasOperatorAssignment = job.jobAssignments?.some(a => a.operatorId === user.id);
        return hasOperatorAssignment;
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }
    setFilteredJobs(result);
  }, [jobs, statusFilter, showMyJobsOnly, user?.id]);

  const getCurrentLocation = async () => {
    setMapPickerLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setCurrentRegion(newRegion);

        // Animate map to user location
        if (mapRef.current && Platform.OS !== 'web') {
          setTimeout(() => {
            mapRef.current?.animateToRegion(newRegion, 1000);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setMapPickerLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleSelectLocation = () => {
    if (selectedLocation) {
      setNewJob((prev) => ({
        ...prev,
        locationLat: selectedLocation.latitude,
        locationLng: selectedLocation.longitude,
      }));
      setShowMapPickerModal(false);
    }
  };

  const toggleMachineSelection = (machineId: string) => {
    setSelectedMachineIds((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    );
  };

  const handleAddJob = async () => {
    if (!newJob.title) {
      Alert.alert('Hata', 'Lütfen iş başlığı girin');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobsApi.create({
        title: newJob.title,
        description: newJob.description,
        locationName: newJob.locationName,
        locationLat: newJob.locationLat,
        locationLng: newJob.locationLng,
        priority: newJob.priority,
        status: 'scheduled',
        machineIds: selectedMachineIds.length > 0 ? selectedMachineIds : undefined,
      });
      Alert.alert('Başarılı', 'İş başarıyla eklendi');
      setShowAddModal(false);
      setNewJob({ title: '', description: '', locationName: '', locationLat: null, locationLng: null, priority: 'medium' });
      setSelectedLocation(null);
      setSelectedMachineIds([]);
      fetchJobs();
    } catch (error) {
      Alert.alert('Hata', 'İş eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleStartJob = async () => {
    if (!selectedJob) return;

    setIsUpdatingJob(true);
    try {
      await jobsApi.start(selectedJob.id);
      Alert.alert('Başarılı', 'İş başlatıldı');
      fetchJobs();
      setShowDetailModal(false);
    } catch (error) {
      Alert.alert('Hata', 'İş başlatılamadı');
    } finally {
      setIsUpdatingJob(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;

    Alert.alert(
      'İşi Tamamla',
      'Bu işi tamamlamak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: async () => {
            setIsUpdatingJob(true);
            try {
              await jobsApi.complete(selectedJob.id);
              Alert.alert('Başarılı', 'İş tamamlandı');
              fetchJobs();
              setShowDetailModal(false);
            } catch (error) {
              Alert.alert('Hata', 'İş tamamlanamadı');
            } finally {
              setIsUpdatingJob(false);
            }
          },
        },
      ]
    );
  };

  const renderJobItem = ({ item }: { item: Job }) => {
    // Debug log
    console.log(`[DEBUG] Rendering job ${item.id}: jobAssignments =`, item.jobAssignments?.length ?? 'undefined');

    return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => openJobDetail(item)}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.priorityBadge}>
            <Ionicons
              name={getPriorityIcon(item.priority) as any}
              size={20}
              color={getPriorityColor(item.priority)}
            />
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            {item.locationName && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={styles.locationText}>{item.locationName}</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>İlerleme</Text>
            <Text style={styles.progressValue}>{item.progress || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.progress || 0}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.jobDetails}>
          {item.scheduledStart && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {new Date(item.scheduledStart).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}
          {(item.locationLat && item.locationLng) && (
            <View style={styles.detailItem}>
              <Ionicons name="map-outline" size={16} color="#22C55E" />
              <Text style={styles.detailText}>Konum Var</Text>
            </View>
          )}
          {/* Machine count - always show if assignments exist */}
          {item.jobAssignments && item.jobAssignments.length > 0 ? (
            <View style={styles.detailItem}>
              <Ionicons name="construct-outline" size={16} color="#F59E0B" />
              <Text style={[styles.detailText, { color: '#F59E0B' }]}>
                {item.jobAssignments.filter(a => a.machine).length} Makine
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    // Count jobs assigned to current user
    const myAssignedJobs = jobs.filter(job =>
      job.jobAssignments?.some(a => a.operatorId === user?.id)
    );

    // Find all operator assignments in all jobs
    const allOperatorAssignments = jobs.flatMap(job =>
      job.jobAssignments?.filter(a => a.operatorId) || []
    );

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>İş Bulunamadı</Text>
        <Text style={styles.emptyText}>
          {showMyJobsOnly
            ? `Size atanmış iş yok (Toplam ${jobs.length} iş var)`
            : statusFilter !== 'all'
              ? 'Seçili durumda iş bulunamadı'
              : 'Henüz kayıtlı iş yok'}
        </Text>
        {showMyJobsOnly && (
          <>
            <Text style={[styles.emptyText, { marginTop: 12, fontSize: 12, color: '#F59E0B' }]}>
              Giriş yapan: {user?.firstName} {user?.lastName} ({user?.role})
            </Text>
            <Text style={[styles.emptyText, { marginTop: 4, fontSize: 11, color: '#9CA3AF' }]}>
              ID: {user?.id?.substring(0, 8)}...
            </Text>
            {user?.role === 'admin' && (
              <Text style={[styles.emptyText, { marginTop: 12, fontSize: 13, color: '#EF4444' }]}>
                ⚠️ Admin olarak giriş yaptınız. Operatör hesabıyla giriş yapın.
              </Text>
            )}
            {allOperatorAssignments.length > 0 && (
              <Text style={[styles.emptyText, { marginTop: 8, fontSize: 11, color: '#6B7280' }]}>
                (İşlere atanmış operatör: {allOperatorAssignments[0]?.operatorId?.substring(0, 8)}...)
              </Text>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.jobs.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {interpolate(t.jobs.subtitle, { count: filteredJobs.length })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Toggle - Show for all users */}
      <View style={[styles.operatorFilterContainer, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            style={[
              styles.myJobsToggle,
              { backgroundColor: showMyJobsOnly ? '#3B82F6' : colors.activeBackground },
            ]}
            onPress={() => setShowMyJobsOnly(!showMyJobsOnly)}
          >
            <Ionicons
              name={showMyJobsOnly ? 'person' : 'people'}
              size={18}
              color={showMyJobsOnly ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.myJobsToggleText,
                { color: showMyJobsOnly ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {showMyJobsOnly ? 'Bana Atanan İşler' : 'Tüm İşler'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: statusFilter === item.value ? colors.primary : colors.activeBackground },
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: statusFilter === item.value ? colors.background : colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Add Job Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Yeni İş Ekle</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="İş Başlığı *"
              placeholder="örn: Temel Kazı Çalışması"
              value={newJob.title}
              onChangeText={(text) => setNewJob((prev) => ({ ...prev, title: text }))}
            />
            <Input
              label="Açıklama"
              placeholder="İş detayları..."
              value={newJob.description}
              onChangeText={(text) => setNewJob((prev) => ({ ...prev, description: text }))}
              multiline
            />
            <Input
              label="Lokasyon Adı"
              placeholder="örn: Kadıköy Şantiye"
              value={newJob.locationName}
              onChangeText={(text) => setNewJob((prev) => ({ ...prev, locationName: text }))}
            />

            {/* Map Location Picker Button */}
            <Text style={styles.inputLabel}>Harita Konumu</Text>
            <TouchableOpacity
              style={styles.mapPickerButton}
              onPress={() => setShowMapPickerModal(true)}
            >
              {newJob.locationLat && newJob.locationLng ? (
                <View style={styles.locationSelected}>
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  <Text style={styles.locationSelectedText}>
                    Konum Seçildi ({newJob.locationLat.toFixed(4)}, {newJob.locationLng.toFixed(4)})
                  </Text>
                </View>
              ) : (
                <View style={styles.locationNotSelected}>
                  <Ionicons name="map-outline" size={24} color="#F59E0B" />
                  <Text style={styles.locationNotSelectedText}>Haritadan Konum Seç</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Text style={styles.priorityLabel}>Öncelik</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high', 'urgent'] as JobPriority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newJob.priority === priority && styles.priorityOptionActive,
                    { borderColor: getPriorityColor(priority) },
                  ]}
                  onPress={() => setNewJob((prev) => ({ ...prev, priority }))}
                >
                  <Ionicons
                    name={getPriorityIcon(priority) as any}
                    size={20}
                    color={newJob.priority === priority ? '#FFFFFF' : getPriorityColor(priority)}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      newJob.priority === priority && styles.priorityTextActive,
                    ]}
                  >
                    {getPriorityLabel(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Machine Selection */}
            <Text style={styles.inputLabel}>Makine Seçimi</Text>
            <View style={styles.machineSelectionContainer}>
              {machines.length === 0 ? (
                <Text style={styles.noMachinesText}>Makine bulunamadı</Text>
              ) : (
                machines.map((machine) => {
                  const isSelected = selectedMachineIds.includes(machine.id);
                  return (
                    <TouchableOpacity
                      key={machine.id}
                      style={[
                        styles.machineOption,
                        isSelected && styles.machineOptionSelected,
                      ]}
                      onPress={() => toggleMachineSelection(machine.id)}
                    >
                      <View style={[styles.machineCheckbox, isSelected && styles.machineCheckboxSelected]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.machineOptionInfo}>
                        <Text style={[styles.machineOptionName, isSelected && styles.machineOptionNameSelected]}>
                          {machine.name}
                        </Text>
                        <Text style={styles.machineOptionDetails}>
                          {machine.brand} • {machine.plateNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
            {selectedMachineIds.length > 0 && (
              <Text style={styles.selectedMachinesCount}>
                {selectedMachineIds.length} makine seçildi
              </Text>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="İş Ekle"
              onPress={handleAddJob}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPickerModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapPickerModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowMapPickerModal(false);
                setSelectedLocation(null);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Konum Seç</Text>
            <TouchableOpacity
              onPress={handleSelectLocation}
              style={[styles.selectButton, !selectedLocation && styles.selectButtonDisabled]}
              disabled={!selectedLocation}
            >
              <Text style={[styles.selectButtonText, !selectedLocation && styles.selectButtonTextDisabled]}>
                Seç
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {mapPickerLoading && Platform.OS !== 'web' && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.mapLoadingText}>Konum alınıyor...</Text>
              </View>
            )}
            {Platform.OS === 'web' ? (
              <WebMapPicker
                selectedLocation={selectedLocation}
                onMapPress={(coord) => setSelectedLocation(coord)}
                currentRegion={currentRegion}
              />
            ) : MapView ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={currentRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
                onMapReady={() => setMapPickerLoading(false)}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    pinColor="#F59E0B"
                  />
                )}
              </MapView>
            ) : null}

            {/* Instruction Overlay */}
            <View style={styles.mapInstructionContainer}>
              <View style={styles.mapInstruction}>
                <Ionicons name="finger-print-outline" size={20} color="#F59E0B" />
                <Text style={styles.mapInstructionText}>
                  İşin yapılacağı konumu seçmek için haritaya dokunun
                </Text>
              </View>
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.myLocationButton}
              onPress={getCurrentLocation}
              disabled={mapPickerLoading}
            >
              <Ionicons
                name="locate"
                size={24}
                color={mapPickerLoading ? '#9CA3AF' : '#3B82F6'}
              />
            </TouchableOpacity>

            {/* Selected Location Info */}
            {selectedLocation && (
              <View style={styles.selectedLocationInfo}>
                <Ionicons name="location" size={18} color="#22C55E" />
                <Text style={styles.selectedLocationText}>
                  {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Job Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedJob && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>İş Detayı</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Job Header */}
              <View style={styles.detailHeader}>
                <View style={[styles.detailPriorityBadge, { backgroundColor: `${getPriorityColor(selectedJob.priority)}20` }]}>
                  <Ionicons
                    name={getPriorityIcon(selectedJob.priority) as any}
                    size={24}
                    color={getPriorityColor(selectedJob.priority)}
                  />
                </View>
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailTitle}>{selectedJob.title}</Text>
                  <Text style={styles.detailPriorityText}>{getPriorityLabel(selectedJob.priority)} Öncelik</Text>
                </View>
                <View style={[styles.detailStatusBadge, { backgroundColor: `${getStatusColor(selectedJob.status)}20` }]}>
                  <Text style={[styles.detailStatusText, { color: getStatusColor(selectedJob.status) }]}>
                    {getStatusLabel(selectedJob.status)}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {selectedJob.description && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Açıklama</Text>
                  <Text style={styles.detailDescription}>{selectedJob.description}</Text>
                </Card>
              )}

              {/* Progress */}
              <Card style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>İlerleme</Text>
                <View style={styles.detailProgressContainer}>
                  <View style={styles.detailProgressBar}>
                    <View
                      style={[
                        styles.detailProgressFill,
                        {
                          width: `${selectedJob.progress || 0}%`,
                          backgroundColor: getStatusColor(selectedJob.status),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.detailProgressText}>{selectedJob.progress || 0}%</Text>
                </View>
              </Card>

              {/* Location Info */}
              {selectedJob.locationName && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Lokasyon</Text>
                  <View style={styles.detailLocationRow}>
                    <Ionicons name="location" size={20} color="#EF4444" />
                    <Text style={styles.detailLocationText}>{selectedJob.locationName}</Text>
                  </View>
                </Card>
              )}

              {/* Location Coordinates */}
              {selectedJob.locationLat && selectedJob.locationLng && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Konum Koordinatları</Text>
                  <View style={styles.detailLocationRow}>
                    <Ionicons name="navigate" size={20} color="#F59E0B" />
                    <Text style={styles.detailLocationText}>
                      {selectedJob.locationLat.toFixed(6)}, {selectedJob.locationLng.toFixed(6)}
                    </Text>
                  </View>
                </Card>
              )}

              {/* Assigned Machines */}
              {selectedJob.jobAssignments && selectedJob.jobAssignments.filter(a => a.machine).length > 0 && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Atanan Makineler</Text>
                  {selectedJob.jobAssignments.filter(a => a.machine).map((assignment) => (
                    <View key={assignment.id} style={styles.assignedMachineRow}>
                      <Ionicons name="construct" size={18} color="#F59E0B" />
                      <Text style={styles.assignedMachineName}>{assignment.machine?.name}</Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* Assigned Operators */}
              {selectedJob.jobAssignments && selectedJob.jobAssignments.filter(a => a.operator).length > 0 && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Atanan Operatörler</Text>
                  {selectedJob.jobAssignments.filter(a => a.operator).map((assignment) => (
                    <View key={assignment.id} style={styles.assignedOperatorRow}>
                      <View style={styles.operatorAvatar}>
                        <Ionicons name="person" size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.assignedOperatorName}>
                        {assignment.operator?.firstName} {assignment.operator?.lastName}
                      </Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* Schedule Info */}
              {selectedJob.scheduledStart && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Zamanlama</Text>
                  <View style={styles.detailScheduleRow}>
                    <Ionicons name="calendar-outline" size={18} color="#F59E0B" />
                    <View style={styles.detailScheduleInfo}>
                      <Text style={styles.detailScheduleLabel}>Başlangıç</Text>
                      <Text style={styles.detailScheduleValue}>
                        {new Date(selectedJob.scheduledStart).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  {selectedJob.scheduledEnd && (
                    <View style={styles.detailScheduleRow}>
                      <Ionicons name="calendar" size={18} color="#22C55E" />
                      <View style={styles.detailScheduleInfo}>
                        <Text style={styles.detailScheduleLabel}>Bitiş</Text>
                        <Text style={styles.detailScheduleValue}>
                          {new Date(selectedJob.scheduledEnd).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                  )}
                </Card>
              )}

              {/* Action Buttons - Show for users assigned to this job */}
              {selectedJob.jobAssignments?.some(a => a.operatorId === user?.id) && (
                <View style={styles.actionButtonsContainer}>
                  {/* Start Job Button - Show only for scheduled jobs */}
                  {selectedJob.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.startButton]}
                      onPress={handleStartJob}
                      disabled={isUpdatingJob}
                    >
                      <Ionicons name="play-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        {isUpdatingJob ? 'Başlatılıyor...' : 'İşi Başlat'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Complete Job Button - Show only for in_progress jobs */}
                  {selectedJob.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={handleCompleteJob}
                      disabled={isUpdatingJob}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        {isUpdatingJob ? 'Tamamlanıyor...' : 'İşi Tamamla'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Job Completed Message */}
                  {selectedJob.status === 'completed' && (
                    <View style={[styles.actionButton, styles.completedInfo]}>
                      <Ionicons name="checkmark-done-circle" size={24} color="#22C55E" />
                      <Text style={[styles.actionButtonText, { color: '#22C55E' }]}>
                        Bu iş tamamlandı
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterContainer: {
    borderBottomWidth: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
      },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
        marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
      },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
      },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
      },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
        marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
        marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
        textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
      },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
        borderBottomWidth: 1,
      },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
      },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
        borderTopWidth: 1,
      },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
        marginBottom: 8,
    marginTop: 16,
  },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
        borderRadius: 12,
    borderWidth: 1,
        marginBottom: 16,
  },
  locationSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationSelectedText: {
    fontSize: 14,
    color: '#22C55E',
    marginLeft: 10,
  },
  locationNotSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationNotSelectedText: {
    fontSize: 14,
        marginLeft: 10,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '500',
        marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  priorityOptionActive: {
          },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
        marginTop: 4,
  },
  priorityTextActive: {
      },
  // Map Modal styles
  mapModalContainer: {
    flex: 1,
      },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
        borderBottomWidth: 1,
      },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
        borderRadius: 8,
  },
  selectButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
      },
  selectButtonTextDisabled: {
      },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapInstructionContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  mapInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapInstructionText: {
    fontSize: 13,
        marginLeft: 10,
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  mapLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedLocationInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectedLocationText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  // Detail Modal styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailPriorityBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
      },
  detailPriorityText: {
    fontSize: 14,
        marginTop: 4,
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailCard: {
    marginBottom: 16,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: '600',
        marginBottom: 12,
  },
  detailDescription: {
    fontSize: 14,
        lineHeight: 22,
  },
  detailProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  detailProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailProgressText: {
    fontSize: 16,
    fontWeight: '700',
        marginLeft: 12,
    width: 50,
    textAlign: 'right',
  },
  detailLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLocationText: {
    fontSize: 15,
        marginLeft: 10,
  },
  detailMapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailMap: {
    width: '100%',
    height: '100%',
  },
  detailScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailScheduleInfo: {
    marginLeft: 12,
  },
  detailScheduleLabel: {
    fontSize: 12,
      },
  detailScheduleValue: {
    fontSize: 15,
    fontWeight: '500',
        marginTop: 2,
  },
  // Machine Selection styles
  machineSelectionContainer: {
    marginBottom: 16,
  },
  noMachinesText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  machineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  machineOptionSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  machineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  machineCheckboxSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  machineOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  machineOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  machineOptionNameSelected: {
    color: '#F59E0B',
  },
  machineOptionDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  selectedMachinesCount: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 4,
  },
  assignedMachineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  assignedMachineName: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  // Operator filter toggle styles
  operatorFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  myJobsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  myJobsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Assigned Operator styles
  assignedOperatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  operatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedOperatorName: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  // Action buttons styles
  actionButtonsContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  startButton: {
    backgroundColor: '#3B82F6',
  },
  completeButton: {
    backgroundColor: '#22C55E',
  },
  completedInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
