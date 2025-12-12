
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Fuel, Calendar, Tractor, Truck, Anchor, Hammer, HardHat, User, FileCheck, X, ShoppingCart, CreditCard, CheckCircle, Pencil, Smartphone, Save, Briefcase, UserCog, Check, Percent, Zap, Sparkles, Loader2, RefreshCw, Image as ImageIcon, Trash2, AlertTriangle, MapPin, Wrench, Settings, CircleDot, Box, Boxes, Factory, Power, Wind, Construction, ArrowUpDown, Container, Shovel } from 'lucide-react';
import { Machine, MachineStatus, MachineStatusLabels, Operator, ChecklistTemplate, TranslationDictionary } from '../types';

interface MachineManagementProps {
  machines: Machine[];
  operators: Operator[];
  checklistTemplates: ChecklistTemplate[];
  addMachine: (m: Machine) => void;
  updateMachine: (m: Machine) => void;
  deleteMachine?: (id: string) => void;
  t: TranslationDictionary['machines'];
}

// Pricing Constants
const BASE_PRICE_PER_MACHINE = 500; // TL or Unit Currency
const DISCOUNT_THRESHOLD = 50; // Machines
const DISCOUNT_RATE = 0.10; // 10%

// Machine Image Library - Extended for all types
const MACHINE_TYPE_IMAGES: Record<string, string[]> = {
  Excavator: [
    'https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800',
    'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=800',
    'https://images.unsplash.com/photo-1627926442621-e377484df72f?q=80&w=800',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
  Dozer: [
    'https://images.unsplash.com/photo-1547625832-6a84d46f90d4?q=80&w=800',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
    'https://images.unsplash.com/photo-1599818450125-613d942a00d7?q=80&w=800',
  ],
  Crane: [
    'https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800',
    'https://images.unsplash.com/photo-1625628578635-c276359cb873?q=80&w=800',
  ],
  Truck: [
    'https://images.unsplash.com/photo-1605218427368-ade792b0c487?q=80&w=800',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800',
    'https://images.unsplash.com/photo-1596726224388-7521c7508493?q=80&w=800',
  ],
  Loader: [
    'https://images.unsplash.com/photo-1517429532728-66258455e27a?q=80&w=800',
    'https://images.unsplash.com/photo-1574689049597-7e6df3e2b134?q=80&w=800',
    'https://images.unsplash.com/photo-1535056770514-6b95c378e932?q=80&w=800',
  ],
  Grader: [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
  ],
  Roller: [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800',
  ],
  Forklift: [
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800',
  ],
  Backhoe: [
    'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=800',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
  SkidSteer: [
    'https://images.unsplash.com/photo-1517429532728-66258455e27a?q=80&w=800',
    'https://images.unsplash.com/photo-1535056770514-6b95c378e932?q=80&w=800',
  ],
  Telehandler: [
    'https://images.unsplash.com/photo-1574689049597-7e6df3e2b134?q=80&w=800',
    'https://images.unsplash.com/photo-1615811361523-6bd03c7799a4?q=80&w=800',
  ],
  Compactor: [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800',
  ],
  Paver: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
  ],
  Trencher: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
  Drill: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
  Generator: [
    'https://images.unsplash.com/photo-1548695607-9c73430ba065?q=80&w=800',
  ],
  Compressor: [
    'https://images.unsplash.com/photo-1548695607-9c73430ba065?q=80&w=800',
  ],
  ConcreteEquipment: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
  Lift: [
    'https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800',
  ],
  Trailer: [
    'https://images.unsplash.com/photo-1605218427368-ade792b0c487?q=80&w=800',
  ],
  Scraper: [
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
  ],
  Other: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
  ],
};

// API URL for machine reference data
const API_URL = '/api/v1';

