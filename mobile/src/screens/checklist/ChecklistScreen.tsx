import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header, Button, Card, Input } from '../../components/ui';
import { checklistsApi, machinesApi } from '../../services/api';
import { Machine, ChecklistTemplate, ChecklistItem } from '../../types';

interface ChecklistItemState extends ChecklistItem {
  checked: boolean;
  notes: string;
  hasIssue: boolean;
}

export function ChecklistScreen() {
  const [step, setStep] = useState<'select' | 'fill' | 'complete'>('select');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItemState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const response = await machinesApi.getAll({ status: 'active' });
      setMachines(response.machines || []);
    } catch (error) {
      console.error('Failed to load machines:', error);
    }
  };

  const selectMachine = async (machine: Machine) => {
    setSelectedMachine(machine);

    // Load checklist template for machine type
    try {
      const templates = await checklistsApi.getTemplates();
      // For now, use the first available template
      const machineTemplate = templates[0];

      if (machineTemplate) {
        setTemplate(machineTemplate);
        setItems(
          machineTemplate.items.map((item: ChecklistItem) => ({
            ...item,
            checked: false,
            notes: '',
            hasIssue: false,
          }))
        );
        setStep('fill');
      } else {
        Alert.alert('Uyarı', 'Bu makine için kontrol listesi bulunamadı');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      Alert.alert('Hata', 'Kontrol listesi yüklenemedi');
    }
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleIssue = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, hasIssue: !item.hasIssue } : item
      )
    );
  };

  const updateNotes = (index: number, notes: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes } : item))
    );
  };

  const handleSubmit = async () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    if (uncheckedItems.length > 0) {
      Alert.alert(
        'Eksik Kontrol',
        `${uncheckedItems.length} kontrol maddesi işaretlenmedi. Yine de göndermek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Gönder', onPress: submitChecklist },
        ]
      );
    } else {
      submitChecklist();
    }
  };

  const submitChecklist = async () => {
    if (!selectedMachine || !template) return;

    setIsSubmitting(true);
    try {
      await checklistsApi.submit({
        machineId: selectedMachine.id,
        templateId: template.id,
        items: items.map((item) => ({
          itemId: item.id,
          checked: item.checked,
          notes: item.notes,
          hasIssue: item.hasIssue,
        })),
      });

      setStep('complete');
    } catch (error) {
      console.error('Failed to submit checklist:', error);
      Alert.alert('Hata', 'Kontrol listesi gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('select');
    setSelectedMachine(null);
    setTemplate(null);
    setItems([]);
  };

  // Machine Selection Screen
  if (step === 'select') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Günlük Kontrol" subtitle="Makine seçin" />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.instruction}>
            Kontrol yapmak istediğiniz makineyi seçin
          </Text>

          {machines.map((machine) => (
            <TouchableOpacity
              key={machine.id}
              onPress={() => selectMachine(machine)}
            >
              <Card style={styles.machineCard}>
                <View style={styles.machineRow}>
                  <View style={styles.machineIcon}>
                    <Ionicons name="construct" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.machineInfo}>
                    <Text style={styles.machineName}>{machine.name}</Text>
                    <Text style={styles.machineDetails}>
                      {machine.brand} • {machine.plateNumber}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {machines.length === 0 && (
            <Card style={styles.emptyCard}>
              <Ionicons name="construct-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aktif makine bulunamadı</Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Checklist Fill Screen
  if (step === 'fill') {
    const issueCount = items.filter((item) => item.hasIssue).length;
    const checkedCount = items.filter((item) => item.checked).length;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title={selectedMachine?.name || 'Kontrol'}
          subtitle={`${checkedCount}/${items.length} kontrol tamamlandı`}
          showBack
          onBackPress={() => setStep('select')}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {items.map((item, index) => (
            <Card key={item.id} style={styles.checklistItem}>
              <TouchableOpacity
                style={styles.checklistHeader}
                onPress={() => toggleItem(index)}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.checked ? styles.checkboxChecked : undefined,
                  ]}
                >
                  {item.checked && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistLabel,
                    item.checked ? styles.checklistLabelChecked : undefined,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              {item.checked && (
                <View style={styles.checklistActions}>
                  <TouchableOpacity
                    style={[
                      styles.issueButton,
                      item.hasIssue ? styles.issueButtonActive : undefined,
                    ]}
                    onPress={() => toggleIssue(index)}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color={item.hasIssue ? '#FFFFFF' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.issueButtonText,
                        item.hasIssue ? styles.issueButtonTextActive : undefined,
                      ]}
                    >
                      Sorun Var
                    </Text>
                  </TouchableOpacity>

                  {item.hasIssue && (
                    <Input
                      placeholder="Sorunu açıklayın..."
                      value={item.notes}
                      onChangeText={(text) => updateNotes(index, text)}
                      multiline
                      containerStyle={styles.notesInput}
                    />
                  )}
                </View>
              )}
            </Card>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          {issueCount > 0 && (
            <View style={styles.issueWarning}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.issueWarningText}>
                {issueCount} sorun bildirildi
              </Text>
            </View>
          )}
          <Button
            title="Kontrolü Tamamla"
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  // Complete Screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.completeContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Kontrol Tamamlandı!</Text>
        <Text style={styles.successMessage}>
          {selectedMachine?.name} için günlük kontrol başarıyla kaydedildi.
        </Text>
        <Button
          title="Yeni Kontrol Başlat"
          onPress={resetForm}
          fullWidth
          style={styles.newCheckButton}
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  machineCard: {
    marginBottom: 10,
  },
  machineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineIcon: {
    width: 44,
    height: 44,
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  checklistItem: {
    marginBottom: 12,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checklistLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  checklistLabelChecked: {
    color: COLORS.text,
    fontWeight: '500',
  },
  checklistActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  issueButtonActive: {
    backgroundColor: '#EF4444',
  },
  issueButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
  issueButtonTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    marginTop: 12,
    marginBottom: 0,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  issueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  issueWarningText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  newCheckButton: {
    marginTop: 16,
  },
});
