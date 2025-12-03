import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { checklistsApi } from '../../services/api';
import { ChecklistTemplate } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface TemplateItem {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'number' | 'photo';
  required: boolean;
}

export function ChecklistTemplatesScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const colors = theme.colors;

  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageTemplates = user?.role === 'admin' || user?.role === 'manager';

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await checklistsApi.getTemplates();
      let templatesArray: ChecklistTemplate[] = [];
      if (Array.isArray(response)) {
        templatesArray = response;
      } else if (response && Array.isArray(response.data)) {
        templatesArray = response.data;
      }
      setTemplates(templatesArray);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      Alert.alert(t.common.error, t.checklistTemplates.messages.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTemplates();
  };

  const openAddModal = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateItems([]);
    setNewItemLabel('');
    setModalVisible(true);
  };

  const openEditModal = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setTemplateItems(template.items?.map(item => ({
      id: item.id,
      label: item.label,
      type: item.type || 'boolean',
      required: item.required ?? true,
    })) || []);
    setNewItemLabel('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateItems([]);
    setNewItemLabel('');
  };

  const addItem = () => {
    if (!newItemLabel.trim()) return;

    const newItem: TemplateItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: newItemLabel.trim(),
      type: 'boolean',
      required: true,
    };

    setTemplateItems([...templateItems, newItem]);
    setNewItemLabel('');
  };

  const removeItem = (id: string) => {
    setTemplateItems(templateItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      Alert.alert(t.common.warning, t.checklistTemplates.messages.nameRequired);
      return;
    }

    if (templateItems.length === 0) {
      Alert.alert(t.common.warning, t.checklistTemplates.messages.itemsRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        items: templateItems,
      };

      if (editingTemplate) {
        await checklistsApi.updateTemplate(editingTemplate.id, data);
        Alert.alert(t.common.success, t.checklistTemplates.messages.updateSuccess);
      } else {
        await checklistsApi.createTemplate(data);
        Alert.alert(t.common.success, t.checklistTemplates.messages.createSuccess);
      }

      closeModal();
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      Alert.alert(t.common.error, t.checklistTemplates.messages.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (template: ChecklistTemplate) => {
    Alert.alert(
      t.checklistTemplates.confirmDelete.title,
      t.checklistTemplates.confirmDelete.message,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await checklistsApi.deleteTemplate(template.id);
              Alert.alert(t.common.success, t.checklistTemplates.messages.deleteSuccess);
              fetchTemplates();
            } catch (error) {
              console.error('Failed to delete template:', error);
              Alert.alert(t.common.error, t.checklistTemplates.messages.deleteError);
            }
          },
        },
      ]
    );
  };

  const renderTemplateCard = ({ item }: { item: ChecklistTemplate }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => canManageTemplates && openEditModal(item)}
      disabled={!canManageTemplates}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {item.items?.length || 0} {t.checklistTemplates.items}
          </Text>
        </View>
        {canManageTemplates && (
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      {item.description && (
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t.checklistTemplates.empty.title}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t.checklistTemplates.empty.subtitle}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.checklistTemplates.title}
        </Text>
        {canManageTemplates && (
          <TouchableOpacity onPress={openAddModal} style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {!canManageTemplates && <View style={{ width: 36 }} />}
      </View>

      {/* Template List */}
      <FlatList
        data={templates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTemplate ? t.checklistTemplates.editTemplate : t.checklistTemplates.addTemplate}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Template Name */}
              <Text style={[styles.label, { color: colors.text }]}>
                {t.checklistTemplates.form.name}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.cardBorder, color: colors.text }]}
                placeholder={t.checklistTemplates.form.namePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={templateName}
                onChangeText={setTemplateName}
              />

              {/* Template Description */}
              <Text style={[styles.label, { color: colors.text }]}>
                {t.checklistTemplates.form.description}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.cardBorder, color: colors.text }]}
                placeholder={t.checklistTemplates.form.descriptionPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={templateDescription}
                onChangeText={setTemplateDescription}
                multiline
                numberOfLines={3}
              />

              {/* Items */}
              <Text style={[styles.label, { color: colors.text }]}>
                {t.checklistTemplates.form.items}
              </Text>

              {/* Add Item Input */}
              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.input, styles.addItemInput, { backgroundColor: colors.background, borderColor: colors.cardBorder, color: colors.text }]}
                  placeholder={t.checklistTemplates.form.itemPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={newItemLabel}
                  onChangeText={setNewItemLabel}
                  onSubmitEditing={addItem}
                />
                <TouchableOpacity
                  onPress={addItem}
                  style={[styles.addItemButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Items List */}
              {templateItems.map((item, index) => (
                <View key={item.id} style={[styles.itemRow, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                  <View style={styles.itemNumber}>
                    <Text style={[styles.itemNumberText, { color: colors.textSecondary }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]} numberOfLines={2}>
                    {item.label}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {templateItems.length === 0 && (
                <Text style={[styles.noItemsText, { color: colors.textMuted }]}>
                  {t.checklistTemplates.form.noItems}
                </Text>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
              <TouchableOpacity
                onPress={closeModal}
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  {t.common.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? t.common.saving : t.common.save}
                </Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: 450,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addItemButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
  },
  noItemsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
