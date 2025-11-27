
import React, { useState, useMemo } from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Camera, Check, X, LogOut, ChevronRight, Hammer, Truck, Tractor, Briefcase, Home, User, MapPin, Play, Square, Navigation, Clock, CheckSquare, AlertTriangle, ShieldCheck, List, FileText, CheckCircle, Plus, Sparkles, CreditCard, ShoppingCart, Trash2, Smartphone, Anchor, HardHat, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { Machine, ChecklistTemplate, Job, ChecklistItem, ChecklistStatus, MachineStatus } from '../types';

interface MobileAppSimulatorProps {
  onClose: () => void;
  machines: Machine[];
  templates: ChecklistTemplate[];
  jobs?: Job[];
  checklists?: ChecklistItem[]; // Passed for manager approval
  addMachine?: (m: Machine) => void;
  updateMachine: (m: Machine) => void;
  updateJob: (j: Job) => void;
  handleApproval?: (id: string, approved: boolean) => void;
}

// Simulating logged in user as 'op1' (Ahmet Yılmaz)
const CURRENT_OPERATOR_ID = 'op1'; 

// Constants copied from MachineManagement for simulation consistency
const MACHINE_TYPE_IMAGES: Record<string, string[]> = {
    Excavator: ['https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800'],
    Dozer: ['https://images.unsplash.com/photo-1547625832-6a84d46f90d4?q=80&w=800'],
    Crane: ['https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800'],
    Truck: ['https://images.unsplash.com/photo-1605218427368-ade792b0c487?q=80&w=800'],
    Loader: ['https://images.unsplash.com/photo-1517429532728-66258455e27a?q=80&w=800'],
};
const MACHINE_KNOWLEDGE_BASE = [
  { keywords: ['320', '323', '330', '336', 'cat'], brand: 'Caterpillar', type: 'Excavator' },
  { keywords: ['d8', 'd6', 'd155', 'dozer', 'komatsu'], brand: 'Komatsu', type: 'Dozer' },
  { keywords: ['ltm', 'crane', 'liebherr'], brand: 'Liebherr', type: 'Crane' },
  { keywords: ['actros', 'axor', 'arocs'], brand: 'Mercedes-Benz', type: 'Truck' },
];

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({ onClose, machines, templates, jobs = [], checklists = [], addMachine, updateMachine, updateJob, handleApproval }) => {
  // Navigation State
  const [screen, setScreen] = useState<'login' | 'app'>('login');
  const [userRole, setUserRole] = useState<'operator' | 'manager'>('operator');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'profile' | 'fleet' | 'approvals'>('home');
  const [subScreen, setSubScreen] = useState<'none' | 'checklist' | 'meter_start' | 'meter_end' | 'success' | 'approval_detail' | 'add_machine' | 'cart' | 'payment'>('none');

  // Data State
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistItem | null>(null);
  const [expandedEntryIdx, setExpandedEntryIdx] = useState<number | null>(null);
  
  // Manager Add Machine State
  const [newMachineData, setNewMachineData] = useState<Partial<Machine>>({
      type: 'Excavator',
      brand: '',
      model: '',
      year: '',
      serialNumber: ''
  });
  const [cart, setCart] = useState<Partial<Machine>[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple'>('card');
  
  // Local active Job ID (In a real app, this comes from backend user status)
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  // Meter Input State
  const [meterValue, setMeterValue] = useState('');
  
  // Checklist State
  const [currentStep, setCurrentStep] = useState(0);
  const activeTemplate = templates[0]; 

  // --- Filter Data for Current Operator ---
  const myMachines = useMemo(() => {
      return machines.filter(m => m.assignedOperatorId === CURRENT_OPERATOR_ID);
  }, [machines]);

  const myJobs = useMemo(() => {
      return jobs.filter(job => 
          job.assignedMachineIds.some(jobMachineId => 
              myMachines.some(myMachine => myMachine.id === jobMachineId)
          )
      );
  }, [jobs, myMachines]);

  // Sync active job ID with props on load
  useMemo(() => {
      const ongoingJob = myJobs.find(j => j.status === 'In Progress');
      if (ongoingJob) setActiveJobId(ongoingJob.id);
  }, [myJobs]);


  const handleLogin = (role: 'operator' | 'manager') => {
      setUserRole(role);
      setScreen('app');
      setActiveTab('home'); // Reset tab on login
  };

  // --- Actions ---

  const startChecklist = (machine: Machine) => {
    setSelectedMachine(machine);
    setSubScreen('checklist');
    setCurrentStep(0);
  };

  const openMeterModal = (job: Job, type: 'start' | 'end') => {
      setSelectedJob(job);
      const machineId = job.assignedMachineIds.find(id => myMachines.some(m => m.id === id));
      const machine = myMachines.find(m => m.id === machineId) || myMachines[0];
      
      setSelectedMachine(machine);
      setSubScreen(type === 'start' ? 'meter_start' : 'meter_end');
      setMeterValue('');
  };

  const handleMeterSubmit = () => {
    if (!selectedMachine || !selectedJob) return;

    if (meterValue) {
        const newHours = parseFloat(meterValue);
        if (newHours > selectedMachine.engineHours) {
            updateMachine({
                ...selectedMachine,
                engineHours: newHours
            });
        }
    }

    if (subScreen === 'meter_start') {
        setActiveJobId(selectedJob.id);
        updateJob({
            ...selectedJob,
            status: 'In Progress',
            startDate: new Date().toISOString().split('T')[0]
        });
        setSubScreen('none');
    } else {
        setActiveJobId(null);
        updateJob({
            ...selectedJob,
            status: 'Completed',
            progress: 100
        });
        setSubScreen('success');
    }
  };

  const handleChecklistAnswer = (isOk: boolean) => {
    if (activeTemplate && currentStep < activeTemplate.items.length) {
      if (currentStep < activeTemplate.items.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setSubScreen('success');
      }
    }
  };

  const openApprovalDetail = (item: ChecklistItem) => {
      setSelectedChecklist(item);
      setExpandedEntryIdx(null);
      setSubScreen('approval_detail');
  };

  const handleMobileApproval = (approved: boolean) => {
      if (selectedChecklist && handleApproval) {
          handleApproval(selectedChecklist.id, approved);
          setSubScreen('success');
      }
  };

  const toggleEntry = (idx: number) => {
      if (expandedEntryIdx === idx) {
          setExpandedEntryIdx(null);
      } else {
          setExpandedEntryIdx(idx);
      }
  };

  // --- Manager: Machine Adding Logic ---
  
  const handleSmartFill = () => {
      const query = (newMachineData.model + ' ' + newMachineData.brand).toLowerCase();
      const match = MACHINE_KNOWLEDGE_BASE.find(item => 
          item.keywords.some(keyword => query.includes(keyword))
      );
      if (match) {
          setNewMachineData(prev => ({
              ...prev,
              brand: match.brand,
              type: match.type as any,
              year: '2023',
              serialNumber: `GEN-${Math.floor(Math.random()*9000)+1000}`
          }));
      }
  };

  const addToCart = () => {
      if (!newMachineData.model) return;
      const type = newMachineData.type || 'Excavator';
      const images = MACHINE_TYPE_IMAGES[type] || MACHINE_TYPE_IMAGES['Excavator'];
      
      const item: Partial<Machine> = {
          ...newMachineData,
          name: newMachineData.brand + ' ' + newMachineData.model,
          imageUrl: images[0],
          status: MachineStatus.Idle
      };
      setCart([...cart, item]);
      setNewMachineData({ type: 'Excavator', brand: '', model: '', year: '', serialNumber: '' }); // Reset
      setSubScreen('none'); // Go back to fleet
  };

  const handlePayment = () => {
      if (!addMachine) return;
      
      cart.forEach(draft => {
          const newMachine: Machine = {
              id: Math.random().toString(36).substr(2, 9),
              name: draft.name || 'Yeni Makine',
              brand: draft.brand || '',
              model: draft.model || '',
              year: draft.year || '2024',
              type: draft.type as any,
              serialNumber: draft.serialNumber || 'UNKNOWN',
              status: MachineStatus.Idle,
              engineHours: 0,
              lastService: new Date().toISOString().split('T')[0],
              imageUrl: draft.imageUrl || ''
          };
          addMachine(newMachine);
      });
      setCart([]);
      setSubScreen('success');
  };

  const getMachineIcon = (type: string) => {
    switch(type) {
      case 'Excavator': return <Hammer size={24} />;
      case 'Dozer': return <Tractor size={24} />;
      case 'Crane': return <Anchor size={24} />;
      case 'Loader': return <HardHat size={24} />;
      default: return <Truck size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="relative w-[375px] h-[812px] bg-slate-900 rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden flex flex-col font-sans">
        {/* Notch & Status Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-20"></div>
        <div className="h-12 px-6 flex justify-between items-center text-white text-xs font-bold bg-slate-900 z-10 pt-2 shrink-0">
            <span>09:41</span>
            <div className="flex gap-2">
                <Signal size={14} />
                <Wifi size={14} />
                <Battery size={14} />
            </div>
        </div>

        {/* Close Simulator Button (External) */}
        <button 
            onClick={onClose}
            className="absolute -right-16 top-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
            title="Simülasyonu Kapat"
        >
            <X />
        </button>

        {/* --- SCREENS --- */}

        {screen === 'login' ? (
            <div className="flex-1 flex flex-col p-8 bg-slate-900 text-white">
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-24 h-24 bg-smart-yellow rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-yellow-500/20">
                        <Hammer className="text-slate-900 w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Smartop</h1>
                    <p className="text-gray-400 text-center mb-12">Mobil Saha Platformu</p>

                    <div className="w-full space-y-4">
                        <button 
                            onClick={() => handleLogin('operator')}
                            className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                        >
                            <User size={20} />
                            Giriş: Operatör
                        </button>
                        <button 
                            onClick={() => handleLogin('manager')}
                            className="w-full bg-smart-yellow text-slate-900 font-bold text-lg py-4 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-3"
                        >
                            <ShieldCheck size={20} />
                            Giriş: Yönetici
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">Demo ortamında şifre gerekmemektedir.</p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 relative">
                
                {/* SUB-SCREENS OVERLAY */}
                {subScreen !== 'none' && (
                    <div className="absolute inset-0 z-30 bg-slate-900 text-white flex flex-col animate-in slide-in-from-right duration-300">
                        {/* CHECKLIST FLOW (Operator) */}
                        {subScreen === 'checklist' && selectedMachine && (
                            <>
                                <div className="p-6 pt-4">
                                    <button onClick={() => setSubScreen('none')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                                        <ArrowLeft size={20} /> İptal
                                    </button>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-smart-yellow text-xs font-bold uppercase tracking-wider">Adım {currentStep + 1} / {activeTemplate?.items.length || 5}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full mb-6">
                                        <div className="bg-smart-yellow h-1 rounded-full transition-all duration-300" style={{width: `${((currentStep + 1) / (activeTemplate?.items.length || 5)) * 100}%`}}></div>
                                    </div>
                                    <h2 className="text-2xl font-bold leading-tight">
                                        {activeTemplate?.items[currentStep]}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-2">Parçayı fiziksel olarak kontrol edin.</p>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                                    <button onClick={() => handleChecklistAnswer(true)} className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-green-900/30 active:border-green-500 transition-all">
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"><Check size={32} className="text-green-500" /></div>
                                        <span className="font-bold text-lg">Sorun Yok</span>
                                    </button>
                                    <button onClick={() => handleChecklistAnswer(false)} className="h-24 bg-slate-800 border-2 border-slate-700 rounded-2xl flex items-center px-6 gap-4 active:bg-red-900/30 active:border-red-500 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center"><X size={24} className="text-red-500" /></div>
                                        <span className="font-bold text-lg flex-1 text-left">Sorun Var</span>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* METER INPUT FLOW (Operator) */}
                        {(subScreen === 'meter_start' || subScreen === 'meter_end') && selectedMachine && (
                            <div className="flex-1 flex flex-col p-6">
                                <button onClick={() => setSubScreen('none')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
                                    <ArrowLeft size={20} /> Geri
                                </button>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                                {getMachineIcon(selectedMachine.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{selectedMachine.brand} {selectedMachine.model}</h3>
                                                <p className="text-sm text-gray-400">{subScreen === 'meter_start' ? 'İşe Başlangıç' : 'İş Bitişi'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-3 flex justify-between items-center mb-6">
                                            <span className="text-xs text-gray-500 uppercase font-bold">Son Okuma</span>
                                            <span className="font-mono text-gray-300">{selectedMachine.engineHours} {selectedMachine.type === 'Truck' ? 'KM' : 'Saat'}</span>
                                        </div>
                                        <label className="block text-sm font-bold text-smart-yellow mb-2 uppercase">
                                            Yeni {getMachineIcon(selectedMachine.type) === <Truck/> ? 'Kilometre' : 'Motor Saati'} Girin
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={meterValue}
                                                onChange={(e) => setMeterValue(e.target.value)}
                                                placeholder={selectedMachine.engineHours.toString()}
                                                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-smart-yellow rounded-xl px-4 py-4 text-2xl font-mono text-white outline-none"
                                                autoFocus
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                                                {selectedMachine.type === 'Truck' ? 'KM' : 'SAAT'}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleMeterSubmit}
                                        disabled={!meterValue}
                                        className="w-full bg-smart-yellow text-slate-900 font-bold text-lg py-4 rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-lg"
                                    >
                                        {subScreen === 'meter_start' ? 'Kaydet ve Başla' : 'Kaydet ve Bitir'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MANAGER: ADD MACHINE FLOW */}
                        {subScreen === 'add_machine' && (
                            <div className="flex-1 flex flex-col p-6">
                                <button onClick={() => setSubScreen('none')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                                    <ArrowLeft size={20} /> İptal
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-white">Yeni Makine Ekle</h2>
                                
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Makine Tipi</label>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {['Excavator', 'Dozer', 'Crane', 'Truck', 'Loader'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewMachineData({...newMachineData, type: type as any})}
                                                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${newMachineData.type === type ? 'bg-smart-yellow border-smart-yellow text-slate-900' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                                >
                                                    {getMachineIcon(type)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Model</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Örn: 320 GC"
                                                value={newMachineData.model}
                                                onChange={(e) => setNewMachineData({...newMachineData, model: e.target.value})}
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-smart-yellow outline-none"
                                            />
                                            <button 
                                                onClick={handleSmartFill}
                                                className="bg-slate-700 text-smart-yellow p-3 rounded-xl"
                                                title="Otomatik Doldur"
                                            >
                                                <Sparkles size={20} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">Model adını yazıp sihirbaz butonuna dokunun.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Marka</label>
                                            <input 
                                                type="text" 
                                                placeholder="CAT"
                                                value={newMachineData.brand}
                                                onChange={(e) => setNewMachineData({...newMachineData, brand: e.target.value})}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-smart-yellow outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Yıl</label>
                                            <input 
                                                type="text" 
                                                placeholder="2023"
                                                value={newMachineData.year}
                                                onChange={(e) => setNewMachineData({...newMachineData, year: e.target.value})}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-smart-yellow outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={addToCart}
                                    disabled={!newMachineData.model}
                                    className="w-full bg-smart-yellow text-slate-900 font-bold py-4 rounded-xl mt-4 shadow-lg disabled:opacity-50"
                                >
                                    Sepete Ekle
                                </button>
                            </div>
                        )}

                        {/* MANAGER: CART & PAYMENT */}
                        {subScreen === 'cart' && (
                            <div className="flex-1 flex flex-col p-6">
                                <button onClick={() => setSubScreen('none')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                                    <ArrowLeft size={20} /> Kapat
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                    <ShoppingCart /> Sepet ({cart.length})
                                </h2>

                                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                                            <div>
                                                <p className="font-bold">{item.name}</p>
                                                <p className="text-xs text-gray-400">{item.type} • {item.year}</p>
                                            </div>
                                            <button 
                                                onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                                className="text-red-500 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {cart.length === 0 && <p className="text-gray-500 text-center mt-10">Sepetiniz boş.</p>}
                                </div>

                                {cart.length > 0 && (
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
                                        <div className="flex justify-between text-sm mb-2 text-gray-400">
                                            <span>Ara Toplam</span>
                                            <span>₺{cart.length * 500}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-700">
                                            <span>Toplam</span>
                                            <span>₺{cart.length * 500}</span>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setSubScreen('payment')}
                                    disabled={cart.length === 0}
                                    className="w-full bg-smart-yellow text-slate-900 font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
                                >
                                    Ödemeye Geç
                                </button>
                            </div>
                        )}

                        {subScreen === 'payment' && (
                             <div className="flex-1 flex flex-col p-6">
                                <button onClick={() => setSubScreen('cart')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                                    <ArrowLeft size={20} /> Geri
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-white">Ödeme Yöntemi</h2>
                                
                                <div className="space-y-4 mb-8">
                                    <button 
                                        onClick={() => setPaymentMethod('apple')}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'apple' ? 'bg-white text-black border-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                    >
                                        <Smartphone size={24} />
                                        <span className="font-bold">Apple Pay</span>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'card' ? 'bg-white text-black border-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                    >
                                        <CreditCard size={24} />
                                        <span className="font-bold">Kredi Kartı</span>
                                    </button>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4 mb-8">
                                        <input type="text" placeholder="Kart Numarası" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none"/>
                                        <div className="flex gap-4">
                                            <input type="text" placeholder="MM/YY" className="w-1/2 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none"/>
                                            <input type="text" placeholder="CVC" className="w-1/2 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none"/>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handlePayment}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg mt-auto"
                                >
                                    ₺{cart.length * 500} Öde
                                </button>
                             </div>
                        )}

                        {/* APPROVAL DETAIL (Manager) */}
                        {subScreen === 'approval_detail' && selectedChecklist && (
                             <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                                <button onClick={() => setSubScreen('none')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                                    <ArrowLeft size={20} /> Listeye Dön
                                </button>
                                <div className="bg-slate-800 p-4 rounded-xl mb-6">
                                    <h2 className="text-xl font-bold mb-1">{selectedChecklist.machineId}</h2>
                                    <p className="text-gray-400 text-sm flex items-center gap-2"><User size={14}/> {selectedChecklist.operatorName}</p>
                                    <p className="text-gray-400 text-sm flex items-center gap-2 mt-1"><Clock size={14}/> {selectedChecklist.date}</p>
                                </div>
                                
                                <h3 className="font-bold text-smart-yellow mb-4 uppercase text-sm">Kontrol Maddeleri</h3>
                                <div className="space-y-3 mb-8">
                                    {selectedChecklist.entries?.map((entry, idx) => (
                                        <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden transition-all">
                                            {/* Accordion Header */}
                                            <div 
                                                onClick={() => toggleEntry(idx)}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {entry.isOk ? <CheckCircle size={18} className="text-green-500 shrink-0" /> : <AlertTriangle size={18} className="text-red-500 shrink-0" />}
                                                    <span className={`text-sm font-medium ${!entry.isOk ? 'text-red-300' : 'text-white'}`}>{entry.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Preview Icons for hidden content */}
                                                    {expandedEntryIdx !== idx && (
                                                        <>
                                                            {entry.value && <FileText size={12} className="text-gray-500" />}
                                                            {entry.photoUrl && <Camera size={12} className="text-gray-500" />}
                                                        </>
                                                    )}
                                                    {expandedEntryIdx === idx ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                                                </div>
                                            </div>

                                            {/* Accordion Body */}
                                            {expandedEntryIdx === idx && (
                                                <div className="p-3 pt-0 bg-slate-900/30 border-t border-slate-700/50 animate-in slide-in-from-top-1 duration-200">
                                                    {entry.value && (
                                                        <div className="mb-2">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Girilen Değer</p>
                                                            <p className="text-sm font-mono text-white bg-slate-700/50 p-1.5 rounded inline-block">{entry.value}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {entry.photoUrl ? (
                                                        <div className="mt-2">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Camera size={10}/> Operatör Fotoğrafı</p>
                                                            <div className="relative group rounded-lg overflow-hidden border border-slate-600">
                                                                <img src={entry.photoUrl} alt="Fault" className="w-full h-32 object-cover" />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ImageIcon size={20} className="text-white"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        !entry.value && <p className="text-xs text-gray-500 italic">Ek not veya fotoğraf bulunmuyor.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedChecklist.entries || selectedChecklist.entries.length === 0) && <p className="text-gray-500 italic">Detay yok.</p>}
                                </div>

                                <div className="mt-auto flex gap-4 pt-4 border-t border-slate-800">
                                    <button onClick={() => handleMobileApproval(false)} className="flex-1 bg-red-900/20 text-red-500 border border-red-900 py-4 rounded-xl font-bold hover:bg-red-900/40 transition-colors">Reddet</button>
                                    <button onClick={() => handleMobileApproval(true)} className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-500 transition-colors">Onayla</button>
                                </div>
                             </div>
                        )}

                        {/* SUCCESS SCREEN */}
                        {subScreen === 'success' && (
                            <div className="flex-1 flex flex-col bg-green-600 text-white items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                                    <Check size={48} className="text-green-600 stroke-[4]" />
                                </div>
                                <h2 className="text-3xl font-black mb-2">İşlem Başarılı!</h2>
                                <p className="text-green-100 mb-10">İşleminiz sisteme kaydedildi.</p>
                                <button onClick={() => setSubScreen('none')} className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl w-full">Tamam</button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- MAIN TABS (DYNAMIC BASED ON ROLE) --- */}

                <div className="flex-1 overflow-y-auto pb-20">
                    {/* --- OPERATOR VIEW --- */}
                    {userRole === 'operator' && (
                        <>
                            {activeTab === 'home' && (
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merhaba, Ahmet</h2>
                                            <p className="text-xs text-gray-500">Operatör Paneli</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                            <User className="text-gray-600 dark:text-gray-300" size={20} />
                                        </div>
                                    </div>
                                    {/* Active Job Card */}
                                    {activeJobId ? (
                                        <div className="bg-green-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                            <div className="absolute right-0 top-0 p-4 opacity-20"><Briefcase size={64}/></div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
                                                <span className="text-xs font-bold uppercase tracking-wide">Aktif Görev</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-1 truncate">{myJobs.find(j => j.id === activeJobId)?.title}</h3>
                                            <p className="text-green-100 text-sm mb-4">{myJobs.find(j => j.id === activeJobId)?.location}</p>
                                            <button 
                                                onClick={() => openMeterModal(myJobs.find(j => j.id === activeJobId)!, 'end')}
                                                className="bg-white text-green-700 text-sm font-bold py-2 px-4 rounded-lg w-full"
                                            >
                                                Günü Bitir / Paydos
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-smart-navy text-white rounded-2xl p-5 shadow-lg">
                                            <h3 className="font-bold text-lg mb-1">Aktif Görev Yok</h3>
                                            <p className="text-blue-200 text-sm mb-3">İş listesinden yeni bir görev başlatın.</p>
                                            <button onClick={() => setActiveTab('jobs')} className="text-xs font-bold bg-white/10 py-2 px-4 rounded-lg hover:bg-white/20">İş Listesine Git</button>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Makinelerim ({myMachines.length})</h3>
                                        {myMachines.length === 0 ? <p className="text-sm text-gray-500 italic">Size atanmış makine bulunmuyor.</p> : myMachines.map((machine) => (
                                            <div key={machine.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-3" onClick={() => startChecklist(machine)}>
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                                                        {getMachineIcon(machine.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{machine.brand} {machine.model}</h4>
                                                        <p className="text-xs text-gray-500">{machine.status}</p>
                                                    </div>
                                                    <ChevronRight className="text-gray-400" size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'jobs' && (
                                <div className="p-6 space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">İş Emirleri</h2>
                                    {myJobs.length === 0 ? <p className="text-sm text-gray-500 italic">Aktif iş yok.</p> : myJobs.map(job => (
                                        <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{job.title}</h3>
                                                {activeJobId === job.id && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">AKTİF</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                <MapPin size={14} /> {job.location}
                                            </div>
                                            {activeJobId === job.id ? (
                                                <button onClick={() => openMeterModal(job, 'end')} className="w-full py-3 rounded-lg font-bold text-sm bg-red-50 text-red-600 border border-red-100 flex items-center justify-center gap-2">
                                                    <Square size={16} fill="currentColor" /> İşi Durdur
                                                </button>
                                            ) : (
                                                <button onClick={() => openMeterModal(job, 'start')} disabled={!!activeJobId} className="w-full py-3 rounded-lg font-bold text-sm bg-smart-navy text-white flex items-center justify-center gap-2 disabled:opacity-50">
                                                    <Play size={16} fill="currentColor" /> İşe Başla
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* --- MANAGER VIEW --- */}
                    {userRole === 'manager' && (
                        <>
                             {activeTab === 'home' && (
                                <div className="p-6 space-y-6">
                                     <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sn. Yönetici</h2>
                                            <p className="text-xs text-gray-500">Filo Durum Özeti</p>
                                        </div>
                                        <div className="w-10 h-10 bg-smart-navy text-white rounded-full flex items-center justify-center">
                                            <ShieldCheck size={20} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Toplam Makine</p>
                                            <p className="text-2xl font-bold text-smart-navy dark:text-white">{machines.length}</p>
                                        </div>
                                        <div onClick={() => setActiveTab('approvals')} className="bg-smart-yellow p-4 rounded-xl shadow-sm text-slate-900 cursor-pointer">
                                            <p className="text-xs uppercase font-bold opacity-70">Bekleyen Onay</p>
                                            <p className="text-2xl font-bold">{checklists.filter(c => c.status === ChecklistStatus.Pending).length}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Son Aktiviteler</h3>
                                        <div className="space-y-3">
                                            {checklists.slice(0, 3).map((cl) => (
                                                <div key={cl.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${cl.status === ChecklistStatus.Pending ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                                    <div>
                                                        <p className="text-sm font-bold dark:text-white">{cl.machineId}</p>
                                                        <p className="text-xs text-gray-500">{cl.operatorName} • {cl.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             )}

                             {activeTab === 'fleet' && (
                                 <div className="p-6 h-full flex flex-col">
                                     <div className="flex justify-between items-center mb-4">
                                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Filo ({machines.length})</h2>
                                         <button 
                                            onClick={() => setSubScreen('add_machine')}
                                            className="bg-smart-navy text-white p-2 rounded-lg"
                                         >
                                             <Plus size={20} />
                                         </button>
                                     </div>

                                     {cart.length > 0 && (
                                         <button 
                                            onClick={() => setSubScreen('cart')}
                                            className="bg-smart-yellow text-slate-900 p-3 rounded-xl mb-4 flex items-center justify-between font-bold animate-pulse"
                                         >
                                             <span className="flex items-center gap-2"><ShoppingCart size={18} /> Sepeti Tamamla</span>
                                             <span className="bg-white px-2 py-0.5 rounded text-xs">{cart.length}</span>
                                         </button>
                                     )}

                                     <div className="space-y-3 overflow-y-auto pb-20">
                                         {machines.map(m => (
                                             <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                                 <div className="flex items-center gap-3">
                                                     <div className="text-gray-400">{getMachineIcon(m.type)}</div>
                                                     <div>
                                                         <p className="font-bold text-sm text-slate-900 dark:text-white">{m.brand} {m.model}</p>
                                                         <p className="text-xs text-gray-500">{m.status}</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-xs font-mono font-bold text-smart-navy dark:text-smart-yellow">{m.engineHours}h</p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {activeTab === 'approvals' && (
                                 <div className="p-6">
                                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Onay Listesi</h2>
                                     {checklists.filter(c => c.status === ChecklistStatus.Pending).length === 0 ? (
                                         <div className="text-center py-10 text-gray-500">
                                             <CheckSquare size={48} className="mx-auto mb-2 opacity-20" />
                                             <p>Bekleyen onay yok.</p>
                                         </div>
                                     ) : (
                                         <div className="space-y-4">
                                             {checklists.filter(c => c.status === ChecklistStatus.Pending).map(cl => (
                                                 <div key={cl.id} onClick={() => openApprovalDetail(cl)} className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-l-yellow-500 shadow-sm cursor-pointer">
                                                     <div className="flex justify-between items-start mb-2">
                                                         <h3 className="font-bold text-slate-900 dark:text-white">{cl.machineId}</h3>
                                                         <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Bekliyor</span>
                                                     </div>
                                                     <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User size={12}/> {cl.operatorName}</p>
                                                     <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><Clock size={12}/> {cl.date}</p>
                                                     <div className="flex gap-2">
                                                         <button className="flex-1 bg-gray-100 dark:bg-slate-700 text-xs py-2 rounded font-bold text-gray-600 dark:text-gray-300">İncele</button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             )}
                        </>
                    )}

                    {/* SHARED PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-500"><User size={40}/></div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userRole === 'manager' ? 'Yönetici Hesabı' : 'Ahmet Yılmaz'}</h2>
                                <p className="text-sm text-gray-500">{userRole === 'manager' ? 'Süper Admin' : 'Operatör'}</p>
                            </div>
                            <button onClick={() => setScreen('login')} className="w-full mt-6 bg-red-50 text-red-600 font-bold py-3 rounded-xl">Çıkış Yap</button>
                        </div>
                    )}
                </div>

                {/* BOTTOM NAVIGATION (DYNAMIC) */}
                <div className="h-20 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-around px-2 z-20 shrink-0">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === 'home' ? 'text-smart-navy dark:text-smart-yellow' : 'text-gray-400'}`}>
                        <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Ana Sayfa</span>
                    </button>
                    
                    {userRole === 'operator' ? (
                        <button onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === 'jobs' ? 'text-smart-navy dark:text-smart-yellow' : 'text-gray-400'}`}>
                            <Briefcase size={24} strokeWidth={activeTab === 'jobs' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">İşlerim</span>
                        </button>
                    ) : (
                        <button onClick={() => setActiveTab('fleet')} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === 'fleet' ? 'text-smart-navy dark:text-smart-yellow' : 'text-gray-400'}`}>
                            <List size={24} strokeWidth={activeTab === 'fleet' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Filo</span>
                        </button>
                    )}

                    {userRole === 'manager' && (
                         <button onClick={() => setActiveTab('approvals')} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === 'approvals' ? 'text-smart-navy dark:text-smart-yellow' : 'text-gray-400'}`}>
                            <CheckSquare size={24} strokeWidth={activeTab === 'approvals' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Onaylar</span>
                        </button>
                    )}

                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${activeTab === 'profile' ? 'text-smart-navy dark:text-smart-yellow' : 'text-gray-400'}`}>
                        <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Profil</span>
                    </button>
                </div>
            </div>
        )}

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full z-30"></div>
      </div>
    </div>
  );
};
