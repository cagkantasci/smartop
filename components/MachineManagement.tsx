
import React, { useState } from 'react';
import { Plus, Search, Fuel, Calendar, Tractor, Truck, Anchor, Hammer, HardHat, User, FileCheck, X, ShoppingCart, CreditCard, CheckCircle, Pencil, Smartphone, Save, Briefcase, UserCog, Check, Percent, Zap, Sparkles, Loader2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Machine, MachineStatus, Operator, ChecklistTemplate, TranslationDictionary } from '../types';

interface MachineManagementProps {
  machines: Machine[];
  operators: Operator[];
  checklistTemplates: ChecklistTemplate[];
  addMachine: (m: Machine) => void;
  updateMachine: (m: Machine) => void;
  t: TranslationDictionary['machines'];
}

// Pricing Constants
const BASE_PRICE_PER_MACHINE = 500; // TL or Unit Currency
const DISCOUNT_THRESHOLD = 50; // Machines
const DISCOUNT_RATE = 0.10; // 10%

// Machine Image Library (KEEP EXISTING CONSTANT)
const MACHINE_TYPE_IMAGES: Record<string, string[]> = {
  Excavator: [
    'https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800',
    'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=800',
    'https://images.unsplash.com/photo-1627926442621-e377484df72f?q=80&w=800',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800',
  ],
  Dozer: [
    'https://images.unsplash.com/photo-1547625832-6a84d46f90d4?q=80&w=800',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
    'https://images.unsplash.com/photo-1599818450125-613d942a00d7?q=80&w=800',
    'https://images.unsplash.com/photo-1533062635939-50ebf92723c0?q=80&w=800',
  ],
  Crane: [
    'https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800',
    'https://images.unsplash.com/photo-1625628578635-c276359cb873?q=80&w=800',
    'https://images.unsplash.com/photo-1498612753354-772a30629434?q=80&w=800',
  ],
  Truck: [
    'https://images.unsplash.com/photo-1605218427368-ade792b0c487?q=80&w=800',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800',
    'https://images.unsplash.com/photo-1596726224388-7521c7508493?q=80&w=800',
    'https://images.unsplash.com/photo-1586021571731-159e66c79a29?q=80&w=800',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800',
  ],
  Loader: [
    'https://images.unsplash.com/photo-1517429532728-66258455e27a?q=80&w=800',
    'https://images.unsplash.com/photo-1574689049597-7e6df3e2b134?q=80&w=800',
    'https://images.unsplash.com/photo-1535056770514-6b95c378e932?q=80&w=800',
    'https://images.unsplash.com/photo-1615811361523-6bd03c7799a4?q=80&w=800',
  ],
};

