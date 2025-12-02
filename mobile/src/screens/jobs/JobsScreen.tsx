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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Card, StatusBadge, Button, Input } from '../../components/ui';
import { jobsApi } from '../../services/api';
import { Job, JobStatus, JobPriority } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, interpolate } from '../../context/LanguageContext';

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

export function JobsScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const colors = theme.colors;

  const mapRef = useRef<MapView>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
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
      setJobs(jobsArray);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let result = jobs;
    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }
    setFilteredJobs(result);
  }, [jobs, statusFilter]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
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
      });
      Alert.alert('Başarılı', 'İş başarıyla eklendi');
      setShowAddModal(false);
      setNewJob({ title: '', description: '', locationName: '', locationLat: null, locationLng: null, priority: 'medium' });
      setSelectedLocation(null);
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

  const renderJobItem = ({ item }: { item: Job }) => (
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
          {item.machines && item.machines.length > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="construct-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.machines.length} Makine</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>İş Bulunamadı</Text>
      <Text style={styles.emptyText}>
        {statusFilter !== 'all'
          ? 'Seçili durumda iş bulunamadı'
          : 'Henüz kayıtlı iş yok'}
      </Text>
    </View>
  );

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
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={currentRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  pinColor="#F59E0B"
                />
              )}
            </MapView>

            {/* Instruction Overlay */}
            <View style={styles.mapInstructionContainer}>
              <View style={styles.mapInstruction}>
                <Ionicons name="finger-print-outline" size={20} color="#F59E0B" />
                <Text style={styles.mapInstructionText}>
                  İşin yapılacağı konumu seçmek için haritaya dokunun
                </Text>
              </View>
            </View>
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

              {/* Map View */}
              {selectedJob.locationLat && selectedJob.locationLng && (
                <Card style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Harita</Text>
                  <View style={styles.detailMapContainer}>
                    <MapView
                      style={styles.detailMap}
                      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                      initialRegion={{
                        latitude: selectedJob.locationLat,
                        longitude: selectedJob.locationLng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: selectedJob.locationLat,
                          longitude: selectedJob.locationLng,
                        }}
                        pinColor="#F59E0B"
                      />
                    </MapView>
                  </View>
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
});
