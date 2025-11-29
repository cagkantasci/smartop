import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge } from '../../components/ui';
import { machinesApi } from '../../services/api';
import { Machine, MachineStatus } from '../../types';

const STATUS_FILTERS: { label: string; value: MachineStatus | 'all' }[] = [
  { label: 'Tümü', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Boşta', value: 'idle' },
  { label: 'Bakımda', value: 'maintenance' },
  { label: 'Servis Dışı', value: 'out_of_service' },
];

export function MachineListScreen() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');

  const fetchMachines = async () => {
    try {
      const response = await machinesApi.getAll();
      setMachines(response.machines || []);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    let result = machines;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Apply search filter
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

  const renderMachineItem = ({ item }: { item: Machine }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card style={styles.machineCard}>
        <View style={styles.machineHeader}>
          <View style={styles.machineIcon}>
            <Ionicons name="construct" size={24} color="#3B82F6" />
          </View>
          <View style={styles.machineInfo}>
            <Text style={styles.machineName}>{item.name}</Text>
            <Text style={styles.machineDetails}>
              {item.brand} • {item.model}
            </Text>
          </View>
          <StatusBadge status={item.status} size="sm" />
        </View>

        <View style={styles.machineFooter}>
          <View style={styles.machineDetail}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.machineDetailText}>{item.plateNumber}</Text>
          </View>
          {item.year && (
            <View style={styles.machineDetail}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.machineDetailText}>{item.year}</Text>
            </View>
          )}
          {item.operatorHours && (
            <View style={styles.machineDetail}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.machineDetailText}>
                {item.operatorHours.toLocaleString()} saat
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Makine Bulunamadı</Text>
      <Text style={styles.emptyText}>
        {searchQuery || statusFilter !== 'all'
          ? 'Arama kriterlerinize uygun makine bulunamadı'
          : 'Henüz kayıtlı makine yok'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Makineler</Text>
        <Text style={styles.headerSubtitle}>
          {filteredMachines.length} makine listeleniyor
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Makine ara..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
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
                statusFilter === item.value ? styles.filterChipActive : undefined,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === item.value ? styles.filterChipTextActive : undefined,
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
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
  inputBg: '#0F172A',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
    marginRight: 10,
  },
  filterContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  machineCard: {
    marginBottom: 12,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
    color: COLORS.text,
  },
  machineDetails: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  machineFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: 16,
  },
  machineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
