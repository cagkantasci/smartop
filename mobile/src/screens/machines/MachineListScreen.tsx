import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, StatusBadge, Button, Input } from '../../components/ui';
import { machinesApi } from '../../services/api';
import { Machine, MachineStatus } from '../../types';
import { MachinesStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, interpolate } from '../../context/LanguageContext';

type MachinesNavigationProp = NativeStackNavigationProp<MachinesStackParamList, 'MachineList'>;

export function MachineListScreen() {
  const navigation = useNavigation<MachinesNavigationProp>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = theme.colors;

  const STATUS_FILTERS: { label: string; value: MachineStatus | 'all' }[] = [
    { label: t.machines.status.all, value: 'all' },
    { label: t.machines.status.active, value: 'active' },
    { label: t.machines.status.idle, value: 'idle' },
    { label: t.machines.status.maintenance, value: 'maintenance' },
    { label: t.machines.status.outOfService, value: 'out_of_service' },
  ];

  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    brand: '',
    model: '',
    plateNumber: '',
    year: '',
  });

  const fetchMachines = async () => {
    try {
      const response = await machinesApi.getAll();
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
      console.error('Failed to fetch machines:', error);
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    let result = machines;

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.brand.toLowerCase().includes(query) ||
          m.plateNumber.toLowerCase().includes(query)
      );
    }

    setFilteredMachines(result);
  }, [machines, statusFilter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMachines();
    setRefreshing(false);
  }, []);

  const handleAddMachine = async () => {
    if (!newMachine.name || !newMachine.brand || !newMachine.plateNumber) {
      Alert.alert(t.common.error, t.machines.messages.requiredFields);
      return;
    }

    setIsSubmitting(true);
    try {
      Alert.alert(t.common.success, t.machines.messages.addSuccess);
      setShowAddModal(false);
      setNewMachine({ name: '', brand: '', model: '', plateNumber: '', year: '' });
      fetchMachines();
    } catch (error) {
      Alert.alert(t.common.error, t.machines.messages.addError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMachineItem = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MachineDetail', { machineId: item.id })}
    >
      <Card style={[styles.machineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.machineHeader}>
          <View style={[styles.machineIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Ionicons name="construct" size={24} color="#3B82F6" />
          </View>
          <View style={styles.machineInfo}>
            <Text style={[styles.machineName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.machineDetails, { color: colors.textSecondary }]}>
              {item.brand} • {item.model}
            </Text>
          </View>
          <StatusBadge status={item.status} size="sm" />
        </View>

        <View style={[styles.machineFooter, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.machineDetail}>
            <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.machineDetailText, { color: colors.textSecondary }]}>{item.plateNumber}</Text>
          </View>
          {item.year && (
            <View style={styles.machineDetail}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.machineDetailText, { color: colors.textSecondary }]}>{item.year}</Text>
            </View>
          )}
          {item.operatorHours && (
            <View style={styles.machineDetail}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.machineDetailText, { color: colors.textSecondary }]}>
                {item.operatorHours.toLocaleString()} {t.machines.fields.hours}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.machines.empty.title}</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery || statusFilter !== 'all'
          ? t.machines.empty.filtered
          : t.machines.empty.noMachines}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.machines.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {interpolate(t.machines.subtitle, { count: filteredMachines.length })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search-outline" size={20} color={colors.placeholder} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.machines.search}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.placeholder} />
            </TouchableOpacity>
          )}
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

      {/* Machine List */}
      <FlatList
        data={filteredMachines}
        keyExtractor={(item) => item.id}
        renderItem={renderMachineItem}
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

      {/* Add Machine Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.machines.addNew}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label={`${t.machines.fields.name} *`}
              placeholder="örn: Ekskavatör 1"
              value={newMachine.name}
              onChangeText={(text) => setNewMachine((prev) => ({ ...prev, name: text }))}
            />
            <Input
              label={`${t.machines.fields.brand} *`}
              placeholder="örn: Caterpillar"
              value={newMachine.brand}
              onChangeText={(text) => setNewMachine((prev) => ({ ...prev, brand: text }))}
            />
            <Input
              label={t.machines.fields.model}
              placeholder="örn: 320D"
              value={newMachine.model}
              onChangeText={(text) => setNewMachine((prev) => ({ ...prev, model: text }))}
            />
            <Input
              label={`${t.machines.fields.plateNumber} *`}
              placeholder="örn: 34 ABC 123"
              value={newMachine.plateNumber}
              onChangeText={(text) => setNewMachine((prev) => ({ ...prev, plateNumber: text }))}
            />
            <Input
              label={t.machines.fields.year}
              placeholder="örn: 2020"
              value={newMachine.year}
              onChangeText={(text) => setNewMachine((prev) => ({ ...prev, year: text }))}
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <Button
              title={t.machines.addNew}
              onPress={handleAddMachine}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
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
  machineCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  machineName: {
    fontSize: 16,
    fontWeight: '600',
  },
  machineDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  machineFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  machineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineDetailText: {
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
});