// Machine type category mapping from API slugs to frontend types
const CATEGORY_TO_TYPE_MAP: Record<string, Machine['type']> = {
  // Excavator types
  'excavators': 'Excavator',
  'crawler-excavators': 'Excavator',
  'wheeled-excavators': 'Excavator',
  'mini-excavators': 'Excavator',
  'long-reach-excavators': 'Excavator',
  // Dozer
  'dozers': 'Dozer',
  // Loader types
  'loaders': 'Loader',
  'wheel-loaders': 'Loader',
  'track-loaders': 'Loader',
  'compact-track-loaders': 'Loader',
  // Crane types
  'cranes': 'Crane',
  'crawler-cranes': 'Crane',
  'rough-terrain-cranes': 'Crane',
  'all-terrain-cranes': 'Crane',
  'truck-cranes': 'Crane',
  'tower-cranes': 'Crane',
  // Truck
  'trucks': 'Truck',
  // Grader
  'graders': 'Grader',
  // Roller
  'rollers': 'Roller',
  // Forklift
  'forklifts': 'Forklift',
  // Backhoe
  'backhoes': 'Backhoe',
  // Skid Steer
  'skid-steers': 'SkidSteer',
  // Telehandler
  'telehandlers': 'Telehandler',
  // Compactor
  'compactors': 'Compactor',
  // Paver
  'pavers': 'Paver',
  // Trencher
  'trenchers': 'Trencher',
  // Drill
  'drills': 'Drill',
  // Generator
  'generators': 'Generator',
  // Compressor
  'compressors': 'Compressor',
  // Concrete Equipment
  'concrete-equipment': 'ConcreteEquipment',
  // Lift types
  'lifts': 'Lift',
  'boom-lifts': 'Lift',
  'scissor-lifts': 'Lift',
  'personnel-lifts': 'Lift',
  // Trailer
  'trailers': 'Trailer',
  // Scraper
  'scrapers': 'Scraper',
};

// Smart fill suggestion type
interface SmartFillSuggestion {
  type: string;
  brand: string;
  brandId: string;
  model: string | null;
  modelId: string | null;
  fullName: string;
  category: string | null;
  categoryId: string | null;
  confidence: number;
}

interface SmartFillResponse {
  suggestions: SmartFillSuggestion[];
  matchedBrand: { id: string; name: string; slug: string } | null;
  matchedCategory: { id: string; name: string; nameEn: string; nameTr: string; slug: string } | null;
  matchedModels: Array<{
    id: string;
    name: string;
    fullName: string | null;
    brand: { id: string; name: string; slug: string };
    category: { id: string; name: string; nameEn: string; nameTr: string; slug: string } | null;
  }>;
}

