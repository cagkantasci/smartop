import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components/ui';
import { checklistsApi } from '../../services/api';
import { ChecklistSubmission, ChecklistStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, interpolate } from '../../context/LanguageContext';

const getStatusColor = (status: ChecklistStatus) => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'approved':
      return '#22C55E';
    case 'rejected':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export function ApprovalsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = theme.colors;

  const STATUS_FILTERS: { label: string; value: ChecklistStatus | 'all' }[] = [
    { label: t.approvals.status.all, value: 'all' },
    { label: t.approvals.status.pending, value: 'pending' },
    { label: t.approvals.status.approved, value: 'approved' },
    { label: t.approvals.status.rejected, value: 'rejected' },
  ];

  const getStatusLabel = (status: ChecklistStatus): string => {
    switch (status) {
      case 'pending':
        return t.approvals.status.pending;
      case 'approved':
        return t.approvals.status.approved;
      case 'rejected':
        return t.approvals.status.rejected;
      default:
        return status;
    }
  };

  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ChecklistSubmission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ChecklistStatus | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<ChecklistSubmission | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const response = await checklistsApi.getSubmissions();
      // Handle different response formats safely
      let rawSubmissions: any[] = [];
      if (Array.isArray(response)) {
        rawSubmissions = response;
      } else if (response && Array.isArray(response.submissions)) {
        rawSubmissions = response.submissions;
      } else if (response && Array.isArray(response.data)) {
        rawSubmissions = response.data;
      }

      // Transform backend format to mobile format
      const submissionsArray: ChecklistSubmission[] = rawSubmissions.map((item: any) => ({
        id: item.id,
        machineId: item.machineId,
        machineName: item.machine?.name || item.machineName || 'Bilinmeyen Makine',
        templateId: item.templateId,
        templateName: item.template?.name || item.templateName || 'Bilinmeyen Şablon',
        operatorId: item.operatorId,
        operatorName: item.operator
          ? `${item.operator.firstName} ${item.operator.lastName}`
          : item.operatorName || 'Bilinmeyen Operatör',
        status: item.status,
        entries: (item.entries || []).map((entry: any) => ({
          itemId: entry.itemId,
          label: entry.label || '',
          isOk: entry.isOk,
          value: entry.value,
          photoUrl: entry.photoUrl,
        })),
        issuesCount: item.issuesCount || 0,
        notes: item.notes,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt,
        reviewerNotes: item.reviewerNotes,
      }));

      setSubmissions(submissionsArray);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (!Array.isArray(submissions)) {
      setFilteredSubmissions([]);
      return;
    }
    let result = submissions;
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }
    setFilteredSubmissions(result);
  }, [submissions, statusFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubmissions();
    setRefreshing(false);
  }, []);

  const handleReview = async (id: string, approved: boolean) => {
    try {
      setIsReviewing(true);
      await checklistsApi.reviewSubmission(id, approved ? 'approved' : 'rejected');
      Alert.alert(
        t.common.success,
        approved ? t.approvals.messages.approved : t.approvals.messages.rejected
      );
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to review submission:', error);
      Alert.alert(t.common.error, t.approvals.messages.error);
    } finally {
      setIsReviewing(false);
    }
  };

  const renderSubmissionItem = ({ item }: { item: ChecklistSubmission }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setSelectedSubmission(item)}
    >
      <Card style={[styles.submissionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.submissionHeader}>
          <View style={styles.machineIcon}>
            <Ionicons name="document-text" size={24} color="#3B82F6" />
          </View>
          <View style={styles.submissionInfo}>
            <Text style={[styles.machineName, { color: colors.text }]}>{item.machineName}</Text>
            <Text style={[styles.operatorName, { color: colors.textSecondary }]}>{item.operatorName}</Text>
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

        <View style={[styles.submissionDetails, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.submittedAt
                ? new Date(item.submittedAt).toLocaleDateString('tr-TR')
                : '-'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="clipboard-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.templateName}</Text>
          </View>
          {item.issuesCount > 0 && (
            <View style={[styles.detailItem, styles.issueItem]}>
              <Ionicons name="warning" size={16} color={colors.error} />
              <Text style={[styles.detailText, { color: colors.error }]}>
                {interpolate(t.approvals.issues, { count: item.issuesCount })}
              </Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                Alert.alert(
                  t.approvals.reject,
                  t.approvals.confirmReject,
                  [
                    { text: t.common.cancel, style: 'cancel' },
                    {
                      text: t.approvals.reject,
                      style: 'destructive',
                      onPress: () => handleReview(item.id, false),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="close" size={18} color={colors.error} />
              <Text style={[styles.rejectButtonText, { color: colors.error }]}>{t.approvals.reject}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleReview(item.id, true)}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.approveButtonText}>{t.approvals.approve}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.success} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.approvals.empty.title}</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {statusFilter === 'pending'
          ? t.approvals.empty.noPending
          : t.approvals.empty.noSubmissions}
      </Text>
    </View>
  );

  const pendingCount = Array.isArray(submissions)
    ? submissions.filter((s) => s.status === 'pending').length
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.approvals.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {interpolate(t.approvals.subtitle, { count: pendingCount })}
          </Text>
        </View>
        {pendingCount > 0 && (
          <View style={[styles.pendingBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.pendingBadgeText, { color: colors.background }]}>{pendingCount}</Text>
          </View>
        )}
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

      {/* Submissions List */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={renderSubmissionItem}
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

      {/* Detail Modal */}
      <Modal
        visible={!!selectedSubmission}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSubmission(null)}
      >
        {selectedSubmission && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
              <TouchableOpacity
                onPress={() => setSelectedSubmission(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.approvals.detail.title}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.approvals.detail.machine}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedSubmission.machineName}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.approvals.detail.operator}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedSubmission.operatorName}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.approvals.detail.template}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedSubmission.templateName}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.approvals.detail.date}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedSubmission.submittedAt
                      ? new Date(selectedSubmission.submittedAt).toLocaleString('tr-TR')
                      : '-'}
                  </Text>
                </View>
              </Card>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.approvals.detail.items}</Text>
              {selectedSubmission.entries?.map((entry, index) => (
                <Card key={index} style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.entryRow}>
                    <Ionicons
                      name={entry.isOk ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={entry.isOk ? colors.success : colors.error}
                    />
                    <View style={styles.entryInfo}>
                      <Text style={[styles.entryLabel, { color: colors.text }]}>{entry.label}</Text>
                      {entry.value && (
                        <Text style={[styles.entryValue, { color: colors.textSecondary }]}>{entry.value}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              ))}

              {selectedSubmission.notes && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.approvals.detail.notes}</Text>
                  <Card style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>{selectedSubmission.notes}</Text>
                  </Card>
                </>
              )}
            </ScrollView>

            {selectedSubmission.status === 'pending' && (
              <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
                <Button
                  title={t.approvals.reject}
                  variant="outline"
                  onPress={() => {
                    Alert.alert(
                      t.approvals.reject,
                      t.approvals.confirmReject,
                      [
                        { text: t.common.cancel, style: 'cancel' },
                        {
                          text: t.approvals.reject,
                          style: 'destructive',
                          onPress: () => handleReview(selectedSubmission.id, false),
                        },
                      ]
                    );
                  }}
                  style={styles.footerButton}
                  loading={isReviewing}
                />
                <Button
                  title={t.approvals.approve}
                  onPress={() => handleReview(selectedSubmission.id, true)}
                  style={styles.footerButton}
                  loading={isReviewing}
                />
              </View>
            )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  pendingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
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
  submissionCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  submissionHeader: {
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
  submissionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  machineName: {
    fontSize: 16,
    fontWeight: '600',
  },
  operatorName: {
    fontSize: 13,
    marginTop: 2,
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
  submissionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  approveButton: {
    backgroundColor: '#22C55E',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  infoCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  entryCard: {
    marginBottom: 8,
    borderWidth: 1,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entryLabel: {
    fontSize: 14,
  },
  entryValue: {
    fontSize: 13,
    marginTop: 2,
  },
  notesCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});
