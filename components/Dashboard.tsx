
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, MapPin, Wrench, Calendar, ChevronRight, ArrowLeft, Building2, User, Filter } from 'lucide-react';
import { Machine, ChecklistItem, ChecklistStatus, MachineStatus, Job, TranslationDictionary } from '../types';
import { ApprovalWorkflow } from './ApprovalWorkflow';

interface DashboardProps {
  machines: Machine[];
  checklists: ChecklistItem[];
  jobs: Job[];
  handleApproval: (id: string, approved: boolean) => void;
  t: TranslationDictionary['dashboard'];
}

type ViewState = 'overview' | 'machineList' | 'machineDetail' | 'approvals';

export const Dashboard: React.FC<DashboardProps> = ({ machines, checklists, jobs, handleApproval, t }) => {
  const [viewState, setViewState] = useState<ViewState>('overview');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [chartFilterId, setChartFilterId] = useState<string>('all');

  // Stats
  const pendingApprovals = checklists.filter(c => c.status === ChecklistStatus.Pending).length;
  const activeMachines = machines.filter(m => m.status === MachineStatus.Active).length;
  const totalEngineHours = machines.reduce((acc, m) => acc + m.engineHours, 0);

  // Chart Data Helpers
  const statusData = [
    { name: 'Aktif', value: activeMachines },
    { name: 'Bakımda', value: machines.filter(m => m.status === MachineStatus.Maintenance).length },
    { name: 'Boşta', value: machines.filter(m => m.status === MachineStatus.Idle).length },
  ];
  const COLORS = ['#15803d', '#b91c1c', '#F59E0B'];

  // Mock Data Generator based on Machine Selection
  const weeklyHoursData = useMemo(() => {
    if (chartFilterId === 'all') {
        return [
            { name: 'Pzt', hours: 45 }, { name: 'Sal', hours: 52 }, { name: 'Çar', hours: 48 },
            { name: 'Per', hours: 61 }, { name: 'Cum', hours: 55 }, { name: 'Cmt', hours: 32 }, { name: 'Paz', hours: 10 },
        ];
    } else {
        // Randomize mock data based on machine id to simulate difference
        const seed = chartFilterId.charCodeAt(0); 
        return [
            { name: 'Pzt', hours: (seed % 10) + 2 }, 
            { name: 'Sal', hours: (seed % 12) + 3 }, 
            { name: 'Çar', hours: (seed % 11) + 1 },
            { name: 'Per', hours: (seed % 13) + 4 }, 
            { name: 'Cum', hours: (seed % 10) + 5 }, 
            { name: 'Cmt', hours: (seed % 8) }, 
            { name: 'Paz', hours: 0 },
        ];
    }
  }, [chartFilterId]);

  // Navigation Handlers
  const openMachineList = () => setViewState('machineList');
  const openApprovals = () => setViewState('approvals');
  const openMachineDetail = (machine: Machine) => {
      setSelectedMachine(machine);
      setViewState('machineDetail');
  };
  const goBack = () => {
      setViewState('overview');
      setSelectedMachine(null);
  };

  // --- SUB-VIEWS ---

  const renderMachineList = () => (
    <div className="space-y-6">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-smart-navy dark:text-gray-400 dark:hover:text-white mb-4">
            <ArrowLeft size={20} /> {t.viewAll}
        </button>
        <h3 className="text-2xl font-bold text-smart-navy dark:text-white">{t.activeMachines}</h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-medium text-sm">
                    <tr>
                        <th className="p-4">{t.table.machine}</th>
                        <th className="p-4">{t.table.serial}</th>
                        <th className="p-4">{t.table.status}</th>
                        <th className="p-4">{t.table.hours}</th>
                        <th className="p-4">{t.table.location}</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {machines.map(m => (
                        <tr key={m.id} onClick={() => openMachineDetail(m)} className="hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                            <td className="p-4 font-bold text-smart-navy dark:text-white">{m.brand} {m.model}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{m.serialNumber}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${m.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                                      m.status === 'Bakımda' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                    {m.status}
                                </span>
                            </td>
                            <td className="p-4 font-mono dark:text-gray-300">{m.engineHours}s</td>
                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin size={14}/> {m.location?.address || 'Bilinmiyor'}
                            </td>
                            <td className="p-4 text-right">
                                <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-smart-navy dark:group-hover:text-white" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderMachineDetail = () => {
      if (!selectedMachine) return null;
      return (
        <div className="space-y-6 animate-fadeIn">
             <button onClick={() => setViewState('machineList')} className="flex items-center gap-2 text-gray-500 hover:text-smart-navy dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft size={20} /> Listeye Dön
            </button>
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                    <img src={selectedMachine.imageUrl} className="w-full h-64 object-cover rounded-lg shadow-md" alt={selectedMachine.name} />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-smart-navy dark:text-white">{selectedMachine.brand} {selectedMachine.model}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{selectedMachine.name} | {selectedMachine.year}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm
                            ${selectedMachine.status === 'Aktif' ? 'bg-green-600' : 
                              selectedMachine.status === 'Bakımda' ? 'bg-red-600' : 'bg-gray-500'}`}>
                            {selectedMachine.status}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{t.table.serial}</p>
                            <p className="font-mono font-bold text-smart-navy dark:text-white">{selectedMachine.serialNumber}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{t.table.hours}</p>
                            <p className="font-mono font-bold text-smart-navy dark:text-white">{selectedMachine.engineHours}s</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Son Bakım</p>
                            <p className="font-mono font-bold text-smart-navy dark:text-white">{selectedMachine.lastService}</p>
                        </div>
                         <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Operatör</p>
                            <p className="font-bold text-smart-navy dark:text-white flex items-center gap-1"><User size={14}/> {selectedMachine.assignedOperatorId ? 'Atandı' : '-'}</p>
                        </div>
                    </div>

                    {/* Tabs / Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Fault Chart */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-smart-navy dark:text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="text-smart-yellow" size={18} />
                                Sık Görülen Arızalar / Parça Değişimi
                            </h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={selectedMachine.commonFaults || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#475569" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="partName" type="category" width={100} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#f8fafc'}} itemStyle={{color: '#f8fafc'}}/>
                                        <Bar dataKey="frequency" fill="#b91c1c" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                                {(selectedMachine.commonFaults?.length || 0) === 0 && <p className="text-xs text-center text-gray-400 mt-10">Veri yok</p>}
                            </div>
                        </div>

                        {/* Location Map Placeholder */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col">
                            <h4 className="font-bold text-smart-navy dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="text-blue-500" size={18} />
                                {t.table.location}
                            </h4>
                            <div className="flex-1 bg-blue-50 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-blue-100 dark:border-slate-700 flex items-center justify-center group cursor-crosshair">
                                {/* Simulated Map Grid */}
                                <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                                <div className="absolute top-0 right-0 p-2 bg-white/80 dark:bg-black/80 text-[10px] font-mono dark:text-gray-300">
                                    LAT: {selectedMachine.location?.lat}<br/>LNG: {selectedMachine.location?.lng}
                                </div>
                                {/* Pin */}
                                <div className="relative z-10 flex flex-col items-center animate-bounce">
                                    <MapPin size={32} className="text-red-600 drop-shadow-lg" fill="currentColor" />
                                    <div className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow text-xs font-bold mt-1 whitespace-nowrap dark:text-white">
                                        {selectedMachine.name}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                <Building2 size={12}/> {selectedMachine.location?.address}
                            </p>
                        </div>
                    </div>

                    {/* Service Log */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                         <h4 className="font-bold text-smart-navy dark:text-white mb-4 flex items-center gap-2">
                                <Wrench className="text-gray-500 dark:text-gray-400" size={18} />
                                Servis ve Bakım Kayıtları
                         </h4>
                         <div className="space-y-4">
                            {(selectedMachine.serviceHistory || []).length > 0 ? (
                                selectedMachine.serviceHistory!.map(service => (
                                    <div key={service.id} className="flex gap-4 items-start border-l-2 border-gray-200 dark:border-gray-600 pl-4 relative">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-slate-800"></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{service.type}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{service.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><User size={10}/> {service.technician}</span>
                                                <span className="text-xs font-bold text-smart-navy dark:text-smart-yellow">₺{service.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Kayıtlı servis geçmişi bulunamadı.</p>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  // --- MAIN RENDER LOGIC ---

  if (viewState === 'approvals') {
      return (
          <div className="space-y-4">
               <button onClick={goBack} className="m-8 mb-0 flex items-center gap-2 text-gray-500 hover:text-smart-navy dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft size={20} /> {t.viewAll}
               </button>
               <ApprovalWorkflow checklists={checklists} handleApproval={handleApproval} />
          </div>
      );
  }

  if (viewState === 'machineList') return <div className="p-8">{renderMachineList()}</div>;
  if (viewState === 'machineDetail') return <div className="p-8">{renderMachineDetail()}</div>;

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
          <Activity className="text-smart-yellow" />
          {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </header>

      {/* Stats Cards (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={openMachineList} className="cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-l-smart-navy dark:border-l-gray-400 border-y border-r border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="p-3 rounded-full bg-blue-50 dark:bg-slate-700 text-smart-navy dark:text-white group-hover:bg-smart-navy group-hover:text-white transition-colors">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalEngineHours}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEngineHours}s</p>
          </div>
          <ChevronRight className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-smart-navy dark:group-hover:text-white" />
        </div>

        <div onClick={openApprovals} className="cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-l-smart-yellow border-y border-r border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 group-hover:bg-smart-yellow group-hover:text-smart-navy transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.pendingApprovals}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingApprovals}</p>
          </div>
          <ChevronRight className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-smart-navy dark:group-hover:text-white" />
        </div>

        <div onClick={openMachineList} className="cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-l-smart-success border-y border-r border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-smart-success dark:text-green-400 group-hover:bg-smart-success group-hover:text-white transition-colors">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.activeMachines}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeMachines}</p>
          </div>
           <ChevronRight className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-smart-navy dark:group-hover:text-white" />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-l-gray-400 border-y border-r border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.avgUsage}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">%85</p>
          </div>
        </div>
      </div>

      {/* Jobs / Sites List Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-smart-navy dark:text-white flex items-center gap-2">
                  <Building2 size={20} className="text-smart-navy dark:text-smart-yellow" />
                  {t.activeJobs}
              </h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{t.viewAll}</button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="text-left text-xs font-bold text-gray-400 uppercase bg-gray-50 dark:bg-slate-700">
                      <tr>
                          <th className="px-4 py-2 rounded-l-lg">Proje Adı</th>
                          <th className="px-4 py-2">{t.table.location}</th>
                          <th className="px-4 py-2">İlerleme</th>
                          <th className="px-4 py-2">{t.table.status}</th>
                          <th className="px-4 py-2 rounded-r-lg">Atanan Makine</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                      {jobs.map(job => (
                          <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                              <td className="px-4 py-3 font-bold text-smart-navy dark:text-white">{job.title}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin size={12}/> {job.location}</td>
                              <td className="px-4 py-3 w-1/4">
                                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5">
                                      <div className={`h-2.5 rounded-full ${job.status === 'Delayed' ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${job.progress}%`}}></div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{job.progress}% Tamamlandı</span>
                              </td>
                              <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : job.status === 'Delayed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                      {job.status === 'In Progress' ? 'Devam Ediyor' : job.status === 'Delayed' ? 'Gecikmede' : 'Tamamlandı'}
                                  </span>
                              </td>
                              <td className="px-4 py-3">
                                  <div className="flex -space-x-2">
                                      {job.assignedMachineIds.map((mid, idx) => (
                                          <div key={idx} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300" title={`Makine ID: ${mid}`}>
                                              M{mid}
                                          </div>
                                      ))}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-smart-navy dark:text-white">{t.weeklyHours}</h3>
              <div className="relative">
                  <Filter size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={chartFilterId}
                    onChange={(e) => setChartFilterId(e.target.value)}
                    className="pl-8 pr-4 py-1.5 text-xs font-medium border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-smart-navy cursor-pointer"
                  >
                      <option value="all">Tüm Filo Ortalaması</option>
                      {machines.map(m => (
                          <option key={m.id} value={m.id}>{m.brand} {m.model}</option>
                      ))}
                  </select>
              </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.2}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                />
                <Bar dataKey="hours" fill="#111827" className="dark:fill-smart-yellow" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-smart-navy dark:text-white mb-6">{t.fleetStatus}</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff'}} itemStyle={{color: '#fff'}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4">
               {statusData.map((entry, index) => (
                 <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name} ({entry.value})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
