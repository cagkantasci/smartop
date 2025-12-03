import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Header, Card, StatusBadge, Button } from '../../components/ui';
import { machinesApi, checklistsApi, usersApi } from '../../services/api';
import { Machine, MachineStatus, ChecklistSubmission } from '../../types';

const { width } = Dimensions.get('window');

interface Operator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const getStatusColor = (status: MachineStatus) => {
  switch (status) {
    case 'active':
      return '#22C55E';
    case 'idle':
      return '#3B82F6';
    case 'maintenance':
      return '#F59E0B';
    case 'out_of_service':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusLabel = (status: MachineStatus) => {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'idle':
      return 'Boşta';
    case 'maintenance':
      return 'Bakımda';
    case 'out_of_service':
      return 'Servis Dışı';
    default:
      return status;
  }
};

const getMachineTypeLabel = (type: string) => {
  switch (type) {
    case 'excavator':
      return 'Ekskavatör';
    case 'dozer':
      return 'Dozer';
    case 'crane':
      return 'Vinç';
    case 'loader':
      return 'Yükleyici';
    case 'truck':
      return 'Kamyon';
    case 'grader':
      return 'Greyder';
    case 'roller':
      return 'Silindir';
    default:
      return type;
  }
};

interface MachineDetailParams {
  machineId: string;
}

export function MachineDetailScreen() {
  const route = useRoute<RouteProp<{ params: MachineDetailParams }, 'params'>>();
  const navigation = useNavigation();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'operator' | 'checklists'>('info');
  const [checklists, setChecklists] = useState<ChecklistSubmission[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [assignedOperator, setAssignedOperator] = useState<Operator | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const machineId = route.params?.machineId;

  useEffect(() => {
    if (machineId) {
      loadMachine();
      loadOperators();
    }
  }, [machineId]);

  const loadMachine = async () => {
    try {
      const data = await machinesApi.getById(machineId);
      setMachine(data);

      // Load checklists for this machine
      try {
        const checklistRes = await machinesApi.getChecklists(machineId);
        let checklistArray: ChecklistSubmission[] = [];
        if (Array.isArray(checklistRes)) {
          checklistArray = checklistRes;
        } else if (checklistRes && Array.isArray(checklistRes.submissions)) {
          checklistArray = checklistRes.submissions;
        } else if (checklistRes && Array.isArray(checklistRes.data)) {
          checklistArray = checklistRes.data;
        }
        setChecklists(checklistArray);
      } catch (error) {
        console.error('Failed to load checklists:', error);
        setChecklists([]);
      }

      // Load assigned operator from machine data
      if (data.assignedOperator) {
        setAssignedOperator({
          id: data.assignedOperator.id,
          firstName: data.assignedOperator.firstName,
          lastName: data.assignedOperator.lastName,
          email: data.assignedOperator.email,
          role: 'operator',
        });
      } else {
        setAssignedOperator(null);
      }
    } catch (error) {
      console.error('Failed to load machine:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      const response = await usersApi.getAll({ role: 'operator' });
      let operatorsArray: Operator[] = [];
      if (Array.isArray(response)) {
        operatorsArray = response;
      } else if (response && Array.isArray(response.data)) {
        operatorsArray = response.data;
      } else if (response && Array.isArray(response.users)) {
        operatorsArray = response.users;
      }
      setOperators(operatorsArray);
    } catch (error) {
      console.error('Failed to load operators:', error);
      setOperators([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMachine();
    setRefreshing(false);
  }, [machineId]);

  const handleAssignOperator = async () => {
    if (!selectedOperatorId) {
      Alert.alert('Hata', 'Lütfen bir operatör seçin');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await machinesApi.assignOperator(machineId, selectedOperatorId);
      if (result.assignedOperator) {
        setAssignedOperator({
          id: result.assignedOperator.id,
          firstName: result.assignedOperator.firstName,
          lastName: result.assignedOperator.lastName,
          email: result.assignedOperator.email,
          role: 'operator',
        });
      } else {
        const selectedOp = operators.find(op => op.id === selectedOperatorId);
        if (selectedOp) {
          setAssignedOperator(selectedOp);
        }
      }
      Alert.alert('Başarılı', 'Operatör başarıyla atandı');
      setShowAssignModal(false);
      setSelectedOperatorId('');
    } catch (error) {
      console.error('Assign operator error:', error);
      Alert.alert('Hata', 'Operatör atanamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOperator = () => {
    Alert.alert(
      'Operatörü Kaldır',
      'Operatörü bu makineden kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await machinesApi.assignOperator(machineId, null);
              setAssignedOperator(null);
              Alert.alert('Başarılı', 'Operatör kaldırıldı');
            } catch (error) {
              console.error('Remove operator error:', error);
              Alert.alert('Hata', 'Operatör kaldırılamadı');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatus: MachineStatus) => {
    Alert.alert(
      'Durum Değiştir',
      `Makine durumunu "${getStatusLabel(newStatus)}" olarak değiştirmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: async () => {
            try {
              await machinesApi.update(machineId, { status: newStatus });
              setMachine(prev => prev ? { ...prev, status: newStatus } : null);
              Alert.alert('Başarılı', 'Durum güncellendi');
            } catch (error) {
              Alert.alert('Hata', 'Durum değiştirilemedi');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!machine) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Makine Detayı" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Makine bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderInfoTab = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Machine Image */}
      <View style={styles.imageContainer}>
        {machine.imageUrl ? (
          <Image source={{ uri: machine.imageUrl }} style={styles.machineImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="construct" size={64} color="#6B7280" />
          </View>
        )}
        <View
          style={[
            styles.statusOverlay,
            { backgroundColor: `${getStatusColor(machine.status)}CC` },
          ]}
        >
          <Text style={styles.statusOverlayText}>{getStatusLabel(machine.status)}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{machine.engineHours?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Motor Saati</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="speedometer-outline" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{machine.operatorHours?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Operatör Saati</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={24} color="#22C55E" />
          <Text style={styles.statValue}>{machine.year || '-'}</Text>
          <Text style={styles.statLabel}>Model Yılı</Text>
        </View>
      </View>

      {/* Status Change Section */}
      <Card style={styles.detailCard}>
        <Text style={styles.cardTitle}>Durum Değiştir</Text>
        <View style={styles.statusButtons}>
          {(['active', 'idle', 'maintenance', 'out_of_service'] as MachineStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                machine.status === status && styles.statusButtonActive,
                { borderColor: getStatusColor(status) },
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(status) },
                ]}
              />
              <Text
                style={[
                  styles.statusButtonText,
                  machine.status === status && { color: getStatusColor(status) },
                ]}
              >
                {getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Machine Details */}
      <Card style={styles.detailCard}>
        <Text style={styles.cardTitle}>Makine Bilgileri</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Marka</Text>
          <Text style={styles.detailValue}>{machine.brand}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Model</Text>
          <Text style={styles.detailValue}>{machine.model}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tip</Text>
          <Text style={styles.detailValue}>{getMachineTypeLabel(machine.machineType || machine.type)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Seri No</Text>
          <Text style={styles.detailValue}>{machine.serialNumber || '-'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plaka</Text>
          <Text style={styles.detailValue}>{machine.plateNumber || machine.licensePlate || '-'}</Text>
        </View>
      </Card>

      {/* Location */}
      {(machine.locationLat && machine.locationLng) && (
        <Card style={styles.detailCard}>
          <Text style={styles.cardTitle}>Konum</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={24} color="#EF4444" />
            <Text style={styles.locationText}>
              {machine.locationLat?.toFixed(4)}, {machine.locationLng?.toFixed(4)}
            </Text>
          </View>
          <Button
            title="Haritada Göster"
            variant="outline"
            icon="map-outline"
            onPress={() => {}}
            style={styles.mapButton}
          />
        </Card>
      )}

      {/* Actions */}
      <Card style={styles.detailCard}>
        <Text style={styles.cardTitle}>İşlemler</Text>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Ionicons name="clipboard-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.actionLabel}>Kontrol Listesi Başlat</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="build-outline" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.actionLabel}>Bakım Talebi Oluştur</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
          </View>
          <Text style={styles.actionLabel}>Arıza Bildir</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );

  const renderOperatorTab = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.operatorCard}>
        <View style={styles.operatorHeader}>
          <Text style={styles.cardTitle}>Atanmış Operatör</Text>
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => setShowAssignModal(true)}
          >
            <Ionicons name="person-add-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.assignButtonText}>Ata</Text>
          </TouchableOpacity>
        </View>

        {assignedOperator ? (
          <View style={styles.operatorInfo}>
            <View style={styles.operatorAvatar}>
              <Text style={styles.operatorAvatarText}>
                {assignedOperator.firstName[0]}{assignedOperator.lastName[0]}
              </Text>
            </View>
            <View style={styles.operatorDetails}>
              <Text style={styles.operatorName}>
                {assignedOperator.firstName} {assignedOperator.lastName}
              </Text>
              <Text style={styles.operatorEmail}>{assignedOperator.email}</Text>
              <View style={styles.operatorRoleBadge}>
                <Text style={styles.operatorRoleText}>Operatör</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveOperator}
            >
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyOperator}>
            <View style={styles.emptyOperatorIcon}>
              <Ionicons name="person-outline" size={48} color="#6B7280" />
            </View>
            <Text style={styles.emptyOperatorTitle}>Operatör Atanmamış</Text>
            <Text style={styles.emptyOperatorText}>
              Bu makineye henüz bir operatör atanmamış
            </Text>
            <Button
              title="Operatör Ata"
              onPress={() => setShowAssignModal(true)}
              variant="primary"
              size="md"
              icon={<Ionicons name="person-add-outline" size={18} color="#111827" />}
              style={styles.assignMainButton}
            />
          </View>
        )}
      </Card>

      {/* Quick Stats about Operator */}
      {assignedOperator && (
        <Card style={styles.operatorStatsCard}>
          <Text style={styles.cardTitle}>Operatör İstatistikleri</Text>
          <View style={styles.operatorStatsRow}>
            <View style={styles.operatorStatItem}>
              <Text style={styles.operatorStatValue}>128</Text>
              <Text style={styles.operatorStatLabel}>Çalışma Saati</Text>
            </View>
            <View style={styles.operatorStatItem}>
              <Text style={styles.operatorStatValue}>45</Text>
              <Text style={styles.operatorStatLabel}>Tamamlanan Kontrol</Text>
            </View>
            <View style={styles.operatorStatItem}>
              <Text style={styles.operatorStatValue}>2</Text>
              <Text style={styles.operatorStatLabel}>Arıza Bildirimi</Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );

  const renderChecklistsTab = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.checklistHeader}>
        <Text style={styles.checklistTitle}>Kontrol Geçmişi</Text>
        <Text style={styles.checklistCount}>{checklists.length} kayıt</Text>
      </View>

      {checklists.length > 0 ? (
        checklists.map((checklist) => (
          <Card key={checklist.id} style={styles.checklistCard}>
            <View style={styles.checklistRow}>
              <View style={[
                styles.checklistIcon,
                { backgroundColor: checklist.hasIssue ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)' }
              ]}>
                <Ionicons
                  name={checklist.hasIssue ? 'warning' : 'checkmark-circle'}
                  size={24}
                  color={checklist.hasIssue ? '#F59E0B' : '#22C55E'}
                />
              </View>
              <View style={styles.checklistInfo}>
                <Text style={styles.checklistDate}>
                  {new Date(checklist.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.checklistTime}>
                  {new Date(checklist.createdAt).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.checklistBadge}>
                <Text style={styles.checklistBadgeText}>
                  {checklist.completedItems || 0}/{checklist.totalItems || 0}
                </Text>
              </View>
            </View>
            {checklist.hasIssue && (
              <View style={styles.checklistIssue}>
                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.checklistIssueText}>Sorun bildirildi</Text>
              </View>
            )}
          </Card>
        ))
      ) : (
        <View style={styles.emptyTab}>
          <View style={styles.emptyIcon}>
            <Ionicons name="clipboard-outline" size={64} color="#6B7280" />
          </View>
          <Text style={styles.emptyTabTitle}>Kontrol Kaydı Yok</Text>
          <Text style={styles.emptyTabText}>
            Bu makine için henüz kontrol kaydı bulunmuyor
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={machine.name}
        subtitle={`${machine.brand} ${machine.model}`}
        showBack
        onBackPress={() => navigation.goBack()}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => {}}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === 'info' ? COLORS.secondary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Bilgiler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'operator' && styles.tabActive]}
          onPress={() => setActiveTab('operator')}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={activeTab === 'operator' ? COLORS.secondary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'operator' && styles.tabTextActive]}>
            Operatör
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checklists' && styles.tabActive]}
          onPress={() => setActiveTab('checklists')}
        >
          <Ionicons
            name="checkbox-outline"
            size={20}
            color={activeTab === 'checklists' ? COLORS.secondary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'checklists' && styles.tabTextActive]}>
            Kontroller
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'operator' && renderOperatorTab()}
        {activeTab === 'checklists' && renderChecklistsTab()}
      </View>

      {/* Assign Operator Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAssignModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Operatör Ata</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalInstruction}>
              Bu makineye atanacak operatörü seçin
            </Text>

            {operators.map((op) => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorOption,
                  selectedOperatorId === op.id && styles.operatorOptionSelected,
                ]}
                onPress={() => setSelectedOperatorId(op.id)}
              >
                <View style={styles.operatorOptionAvatar}>
                  <Text style={styles.operatorOptionAvatarText}>
                    {op.firstName[0]}{op.lastName[0]}
                  </Text>
                </View>
                <View style={styles.operatorOptionInfo}>
                  <Text style={styles.operatorOptionName}>
                    {op.firstName} {op.lastName}
                  </Text>
                  <Text style={styles.operatorOptionEmail}>{op.email}</Text>
                </View>
                {selectedOperatorId === op.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Operatörü Ata"
              onPress={handleAssignOperator}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  success: '#22C55E',
  danger: '#EF4444',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: COLORS.card,
  },
  machineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  statusOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorder,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 100,
  },
  detailCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: 'transparent',
  },
  statusButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  mapButton: {
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 12,
  },
  // Operator Tab Styles
  operatorCard: {
    marginBottom: 16,
  },
  operatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  assignButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  operatorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  operatorName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  operatorEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  operatorRoleBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
  },
  operatorRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  removeButton: {
    padding: 8,
  },
  emptyOperator: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyOperatorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyOperatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyOperatorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  assignMainButton: {
    paddingHorizontal: 24,
  },
  operatorStatsCard: {
    marginBottom: 16,
  },
  operatorStatsRow: {
    flexDirection: 'row',
  },
  operatorStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  operatorStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  operatorStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Checklists Tab Styles
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  checklistCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  checklistCard: {
    marginBottom: 12,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checklistDate: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  checklistTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checklistBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  checklistBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  checklistIssue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  checklistIssueText: {
    fontSize: 13,
    color: '#F59E0B',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
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
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalInstruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  operatorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  operatorOptionSelected: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  operatorOptionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorOptionAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  operatorOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  operatorOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  operatorOptionEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
});