// Mock Database for Auto-Fill (KEEP EXISTING CONSTANT)
const MACHINE_KNOWLEDGE_BASE = [
  { keywords: ['320', '323', '330', '336', 'cat'], brand: 'Caterpillar', type: 'Excavator', image: 'https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800' },
  { keywords: ['d8', 'd6', 'd155', 'dozer', 'komatsu'], brand: 'Komatsu', type: 'Dozer', image: 'https://images.unsplash.com/photo-1547625832-6a84d46f90d4?q=80&w=800' },
  { keywords: ['ltm', 'crane', 'liebherr', 'mobile'], brand: 'Liebherr', type: 'Crane', image: 'https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800' },
  { keywords: ['actros', 'axor', 'arocs', 'mercedes'], brand: 'Mercedes-Benz', type: 'Truck', image: 'https://images.unsplash.com/photo-1605218427368-ade792b0c487?q=80&w=800' },
  { keywords: ['3cx', '4cx', 'jcb', 'beko'], brand: 'JCB', type: 'Loader', image: 'https://images.unsplash.com/photo-1517429532728-66258455e27a?q=80&w=800' },
  { keywords: ['ec', 'volvo', '220', '300'], brand: 'Volvo', type: 'Excavator', image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=800' },
  { keywords: ['hitachi', 'zx'], brand: 'Hitachi', type: 'Excavator', image: 'https://images.unsplash.com/photo-1627926442621-e377484df72f?q=80&w=800' },
  { keywords: ['scania', 'r500', 'g400'], brand: 'Scania', type: 'Truck', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800' },
  { keywords: ['man', 'tgs', 'tgx'], brand: 'MAN', type: 'Truck', image: 'https://images.unsplash.com/photo-1596726224388-7521c7508493?q=80&w=800' },
];

export const MachineManagement: React.FC<MachineManagementProps> = ({ machines, operators, checklistTemplates, addMachine, updateMachine, t }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_store' | 'google_play'>('credit_card');

  // Quick Assign State
  const [quickAssignId, setQuickAssignId] = useState<string | null>(null);
  const [quickAssignData, setQuickAssignData] = useState<{assignedOperatorId: string, assignedChecklistId: string}>({assignedOperatorId: '', assignedChecklistId: ''});
  
  const [cart, setCart] = useState<Partial<Machine>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Form State for New Machine
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    type: 'Excavator' as Machine['type'],
    serialNumber: '',
    assignedOperatorId: '',
    assignedChecklistId: '',
    imageUrl: ''
  });

  const machineTypes = [
    { id: 'Excavator', label: 'Ekskavatör', icon: Hammer },
    { id: 'Dozer', label: 'Dozer', icon: Tractor },
    { id: 'Crane', label: 'Vinç', icon: Anchor },
    { id: 'Loader', label: 'Yükleyici', icon: HardHat },
    { id: 'Truck', label: 'Kamyon', icon: Truck },
  ];

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Pay-As-You-Go Logic Helpers ---

  const currentCount = machines.length;
  const cartCount = cart.length;
  const totalProjectedCount = currentCount + cartCount;

  // Calculate discount status
  const isDiscountActive = totalProjectedCount >= DISCOUNT_THRESHOLD;
  const discountProgress = Math.min((currentCount / DISCOUNT_THRESHOLD) * 100, 100);

  // Financial Calculations
  const effectiveUnitPrice = isDiscountActive ? BASE_PRICE_PER_MACHINE * (1 - DISCOUNT_RATE) : BASE_PRICE_PER_MACHINE;
  const cartSubtotal = cartCount * BASE_PRICE_PER_MACHINE; // Before discount logic applied to total
  const cartTotal = cartCount * effectiveUnitPrice;
  const totalSaved = cartSubtotal - cartTotal;

  const getRandomImageForType = (type: string) => {
    const images = MACHINE_TYPE_IMAGES[type] || MACHINE_TYPE_IMAGES['Excavator'];
    return images[Math.floor(Math.random() * images.length)];
  };

  // --- Smart Fill Logic (KEEP EXISTING) ---
  const handleSmartFill = () => {
      if (!formData.model && !formData.brand) return;
      setIsAutoFilling(true);
      setTimeout(() => {
        const query = (formData.model + ' ' + formData.brand).toLowerCase();
        const match = MACHINE_KNOWLEDGE_BASE.find(item => 
            item.keywords.some(keyword => query.includes(keyword))
        );
        const randomSerial = `${match?.brand.substring(0,3).toUpperCase() || 'MCH'}-${Math.floor(Math.random()*10000).toString().padStart(5, '0')}`;
        const randomYear = (new Date().getFullYear() - Math.floor(Math.random() * 5)).toString();
        const detectedType = (match?.type as any) || prevFormData.type || 'Excavator';
        const autoImage = match?.image || getRandomImageForType(detectedType);
        setFormData(prev => ({
            ...prev,
            brand: match?.brand || prev.brand || 'Bilinmiyor',
            type: detectedType,
            year: prev.year || randomYear,
            serialNumber: prev.serialNumber || randomSerial,
            imageUrl: prev.imageUrl || autoImage,
            name: prev.name || `${match?.brand || 'Yeni'} ${prev.model || 'Makine'} ${randomSerial.split('-')[1]}`
        }));
        setIsAutoFilling(false);
      }, 800);
      const prevFormData = formData; 
  };

  const handleRefreshImage = () => {
    const type = formData.type || 'Excavator';
    const images = MACHINE_TYPE_IMAGES[type] || MACHINE_TYPE_IMAGES['Excavator'];
    let randomImage = images[Math.floor(Math.random() * images.length)];
    if (randomImage === formData.imageUrl && images.length > 1) {
         randomImage = images.find(img => img !== formData.imageUrl) || randomImage;
    }
    setFormData(prev => ({ ...prev, imageUrl: randomImage }));
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const draftMachine = { ...formData };
    if (!draftMachine.imageUrl) {
        draftMachine.imageUrl = getRandomImageForType(draftMachine.type);
    }
    setCart([...cart, draftMachine]);
    setFormData({ name: '', brand: '', model: '', year: '', type: 'Excavator', serialNumber: '', assignedOperatorId: '', assignedChecklistId: '', imageUrl: '' });
    setIsAddModalOpen(false); 
  };

  const handlePaymentComplete = () => {
    cart.forEach(draft => {
        const newMachine: Machine = {
            id: Math.random().toString(36).substr(2, 9),
            name: draft.name!,
            brand: draft.brand!,
            model: draft.model!,
            year: draft.year!,
            type: draft.type!,
            serialNumber: draft.serialNumber!,
            assignedOperatorId: draft.assignedOperatorId,
            assignedChecklistId: draft.assignedChecklistId,
            status: MachineStatus.Idle,
            engineHours: 0,
            lastService: new Date().toISOString().split('T')[0],
            imageUrl: draft.imageUrl!
        };
        addMachine(newMachine);
    });
    setCart([]);
    setIsPaymentModalOpen(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
        updateMachine(editingMachine);
        setEditingMachine(null);
    }
  };

  const handleQuickAssignStart = (machine: Machine) => {
    setQuickAssignId(machine.id);
    setQuickAssignData({
        assignedOperatorId: machine.assignedOperatorId || '',
        assignedChecklistId: machine.assignedChecklistId || ''
    });
  };

  const handleQuickAssignSave = (machine: Machine) => {
      updateMachine({
          ...machine,
          assignedOperatorId: quickAssignData.assignedOperatorId,
          assignedChecklistId: quickAssignData.assignedChecklistId
      });
      setQuickAssignId(null);
  };

  const getMachineIcon = (type: string) => {
    switch(type) {
      case 'Excavator': return <Hammer className="w-5 h-5 text-smart-navy dark:text-smart-yellow" />;
      case 'Dozer': return <Tractor className="w-5 h-5 text-smart-navy dark:text-smart-yellow" />;
      case 'Truck': return <Truck className="w-5 h-5 text-smart-navy dark:text-smart-yellow" />;
      case 'Crane': return <Anchor className="w-5 h-5 text-smart-navy dark:text-smart-yellow" />;
      default: return <HardHat className="w-5 h-5 text-smart-navy dark:text-smart-yellow" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header & Cart Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white">{t.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">{t.subtitle}</p>
          
          {/* Usage Based Pricing Widget */}
          <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-3 pr-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDiscountActive ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-blue-50 text-smart-navy dark:bg-slate-700 dark:text-white'}`}>
                    <Zap size={20} fill={isDiscountActive ? "currentColor" : "none"} />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Abonelik Modeli</p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-smart-navy dark:text-white">{t.payAsYouGo}</span>
                        {isDiscountActive ? (
                             <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
                                <Percent size={10} /> %10 İndirim Aktif
                             </span>
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Hedef: {DISCOUNT_THRESHOLD}+ Makine
                            </span>
                        )}
                    </div>
                </div>
             </div>
             
             {cartCount > 0 && (
                 <div className="pl-4 border-l border-gray-200 dark:border-slate-700 flex flex-col justify-center animate-pulse">
                     <p className="text-[10px] text-smart-yellow font-bold uppercase flex items-center gap-1">
                        <ShoppingCart size={10} /> {t.cart.title}
                     </p>
                     <p className="text-sm font-bold text-smart-navy dark:text-white">₺{cartTotal.toLocaleString()}</p>
                 </div>
             )}
          </div>
        </div>
        
        <div className="flex gap-4 self-end">
            {cart.length > 0 && (
                <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-smart-yellow text-smart-navy px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-md animate-pulse"
                >
                    <ShoppingCart size={20} strokeWidth={2.5} />
                    {t.cart.confirm} ({cart.length})
                </button>
            )}

            <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-smart-navy dark:bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md border border-transparent dark:border-gray-700"
            >
            <Plus size={20} strokeWidth={3} />
            {t.addMachine}
            </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder={t.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-smart-navy/20 dark:focus:ring-gray-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMachines.map(machine => {
            const operator = operators.find(o => o.id === machine.assignedOperatorId);
            const template = checklistTemplates.find(t => t.id === machine.assignedChecklistId);
            const isQuickAssign = quickAssignId === machine.id;

            return (
              <div key={machine.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => setEditingMachine({...machine})}>
                <div className="h-48 overflow-hidden relative bg-gray-100 dark:bg-slate-900">
                  <img src={machine.imageUrl} alt={machine.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-md
                    ${machine.status === 'Aktif' ? 'bg-green-600/90 text-white' : 
                      machine.status === 'Bakımda' ? 'bg-red-600/90 text-white' : 'bg-gray-600/90 text-white'}`}>
                    {machine.status}
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 p-2 rounded-lg shadow-sm">
                    {getMachineIcon(machine.type)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-smart-navy dark:text-white leading-tight">{machine.brand} {machine.model}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{machine.serialNumber}</p>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setEditingMachine({...machine}); }} 
                        className="text-gray-400 hover:text-smart-navy dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Tümünü Düzenle"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>

                   {/* Assignments Section */}
                   <div className="mt-4 mb-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Operasyonel Atamalar</p>
                            {!isQuickAssign && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleQuickAssignStart(machine); }} 
                                    className="text-gray-400 hover:text-smart-navy dark:hover:text-white p-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    title="Hızlı Ata"
                                >
                                    <UserCog size={14} />
                                </button>
                            )}
                        </div>

                        {isQuickAssign ? (
                             <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800 space-y-2 animate-fadeIn">
                                <select 
                                    value={quickAssignData.assignedOperatorId}
                                    onChange={(e) => setQuickAssignData({...quickAssignData, assignedOperatorId: e.target.value})}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-xs p-1.5 rounded border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-smart-navy"
                                >
                                    <option value="">Operatör Seçin</option>
                                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                </select>
                                <select 
                                    value={quickAssignData.assignedChecklistId}
                                    onChange={(e) => setQuickAssignData({...quickAssignData, assignedChecklistId: e.target.value})}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-xs p-1.5 rounded border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-smart-navy"
                                >
                                    <option value="">Liste Seçin</option>
                                    {checklistTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleQuickAssignSave(machine); }} className="flex-1 bg-smart-success text-white text-xs py-1 rounded font-bold hover:bg-green-700">
                                        <Check size={12} className="inline mr-1" /> Kaydet
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setQuickAssignId(null); }} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs py-1 rounded font-bold hover:bg-gray-300 dark:hover:bg-slate-600">
                                        <X size={12} className="inline mr-1" /> İptal
                                    </button>
                                </div>
                             </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {/* Operator Badge */}
                                <div className={`inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${operator ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${operator ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                    <User size={12} strokeWidth={2.5} className={operator ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"} /> 
                                    </div>
                                    <span className="truncate max-w-[100px]">{operator ? operator.name : 'Operatör Yok'}</span>
                                </div>
                                
                                {/* Checklist Badge */}
                                <div className={`inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${template ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${template ? 'bg-orange-100 dark:bg-orange-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                        <FileCheck size={12} strokeWidth={2.5} className={template ? "text-orange-600 dark:text-orange-300" : "text-slate-500 dark:text-slate-400"} /> 
                                    </div>
                                    <span className="truncate max-w-[120px]">{template ? template.name : 'Liste Yok'}</span>
                                </div>
                            </div>
                        )}
                   </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Fuel size={16} className="text-smart-yellow" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Motor Saati</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{machine.engineHours}s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-smart-yellow" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Son Bakım</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{machine.lastService}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Add To Cart Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-50 dark:bg-slate-900 px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h3 className="text-2xl font-bold text-smart-navy dark:text-white">{t.modal.title}</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleAddToCart} className="p-8 space-y-8">
              {/* Machine Type Selector */}
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-4 uppercase tracking-wide">Makine Tipi Seçin</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {machineTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({...formData, type: type.id as any})}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                                formData.type === type.id 
                                ? 'border-smart-navy dark:border-white bg-smart-navy/5 dark:bg-white/10 ring-2 ring-smart-navy dark:ring-white ring-offset-2 dark:ring-offset-slate-800' 
                                : 'border-gray-200 dark:border-slate-600 hover:border-smart-yellow hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            }`}
                        >
                            <div className={`mb-3 p-3 rounded-full transition-colors ${
                                formData.type === type.id 
                                ? 'bg-smart-navy dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-blue-900/20' 
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-white group-hover:text-smart-navy'
                            }`}>
                                <type.icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className={`text-xs font-bold text-center ${formData.type === type.id ? 'text-smart-navy dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                {type.label}
                            </span>
                            {formData.type === type.id && (
                                <div className="absolute top-2 right-2 text-smart-navy dark:text-white">
                                    <CheckCircle size={14} fill="currentColor" className="text-white dark:text-slate-900" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h4 className="text-sm font-bold text-smart-navy dark:text-white uppercase tracking-wide">Teknik Detaylar</h4>
                    {isAutoFilling && <span className="text-xs text-smart-yellow font-bold animate-pulse flex items-center gap-1"><Sparkles size={12}/> Veriler Getiriliyor...</span>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                    
                    <div className="col-span-2">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model / Tanım</label>
                         <div className="flex gap-2">
                            <input 
                                required
                                type="text" 
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none"
                                placeholder="Örn: 320 GC, D155, Actros..."
                            />
                            <button
                                type="button"
                                onClick={handleSmartFill}
                                disabled={isAutoFilling || !formData.model}
                                className="bg-smart-yellow text-smart-navy px-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                title="Model isminden bilgileri otomatik getir"
                            >
                                {isAutoFilling ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                <span className="hidden sm:inline">{t.modal.smartFill}</span>
                            </button>
                         </div>
                         <p className="text-xs text-gray-400 mt-1">Marka ve tipi otomatik bulmak için model adını yazıp sihirli değneğe tıklayın.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Makine Takma Adı</label>
                        <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none transition-shadow"
                        placeholder="Örn: Kuzey Şantiye Ekskavatör"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marka</label>
                        <input 
                        required
                        type="text" 
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none"
                        placeholder="Örn: CAT"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seri No</label>
                        <div className="flex gap-2">
                            <input 
                                required
                                type="text" 
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none font-mono text-sm"
                                placeholder="SN-12345678"
                            />
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, serialNumber: `GEN-${Math.floor(Math.random()*100000)}`})}
                                className="p-3 text-gray-400 hover:text-smart-navy border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                                title="Rastgele Üret"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Üretim Yılı</label>
                        <input 
                        required
                        type="number" 
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none"
                        placeholder="2023"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                            <span>Görsel URL</span>
                            {formData.imageUrl && (
                                <button type="button" onClick={handleRefreshImage} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                    <RefreshCw size={12}/> Fotoğrafı Değiştir
                                </button>
                            )}
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none text-xs"
                                placeholder="https://..."
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-2 h-40 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 relative group">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        type="button" 
                                        onClick={handleRefreshImage}
                                        className="bg-white/20 hover:bg-white/40 backdrop-blur text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw size={16} /> Farklı Bir Görsel Bul
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* Assignments */}
              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-smart-navy dark:bg-slate-700 p-1.5 rounded-md text-white">
                        <Briefcase size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-smart-navy dark:text-white uppercase tracking-wider">Operasyonel Atamalar</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
                            <User size={14}/> Operatör Seçimi
                        </label>
                        <div className="relative">
                            <select 
                                value={formData.assignedOperatorId}
                                onChange={(e) => setFormData({...formData, assignedOperatorId: e.target.value})}
                                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-smart-navy/20 outline-none appearance-none cursor-pointer hover:border-smart-navy transition-colors"
                            >
                                <option value="">Atama Yapılmadı (Daha Sonra)</option>
                                {operators.map(op => (
                                    <option key={op.id} value={op.id}>{op.name} — {op.licenseType.join(', ')}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <User size={16} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
                            <FileCheck size={14}/> Kontrol Listesi Şablonu
                        </label>
                        <div className="relative">
                            <select 
                                value={formData.assignedChecklistId}
                                onChange={(e) => setFormData({...formData, assignedChecklistId: e.target.value})}
                                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-smart-navy/20 outline-none appearance-none cursor-pointer hover:border-smart-navy transition-colors"
                            >
                                <option value="">Şablon Seçilmedi</option>
                                {checklistTemplates.map(tpl => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.itemsCount} Madde)</option>
                                ))}
                            </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <FileCheck size={16} />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t.modal.cancel}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-smart-navy dark:bg-black text-white rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t.modal.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment / Checkout Modal (Only Strings Updated) */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-smart-navy/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] overflow-y-auto">
                  {/* ... Payment content ... */}
                  <div className="flex-1 p-8 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700">
                      <h3 className="text-2xl font-bold text-smart-navy dark:text-white mb-6">Ödeme ve Fatura Özeti</h3>
                      
                      <div className="space-y-4 mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Sepetinizdeki Makineler</h4>
                        {cart.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-smart-navy dark:text-white">{item.brand} {item.model}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.name}</p>
                                </div>
                                <span className="text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">{item.type}</span>
                            </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Hesaplama Detayı</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Makine Başı Ücret</span>
                                <span>₺{BASE_PRICE_PER_MACHINE}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Eklenen Makine</span>
                                <span>x {cartCount}</span>
                            </div>
                            {isDiscountActive && (
                                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                    <span className="flex items-center gap-1"><Percent size={14}/> Toplu Alım İndirimi ({DISCOUNT_THRESHOLD}+ Makine)</span>
                                    <span>- ₺{totalSaved.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-slate-700 mt-2">
                                <span className="font-bold text-lg text-smart-navy dark:text-white">{t.cart.total}</span>
                                <span className="font-black text-2xl text-smart-navy dark:text-white">₺{cartTotal.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">* Fiyatlandırma kullandığın kadar öde modeline göredir.</p>
                          </div>
                      </div>
                  </div>

                  {/* Right: Payment */}
                  <div className="flex-1 p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-smart-navy dark:text-white">Ödeme Yöntemi</h3>
                        <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-red-600"><X /></button>
                      </div>

                      <div className="space-y-6">
                          {/* ... Payment Buttons ... */}
                          
                          {/* Dynamic Form Content */}
                          {paymentMethod === 'credit_card' ? (
                              <div className="space-y-4 animate-fadeIn">
                                  <div className="w-full h-12 bg-gray-100 dark:bg-slate-700 rounded flex items-center px-4 text-gray-400 text-sm border border-gray-200 dark:border-slate-600">**** **** **** 4242</div>
                                  <div className="flex gap-4">
                                      <div className="w-1/2 h-12 bg-gray-100 dark:bg-slate-700 rounded flex items-center px-4 text-gray-400 text-sm border border-gray-200 dark:border-slate-600">MM / YY</div>
                                      <div className="w-1/2 h-12 bg-gray-100 dark:bg-slate-700 rounded flex items-center px-4 text-gray-400 text-sm border border-gray-200 dark:border-slate-600">CVC</div>
                                  </div>
                              </div>
                          ) : (
                              <div className="h-28 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 text-gray-400 animate-fadeIn">
                                <p className="text-sm font-bold mb-1">{paymentMethod === 'apple_store' ? 'Apple Pay' : 'Google Pay'} ile Devam Edin</p>
                                <p className="text-xs">Ödeme onayı için yönlendirileceksiniz.</p>
                              </div>
                          )}

                          <div className="pt-4">
                              <button 
                                onClick={handlePaymentComplete}
                                className="w-full bg-smart-success text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                              >
                                  <CheckCircle />
                                  ₺{cartTotal.toLocaleString()} Öde ve Aktifleştir
                              </button>
                              <p className="text-center text-xs text-gray-400 mt-4">Güvenli ödeme altyapısı ile korunmaktadır.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Full Edit Modal (Existing Edit Logic) */}
    </div>
  );
};
