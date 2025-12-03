
import React, { useState } from 'react';
import { Plus, Search, User, Phone, Mail, Award, Trash2, Pencil, X, Check, FileBadge, CheckSquare, AlertTriangle } from 'lucide-react';
import { Operator, TranslationDictionary } from '../types';

interface OperatorManagementProps {
  operators: Operator[];
  addOperator: (operator: Operator) => void;
  updateOperator: (operator: Operator) => void;
  deleteOperator: (id: string) => void;
  t: TranslationDictionary['operators'];
}

// Available Options for Multi-Select
const LICENSE_OPTIONS = ['G Sınıfı', 'C Sınıfı (Kamyon)', 'Forklift Sertifikası', 'Vinç Operatör Belgesi', 'SRC Belgesi', 'Psikoteknik'];

// Specialty options with English values (for API) and Turkish labels (for UI)
const SPECIALTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'excavator', label: 'Ekskavatör' },
  { value: 'dozer', label: 'Dozer' },
  { value: 'crane', label: 'Vinç' },
  { value: 'truck', label: 'Kamyon' },
  { value: 'loader', label: 'Yükleyici' },
  { value: 'forklift', label: 'Forklift' },
  { value: 'grader', label: 'Greyder' },
];

// Helper to get Turkish label from English value
const getSpecialtyLabel = (value: string): string => {
  const found = SPECIALTY_OPTIONS.find(opt => opt.value === value.toLowerCase());
  return found ? found.label : value;
};

// Helper to check if a specialty is selected (handles both Turkish labels and English values)
const isSpecialtySelected = (formSpecialties: string[], optionValue: string): boolean => {
  const option = SPECIALTY_OPTIONS.find(opt => opt.value === optionValue);
  if (!option) return false;
  // Check if either the value or label is in the array
  return formSpecialties.some(s =>
    s.toLowerCase() === optionValue.toLowerCase() ||
    s.toLowerCase() === option.label.toLowerCase()
  );
};

export const OperatorManagement: React.FC<OperatorManagementProps> = ({ operators, addOperator, updateOperator, deleteOperator, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null);

  const [formData, setFormData] = useState<Partial<Operator>>({
    name: '',
    licenseType: [],
    specialty: [],
    email: '',
    phone: '',
    avatar: ''
  });

  const resetForm = () => {
    setFormData({
        name: '',
        licenseType: [],
        specialty: [],
        email: '',
        phone: '',
        avatar: ''
    });
    setEditingOperator(null);
  };

  const openDeleteConfirm = (operator: Operator) => {
    setOperatorToDelete(operator);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!operatorToDelete) return;
    deleteOperator(operatorToDelete.id);
    setIsDeleteConfirmOpen(false);
    setOperatorToDelete(null);
  };

  const handleOpenModal = (operator?: Operator) => {
    if (operator) {
        setEditingOperator(operator);
        setFormData(operator);
    } else {
        resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avatarUrl = formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || '')}&background=random`;

    if (editingOperator) {
        updateOperator({
            ...editingOperator,
            ...formData as Operator,
            avatar: avatarUrl
        });
    } else {
        addOperator({
            id: Math.random().toString(36).substr(2, 9),
            ...formData as Operator,
            avatar: avatarUrl
        });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const toggleSelection = (field: 'licenseType' | 'specialty', value: string) => {
      setFormData(prev => {
          const currentList = prev[field] || [];
          if (currentList.includes(value)) {
              return { ...prev, [field]: currentList.filter(item => item !== value) };
          } else {
              return { ...prev, [field]: [...currentList, value] };
          }
      });
  };

  const filteredOperators = operators.filter(op =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.specialty.some(s =>
      s.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSpecialtyLabel(s).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
            <User className="text-smart-yellow" />
            {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-smart-navy dark:bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md border border-transparent dark:border-gray-700"
        >
          <Plus size={20} strokeWidth={3} />
          {t.addOperator}
        </button>
      </div>

       {/* Search */}
       <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="İsim veya uzmanlık ara..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-smart-navy/20 dark:focus:ring-gray-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOperators.map(op => (
          <div 
            key={op.id} 
            onClick={() => handleOpenModal(op)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-all group relative cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
          >
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); openDeleteConfirm(op); }}
                    className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                    title="Sil"
                >
                    <Trash2 size={16} />
                </button>
             </div>

             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-slate-700 mb-4 group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors">
                    <img src={op.avatar} alt={op.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-smart-navy dark:text-white">{op.name}</h3>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {op.specialty.map((spec, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                            {getSpecialtyLabel(spec)}
                        </span>
                    ))}
                    {op.specialty.length === 0 && <span className="text-xs text-gray-400 italic">Uzmanlık Yok</span>}
                </div>
             </div>

             <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
                        <FileBadge size={12} /> Belgeler
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {op.licenseType.map((lic, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded text-[10px]">
                                {lic}
                            </span>
                        ))}
                    </div>
                </div>
                {op.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="text-gray-400" />
                        <span>{op.phone}</span>
                    </div>
                )}
                {op.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{op.email}</span>
                    </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="bg-smart-navy dark:bg-black p-6 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingOperator ? <Pencil size={20}/> : <User size={20}/>}
                        {editingOperator ? t.editOperator : t.addOperator}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-1">{t.form.name}</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.form.license} (Çoklu Seçim)</label>
                            <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
                                {LICENSE_OPTIONS.map(opt => {
                                    const isSelected = formData.licenseType?.includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => toggleSelection('licenseType', opt)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                                isSelected 
                                                ? 'bg-smart-navy text-white border-smart-navy dark:bg-white dark:text-smart-navy' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-smart-navy dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600'
                                            }`}
                                        >
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.form.specialty} (Çoklu Seçim)</label>
                            <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
                                {SPECIALTY_OPTIONS.map(opt => {
                                    const isSelected = isSpecialtySelected(formData.specialty || [], opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => toggleSelection('specialty', opt.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                                isSelected
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-600 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600'
                                            }`}
                                        >
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-1">{t.form.phone}</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                                placeholder="+90 555 ..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-1">{t.form.email}</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            {t.form.cancel}
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-3 bg-smart-navy dark:bg-black text-white font-bold rounded-lg hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            {t.form.save}
                        </button>
                    </div>
                </form>
             </div>
         </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && operatorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-center text-smart-navy dark:text-white mb-2">
                Operatörü Silmek İstediğinize Emin Misiniz?
              </h3>
              <div className="flex flex-col items-center mb-4">
                <img src={operatorToDelete.avatar} alt={operatorToDelete.name} className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-slate-600 mb-2" />
                <p className="font-bold text-smart-navy dark:text-white">{operatorToDelete.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{operatorToDelete.email}</p>
              </div>
              <p className="text-center text-sm text-red-500 dark:text-red-400">
                Bu işlem geri alınamaz. Operatör ve tüm ilişkili veriler kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setOperatorToDelete(null); }}
                className="flex-1 px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
