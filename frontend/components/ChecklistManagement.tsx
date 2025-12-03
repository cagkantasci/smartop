
import React, { useState } from 'react';
import { Plus, Trash2, FileCheck, Check, X, ClipboardList, ListPlus, GripVertical, Pencil } from 'lucide-react';
import { ChecklistTemplate, TranslationDictionary } from '../types';

interface ChecklistManagementProps {
  templates: ChecklistTemplate[];
  addTemplate: (template: ChecklistTemplate) => void;
  updateTemplate: (template: ChecklistTemplate) => void;
  deleteTemplate: (id: string) => void;
  t: TranslationDictionary['checklists'];
}

export const ChecklistManagement: React.FC<ChecklistManagementProps> = ({ templates, addTemplate, updateTemplate, deleteTemplate, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Create New/Edit Template State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newItems, setNewItems] = useState<string[]>([]);
  const [currentItemInput, setCurrentItemInput] = useState('');

  const resetForm = () => {
      setNewTemplateName('');
      setNewItems([]);
      setCurrentItemInput('');
      setEditingId(null);
  };

  const handleOpenCreate = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleOpenEdit = (template: ChecklistTemplate) => {
      setEditingId(template.id);
      setNewTemplateName(template.name);
      setNewItems([...template.items]);
      setIsModalOpen(true);
  };

  const handleClose = () => {
      setIsModalOpen(false);
      resetForm();
  };

  const handleAddItem = () => {
    if (currentItemInput.trim()) {
      setNewItems([...newItems, currentItemInput.trim()]);
      setCurrentItemInput('');
    }
  };

  const handleDeleteItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || newItems.length === 0) return;

    if (editingId) {
        // Update
        const updatedTemplate: ChecklistTemplate = {
            id: editingId,
            name: newTemplateName,
            items: newItems,
            itemsCount: newItems.length
        };
        updateTemplate(updatedTemplate);
    } else {
        // Create
        const newTemplate: ChecklistTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            name: newTemplateName,
            items: newItems,
            itemsCount: newItems.length
        };
        addTemplate(newTemplate);
    }
    
    handleClose();
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
            <ClipboardList className="text-smart-yellow" />
            {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-smart-navy dark:bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md border border-transparent dark:border-gray-700"
        >
          <Plus size={20} strokeWidth={3} />
          {t.addTemplate}
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-all group relative">
             <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => handleOpenEdit(template)}
                    className="p-2 text-gray-300 hover:text-smart-navy dark:hover:text-white hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                    <Trash2 size={18} />
                </button>
             </div>
             
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <FileCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-smart-navy dark:text-white">{template.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{template.itemsCount} {t.itemsCount}</p>
                </div>
             </div>

             <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-100 dark:border-slate-600 max-h-40 overflow-y-auto custom-scrollbar">
                <ul className="space-y-2">
                    {template.items && template.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-green-500 mt-1"><Check size={12} strokeWidth={3}/></span>
                            {item}
                        </li>
                    ))}
                </ul>
             </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
             <div className="bg-smart-navy dark:bg-black p-6 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {editingId ? <Pencil /> : <ListPlus />}
                    {editingId ? t.modal.titleEdit : t.modal.titleNew}
                </h3>
                <button onClick={handleClose} className="text-white/70 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.nameLabel}</label>
                    <input 
                        type="text" 
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                        placeholder={t.modal.namePlaceholder}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.itemsLabel}</label>
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text"
                            value={currentItemInput}
                            onChange={(e) => setCurrentItemInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                            placeholder={t.modal.itemPlaceholder}
                        />
                        <button 
                            onClick={handleAddItem}
                            className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {newItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg group hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                <GripVertical size={16} className="text-gray-300 dark:text-gray-500 cursor-move" />
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                        const updatedItems = [...newItems];
                                        updatedItems[idx] = e.target.value;
                                        setNewItems(updatedItems);
                                    }}
                                    className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-none focus:outline-none focus:ring-0"
                                />
                                <button
                                    onClick={() => handleDeleteItem(idx)}
                                    className="text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-2xl flex justify-end gap-3">
                 <button
                    onClick={handleClose}
                    className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                    {t.modal.cancel}
                </button>
                <button 
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName || newItems.length === 0}
                    className="px-6 py-2 bg-smart-navy dark:bg-black text-white rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-700 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Check size={18} />
                    {t.modal.save}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