export const MachineManagement: React.FC<MachineManagementProps> = ({ machines, operators, checklistTemplates, addMachine, updateMachine, deleteMachine, t }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_store' | 'google_play'>('credit_card');

  // Quick Assign State
  const [quickAssignId, setQuickAssignId] = useState<string | null>(null);
  const [quickAssignData, setQuickAssignData] = useState<{assignedOperatorId: string, assignedChecklistId: string}>({assignedOperatorId: '', assignedChecklistId: ''});
  
  const [cart, setCart] = useState<Partial<Machine>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Smart Fill Suggestions State
  const [smartFillSuggestions, setSmartFillSuggestions] = useState<SmartFillSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Machine types with translated labels
  const machineTypes = [
    { id: 'Excavator', label: t.types.excavator, icon: Hammer },
    { id: 'Dozer', label: t.types.dozer, icon: Tractor },
    { id: 'Crane', label: t.types.crane, icon: Anchor },
    { id: 'Loader', label: t.types.loader, icon: HardHat },
    { id: 'Truck', label: t.types.truck, icon: Truck },
    { id: 'Grader', label: t.types.grader, icon: Shovel },
    { id: 'Roller', label: t.types.roller, icon: CircleDot },
    { id: 'Forklift', label: t.types.forklift, icon: Box },
    { id: 'Backhoe', label: t.types.backhoe, icon: Construction },
    { id: 'SkidSteer', label: t.types.skidSteer, icon: Boxes },
    { id: 'Telehandler', label: t.types.telehandler, icon: ArrowUpDown },
    { id: 'Compactor', label: t.types.compactor, icon: CircleDot },
    { id: 'Paver', label: t.types.paver, icon: Factory },
    { id: 'Trencher', label: t.types.trencher, icon: Shovel },
    { id: 'Drill', label: t.types.drill, icon: Wrench },
    { id: 'Generator', label: t.types.generator, icon: Power },
    { id: 'Compressor', label: t.types.compressor, icon: Wind },
    { id: 'ConcreteEquipment', label: t.types.concreteEquipment, icon: Factory },
    { id: 'Lift', label: t.types.lift, icon: ArrowUpDown },
    { id: 'Trailer', label: t.types.trailer, icon: Container },
    { id: 'Scraper', label: t.types.scraper, icon: Shovel },
    { id: 'Other', label: t.types.other, icon: Settings },
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

  // --- Smart Fill Logic using API ---

  // Auto-search with debounce when user types in the search field
  useEffect(() => {
    if (!isAddModalOpen) return;

    const query = `${formData.brand} ${formData.model}`.trim();
    if (query.length < 2) {
      setSmartFillSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      // Fetch suggestions
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
          const response = await fetch(`${API_URL}/machine-reference/smart-fill?name=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('API error');

          const data: SmartFillResponse = await response.json();
          setSmartFillSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        } catch (error) {
          console.error('Fetch suggestions error:', error);
          setSmartFillSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.model, formData.brand, isAddModalOpen]);

  // Fetch suggestions when user types (manual trigger)
  const fetchSmartFillSuggestions = async () => {
    const query = `${formData.brand} ${formData.model}`.trim();
    if (query.length < 2) {
      setSmartFillSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_URL}/machine-reference/smart-fill?name=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('API error');

      const data: SmartFillResponse = await response.json();
      setSmartFillSuggestions(data.suggestions);
      setShowSuggestions(data.suggestions.length > 0);
    } catch (error) {
      console.error('Fetch suggestions error:', error);
      setSmartFillSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle selecting a suggestion from the dropdown
  const handleSelectSuggestion = (suggestion: SmartFillSuggestion) => {
    // Determine machine type from category
    let detectedType: Machine['type'] = formData.type || 'Excavator';
    if (suggestion.category) {
      const categorySlug = suggestion.category.toLowerCase().replace(/\s+/g, '-');
      detectedType = CATEGORY_TO_TYPE_MAP[categorySlug] || detectedType;
    }

    const brandName = suggestion.brand || formData.brand || 'Bilinmiyor';
    const modelName = suggestion.model || formData.model || '';
    const randomSerial = `${brandName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
    const randomYear = (new Date().getFullYear() - Math.floor(Math.random() * 5)).toString();
    const autoImage = getRandomImageForType(detectedType);

    setFormData(prev => ({
      ...prev,
      brand: brandName,
      model: modelName || prev.model,
      type: detectedType,
      year: prev.year || randomYear,
      serialNumber: prev.serialNumber || randomSerial,
      imageUrl: prev.imageUrl || autoImage,
      name: prev.name || `${brandName} ${modelName || prev.model || 'Makine'} ${randomSerial.split('-')[1]}`
    }));

    setShowSuggestions(false);
    setSmartFillSuggestions([]);
  };

  // Original handleSmartFill - now shows suggestions instead of auto-selecting
  const handleSmartFill = async () => {
      if (!formData.model && !formData.brand) return;
      setIsAutoFilling(true);

      try {
        const query = `${formData.brand} ${formData.model}`.trim();
        const response = await fetch(`${API_URL}/machine-reference/smart-fill?name=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error('API error');
        }

        const data: SmartFillResponse = await response.json();

        // If we have suggestions, show them in the dropdown
        if (data.suggestions.length > 0) {
          setSmartFillSuggestions(data.suggestions);
          setShowSuggestions(true);
          setIsAutoFilling(false);
          return;
        }

        // If no suggestions, fallback to auto-fill
        const matchedBrand = data.matchedBrand;
        const matchedModel = data.matchedModels[0];
        const matchedCategory = data.matchedCategory;

        // Determine machine type from category
        let detectedType: Machine['type'] = formData.type || 'Excavator';
        if (matchedCategory?.slug) {
          detectedType = CATEGORY_TO_TYPE_MAP[matchedCategory.slug] || detectedType;
        } else if (matchedModel?.category?.slug) {
          detectedType = CATEGORY_TO_TYPE_MAP[matchedModel.category.slug] || detectedType;
        }

        // Generate random values for missing fields
        const brandName = matchedBrand?.name || formData.brand || 'Bilinmiyor';
        const modelName = matchedModel?.name || formData.model || '';
        const randomSerial = `${brandName.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*10000).toString().padStart(5, '0')}`;
        const randomYear = (new Date().getFullYear() - Math.floor(Math.random() * 5)).toString();
        const autoImage = getRandomImageForType(detectedType);

        setFormData(prev => ({
            ...prev,
            brand: brandName,
            model: modelName || prev.model,
            type: detectedType,
            year: prev.year || randomYear,
            serialNumber: prev.serialNumber || randomSerial,
            imageUrl: prev.imageUrl || autoImage,
            name: prev.name || `${brandName} ${modelName || prev.model || 'Makine'} ${randomSerial.split('-')[1]}`
        }));
      } catch (error) {
        console.error('Smart fill error:', error);
        // Fallback to basic auto-fill
        const randomSerial = `MCH-${Math.floor(Math.random()*10000).toString().padStart(5, '0')}`;
        const randomYear = (new Date().getFullYear() - Math.floor(Math.random() * 5)).toString();
        const autoImage = getRandomImageForType(formData.type || 'Excavator');

        setFormData(prev => ({
            ...prev,
            year: prev.year || randomYear,
            serialNumber: prev.serialNumber || randomSerial,
            imageUrl: prev.imageUrl || autoImage,
            name: prev.name || `${prev.brand || 'Yeni'} ${prev.model || 'Makine'} ${randomSerial.split('-')[1]}`
        }));
      } finally {
        setIsAutoFilling(false);
      }
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

  const openDeleteConfirm = (machine: Machine) => {
    setMachineToDelete(machine);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!machineToDelete || !deleteMachine) return;
    deleteMachine(machineToDelete.id);
    setIsDeleteConfirmOpen(false);
    setMachineToDelete(null);
    if (editingMachine?.id === machineToDelete.id) {
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
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.subscription.title}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-smart-navy dark:text-white">{t.subscription.payAsYouGo}</span>
                        {isDiscountActive ? (
                             <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
                                <Percent size={10} /> {t.subscription.discountEarned}
                             </span>
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {t.subscription.totalMachines}: {DISCOUNT_THRESHOLD}+
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
                    ${machine.status === MachineStatus.Active ? 'bg-green-600/90 text-white' :
                      machine.status === MachineStatus.Maintenance ? 'bg-red-600/90 text-white' : 'bg-gray-600/90 text-white'}`}>
                    {MachineStatusLabels[machine.status as MachineStatus] || machine.status}
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
                        title={t.actions.editAll}
                    >
                      <Pencil size={18} />
                    </button>
                  </div>

                   {/* Assignments Section */}
                   <div className="mt-4 mb-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t.operations.title}</p>
                            {!isQuickAssign && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleQuickAssignStart(machine); }}
                                    className="text-gray-400 hover:text-smart-navy dark:hover:text-white p-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    title={t.operations.quickAssign}
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
                                    <option value="">{t.modal.selectOperator}</option>
                                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                </select>
                                <select
                                    value={quickAssignData.assignedChecklistId}
                                    onChange={(e) => setQuickAssignData({...quickAssignData, assignedChecklistId: e.target.value})}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-xs p-1.5 rounded border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-smart-navy"
                                >
                                    <option value="">{t.modal.selectChecklist}</option>
                                    {checklistTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleQuickAssignSave(machine); }} className="flex-1 bg-smart-success text-white text-xs py-1 rounded font-bold hover:bg-green-700">
                                        <Check size={12} className="inline mr-1" /> {t.modal.save}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setQuickAssignId(null); }} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs py-1 rounded font-bold hover:bg-gray-300 dark:hover:bg-slate-600">
                                        <X size={12} className="inline mr-1" /> {t.modal.cancel}
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
                                    <span className="truncate max-w-[100px]">{operator ? operator.name : t.modal.noOperator}</span>
                                </div>

                                {/* Checklist Badge */}
                                <div className={`inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-[10px] font-semibold border transition-colors ${template ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${template ? 'bg-orange-100 dark:bg-orange-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                        <FileCheck size={12} strokeWidth={2.5} className={template ? "text-orange-600 dark:text-orange-300" : "text-slate-500 dark:text-slate-400"} />
                                    </div>
                                    <span className="truncate max-w-[120px]">{template ? template.name : t.actions.noList}</span>
                                </div>
                            </div>
                        )}
                   </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Fuel size={16} className="text-smart-yellow" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{t.stats.engineHours}</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{machine.engineHours}{t.stats.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-smart-yellow" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{t.stats.lastMaintenance}</p>
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
                <button onClick={() => { setIsAddModalOpen(false); setShowSuggestions(false); setSmartFillSuggestions([]); }} className="text-gray-400 hover:text-red-600 transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleAddToCart} className="p-8 space-y-8">
              {/* Machine Type Selector - Dropdown */}
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2 uppercase tracking-wide">{t.modal.selectType}</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Machine['type']})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none appearance-none cursor-pointer font-medium"
                  >
                    {machineTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                    <h4 className="text-sm font-bold text-smart-navy dark:text-white uppercase tracking-wide">{t.modal.technicalDetails}</h4>
                    {isAutoFilling && <span className="text-xs text-smart-yellow font-bold animate-pulse flex items-center gap-1"><Sparkles size={12}/> {t.modal.fetchingData}</span>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                    
                    <div className="col-span-2 relative">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.searchBrandModel}</label>
                         <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input
                                  required
                                  type="text"
                                  value={formData.model}
                                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                                  onFocus={() => smartFillSuggestions.length > 0 && setShowSuggestions(true)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white text-gray-900 dark:bg-slate-700 dark:text-white outline-none"
                                  placeholder={t.modal.searchPlaceholder}
                              />
                              {isLoadingSuggestions && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 size={18} className="animate-spin text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button
                                type="button"
                                onClick={handleSmartFill}
                                disabled={isAutoFilling || (!formData.model && !formData.brand)}
                                className="bg-smart-yellow text-smart-navy px-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                title="Model isminden bilgileri otomatik getir"
                            >
                                {isAutoFilling ? <Loader2 className="animate-spin" /> : <Search />}
                                <span className="hidden sm:inline">{t.modal.search}</span>
                            </button>
                         </div>
                         <p className="text-xs text-gray-400 mt-1">{t.modal.searchHint}</p>

                         {/* Suggestions Dropdown */}
                         {showSuggestions && smartFillSuggestions.length > 0 && (
                           <div ref={suggestionsRef} className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                             <div className="sticky top-0 bg-gray-50 dark:bg-slate-900 px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                               <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                 {smartFillSuggestions.length} {t.modal.resultsFound}
                               </span>
                               <button
                                 type="button"
                                 onClick={() => setShowSuggestions(false)}
                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                               >
                                 <X size={16} />
                               </button>
                             </div>
                             {smartFillSuggestions.map((suggestion, index) => (
                               <button
                                 key={`${suggestion.brandId}-${suggestion.modelId || index}`}
                                 type="button"
                                 onClick={() => handleSelectSuggestion(suggestion)}
                                 className="w-full px-4 py-3 text-left hover:bg-smart-yellow/10 dark:hover:bg-slate-700 border-b border-gray-50 dark:border-slate-700 last:border-0 transition-colors group"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1">
                                     <p className="font-bold text-smart-navy dark:text-white group-hover:text-smart-navy">
                                       {suggestion.fullName}
                                     </p>
                                     <div className="flex items-center gap-2 mt-1">
                                       {suggestion.category && (
                                         <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                                           {suggestion.category}
                                         </span>
                                       )}
                                       <span className="text-xs text-gray-400">
                                         {suggestion.type === 'model' ? 'Model' : t.modal.modelBrandCategory}
                                       </span>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <span className={`text-xs font-bold px-2 py-1 rounded ${
                                       suggestion.confidence >= 0.9
                                         ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                         : suggestion.confidence >= 0.7
                                           ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                           : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                     }`}>
                                       %{Math.round(suggestion.confidence * 100)}
                                     </span>
                                     <Check size={16} className="text-gray-300 group-hover:text-smart-success" />
                                   </div>
                                 </div>
                               </button>
                             ))}
                           </div>
                         )}
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
                                title={t.modal.generateRandom}
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.year}</label>
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
                            <span>{t.modal.imageUrl}</span>
                            {formData.imageUrl && (
                                <button type="button" onClick={handleRefreshImage} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                    <RefreshCw size={12}/> {t.modal.changeImage}
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
                                        <RefreshCw size={16} /> {t.modal.findDifferentImage}
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
                    <h4 className="text-sm font-bold text-smart-navy dark:text-white uppercase tracking-wider">{t.modal.operationalAssignments}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
                            <User size={14}/> {t.modal.operatorSelection}
                        </label>
                        <div className="relative">
                            <select 
                                value={formData.assignedOperatorId}
                                onChange={(e) => setFormData({...formData, assignedOperatorId: e.target.value})}
                                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-smart-navy/20 outline-none appearance-none cursor-pointer hover:border-smart-navy transition-colors"
                            >
                                <option value="">{t.modal.notAssigned}</option>
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
                            <FileCheck size={14}/> {t.modal.checklistSelection}
                        </label>
                        <div className="relative">
                            <select 
                                value={formData.assignedChecklistId}
                                onChange={(e) => setFormData({...formData, assignedChecklistId: e.target.value})}
                                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-smart-navy/20 outline-none appearance-none cursor-pointer hover:border-smart-navy transition-colors"
                            >
                                <option value="">{t.modal.notAssigned}</option>
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

      {/* Full Edit Modal */}
      {editingMachine && (
        <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-50 dark:bg-slate-900 px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-smart-navy dark:text-white flex items-center gap-2">
                  <Pencil className="text-amber-500" />
                  Makine Düzenle
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{editingMachine.brand} {editingMachine.model}</p>
              </div>
              <button onClick={() => setEditingMachine(null)} className="text-gray-400 hover:text-red-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-8 space-y-6">
              {/* Machine Image Preview */}
              {editingMachine.imageUrl && (
                <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                  <img src={editingMachine.imageUrl} alt={editingMachine.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.machineName}</label>
                  <input
                    type="text"
                    required
                    value={editingMachine.name}
                    onChange={(e) => setEditingMachine({...editingMachine, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.brand}</label>
                  <input
                    type="text"
                    required
                    value={editingMachine.brand}
                    onChange={(e) => setEditingMachine({...editingMachine, brand: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.model}</label>
                  <input
                    type="text"
                    required
                    value={editingMachine.model}
                    onChange={(e) => setEditingMachine({...editingMachine, model: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.serialNumber}</label>
                  <input
                    type="text"
                    required
                    value={editingMachine.serialNumber}
                    onChange={(e) => setEditingMachine({...editingMachine, serialNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.year}</label>
                  <input
                    type="number"
                    required
                    value={editingMachine.year}
                    onChange={(e) => setEditingMachine({...editingMachine, year: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.engineHours}</label>
                  <input
                    type="number"
                    required
                    value={editingMachine.engineHours}
                    onChange={(e) => setEditingMachine({...editingMachine, engineHours: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.modal.status}</label>
                <select
                  value={editingMachine.status}
                  onChange={(e) => setEditingMachine({...editingMachine, status: e.target.value as MachineStatus})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value={MachineStatus.Active}>{MachineStatusLabels[MachineStatus.Active]}</option>
                  <option value={MachineStatus.Idle}>{MachineStatusLabels[MachineStatus.Idle]}</option>
                  <option value={MachineStatus.Maintenance}>{MachineStatusLabels[MachineStatus.Maintenance]}</option>
                  <option value={MachineStatus.OutOfService}>{MachineStatusLabels[MachineStatus.OutOfService]}</option>
                </select>
              </div>

              {/* Location (if exists) */}
              {editingMachine.location && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <MapPin size={14} /> Konum Bilgisi
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{editingMachine.location.address}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Koordinatlar: {editingMachine.location.lat.toFixed(4)}, {editingMachine.location.lng.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Assignments */}
              <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl border border-gray-200 dark:border-slate-600 space-y-4">
                <h4 className="text-sm font-bold text-smart-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={16} />
                  {t.modal.operationalAssignments}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
                      <User size={14} /> Operatör
                    </label>
                    <select
                      value={editingMachine.assignedOperatorId || ''}
                      onChange={(e) => setEditingMachine({...editingMachine, assignedOperatorId: e.target.value || undefined})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                    >
                      <option value="">{t.modal.notAssigned}</option>
                      {operators.map(op => (
                        <option key={op.id} value={op.id}>{op.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
                      <FileCheck size={14} /> Kontrol Listesi
                    </label>
                    <select
                      value={editingMachine.assignedChecklistId || ''}
                      onChange={(e) => setEditingMachine({...editingMachine, assignedChecklistId: e.target.value || undefined})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none"
                    >
                      <option value="">{t.modal.notAssigned}</option>
                      {checklistTemplates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                {deleteMachine && (
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(editingMachine)}
                    className="px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-bold transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Makineyi Sil
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingMachine(null)}
                    className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && machineToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-center text-smart-navy dark:text-white mb-2">
                Makineyi Silmek İstediğinize Emin Misiniz?
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-bold text-smart-navy dark:text-white">{machineToDelete.brand} {machineToDelete.model}</span>
              </p>
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-1">
                Seri No: {machineToDelete.serialNumber}
              </p>
              <p className="text-center text-sm text-red-500 dark:text-red-400 mt-4">
                Bu işlem geri alınamaz. Makine ve tüm ilişkili veriler kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setMachineToDelete(null); }}
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
