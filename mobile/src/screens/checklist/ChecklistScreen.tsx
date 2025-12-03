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
import { useNavigation } from '@react-navigation/native';
import { Header, Button, Card, Input } from '../../components/ui';
import { checklistsApi, machinesApi } from '../../services/api';
import { Machine, ChecklistTemplate, ChecklistItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, interpolate } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface ChecklistItemState extends ChecklistItem {
  checked: boolean;
  notes: string;
  hasIssue: boolean;
}

export function ChecklistScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const colors = theme.colors;

  const canManageTemplates = user?.role === 'admin' || user?.role === 'manager';

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
      // Handle different response formats safely
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

  const selectMachine = async (machine: Machine) => {
    setSelectedMachine(machine);

    // Load checklist template for machine type
    try {
      const response = await checklistsApi.getTemplates();
      // Handle different response formats safely
      let templatesArray: ChecklistTemplate[] = [];
      if (Array.isArray(response)) {
        templatesArray = response;
      } else if (response && Array.isArray(response.templates)) {
        templatesArray = response.templates;
      } else if (response && Array.isArray(response.data)) {
        templatesArray = response.data;
      }

      // For now, use the first available template
      const machineTemplate = templatesArray[0];

      if (machineTemplate && machineTemplate.items) {
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
        Alert.alert(t.common.warning, t.checklist.empty.noTemplate);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      Alert.alert(t.common.error, t.checklist.messages.loadError);
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
        t.checklist.confirm.incomplete,
        interpolate(t.checklist.confirm.incompleteMessage, { count: uncheckedItems.length }),
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.checklist.confirm.send, onPress: submitChecklist },
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
      // Convert mobile format to backend expected format
      const entries = items.map((item) => ({
        itemId: item.id,
        label: item.label,
        isOk: item.checked && !item.hasIssue, // isOk = checked and no issue
        value: item.hasIssue ? item.notes : undefined,
      }));

      // Combine notes from issues
      const issueNotes = items
        .filter((item) => item.hasIssue && item.notes)
        .map((item) => `${item.label}: ${item.notes}`)
        .join('\n');

      await checklistsApi.submitChecklist({
        machineId: selectedMachine.id,
        templateId: template.id,
        entries,
        notes: issueNotes || undefined,
      });

      setStep('complete');
    } catch (error) {
      console.error('Failed to submit checklist:', error);
      Alert.alert(t.common.error, t.checklist.messages.submitError);
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header
          title={t.checklist.title}
          subtitle={t.checklist.subtitle}
          rightIcon={canManageTemplates ? 'settings-outline' : undefined}
          onRightPress={canManageTemplates ? () => navigation.navigate('ChecklistTemplates') : undefined}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            {t.checklist.instruction}
          </Text>

          {machines.map((machine) => (
            <TouchableOpacity
              key={machine.id}
              onPress={() => selectMachine(machine)}
            >
              <Card style={[styles.machineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.machineRow}>
                  <View style={styles.machineIcon}>
                    <Ionicons name="construct" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.machineInfo}>
                    <Text style={[styles.machineName, { color: colors.text }]}>{machine.name}</Text>
                    <Text style={[styles.machineDetails, { color: colors.textSecondary }]}>
                      {machine.brand} • {machine.plateNumber}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {machines.length === 0 && (
            <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="construct-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.checklist.empty.noMachines}</Text>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header
          title={selectedMachine?.name || t.checklist.title}
          subtitle={interpolate(t.checklist.progress, { checked: checkedCount, total: items.length })}
          showBack
          onBackPress={() => setStep('select')}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {items.map((item, index) => (
            <Card key={item.id} style={[styles.checklistItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
                    { color: item.checked ? colors.text : colors.textSecondary },
                    item.checked && { fontWeight: '500' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              {item.checked && (
                <View style={[styles.checklistActions, { borderTopColor: colors.cardBorder }]}>
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
                      {t.checklist.hasIssue}
                    </Text>
                  </TouchableOpacity>

                  {item.hasIssue && (
                    <Input
                      placeholder={t.checklist.describeIssue}
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

        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
          {issueCount > 0 && (
            <View style={styles.issueWarning}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={[styles.issueWarningText, { color: colors.warning }]}>
                {interpolate(t.checklist.issueReported, { count: issueCount })}
              </Text>
            </View>
          )}
          <Button
            title={t.checklist.complete}
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.completeContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>{t.checklist.success.title}</Text>
        <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
          {interpolate(t.checklist.success.message, { machine: selectedMachine?.name || '' })}
        </Text>
        <Button
          title={t.checklist.success.newCheck}
          onPress={resetForm}
          fullWidth
          style={styles.newCheckButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
      },
  machineDetails: {
    fontSize: 13,
        marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
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
        marginLeft: 12,
  },
  checklistLabelChecked: {
        fontWeight: '500',
  },
  checklistActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
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
        borderTopWidth: 1,
      },
  issueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  issueWarningText: {
    fontSize: 14,
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
        marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
        textAlign: 'center',
    marginBottom: 32,
  },
  newCheckButton: {
    marginTop: 16,
  },
});
