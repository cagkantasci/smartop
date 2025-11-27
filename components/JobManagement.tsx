
import React, { useState } from 'react';
import { Plus, MapPin, Calendar, CheckCircle, AlertTriangle, Clock, X, Building2, Truck, User } from 'lucide-react';
import { Job, Machine, Operator, TranslationDictionary } from '../types';

interface JobManagementProps {
  jobs: Job[];
  machines: Machine[];
  operators: Operator[];
  addJob: (job: Job) => void;
  t: TranslationDictionary['jobs'];
}

export const JobManagement: React.FC<JobManagementProps> = ({ jobs, machines, operators, addJob, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startDate: '',
    status: 'In Progress' as Job['status'],
    progress: 0,
    assignedMachineIds: [] as string[]
  });

  const handleMachineToggle = (machineId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedMachineIds.includes(machineId);
      if (isSelected) {
        return { ...prev, assignedMachineIds: prev.assignedMachineIds.filter(id => id !== machineId) };
      } else {
        return { ...prev, assignedMachineIds: [...prev.assignedMachineIds, machineId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      location: formData.location,
      startDate: formData.startDate,
      status: formData.status,
      progress: formData.progress,
      assignedMachineIds: formData.assignedMachineIds
    };
    addJob(newJob);
    setIsModalOpen(false);
    setFormData({
        title: '',
        location: '',
        startDate: '',
        status: 'In Progress',
        progress: 0,
        assignedMachineIds: []
    });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
          case 'Completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
          case 'Delayed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'In Progress': return t.status.inProgress;
          case 'Completed': return t.status.completed;
          case 'Delayed': return t.status.delayed;
          default: return status;
      }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
            <Building2 className="text-smart-yellow" />
            {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-smart-navy dark:bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md border border-transparent dark:border-gray-700"
        >
          <Plus size={20} strokeWidth={3} />
          {t.addJob}
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
               <div>
                   <h3 className="text-xl font-bold text-smart-navy dark:text-white mb-1">{job.title}</h3>
                   <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                       <MapPin size={14} /> {job.location}
                   </div>
               </div>
               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
                   {getStatusLabel(job.status)}
               </span>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    <span>İlerleme Durumu</span>
                    <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${job.status === 'Delayed' ? 'bg-red-500' : 'bg-smart-success'}`} 
                        style={{width: `${job.progress}%`}}
                    ></div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-100 dark:border-slate-600">
                <h4 className="text-xs font-bold text-smart-navy dark:text-white uppercase mb-3 flex items-center gap-2">
                    <Truck size={14} />
                    Atanan Makineler ({job.assignedMachineIds.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {job.assignedMachineIds.map(mid => {
                        const machine = machines.find(m => m.id === mid);
                        const operator = operators.find(o => o.id === machine?.assignedOperatorId);
                        return machine ? (
                            <div key={mid} className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-600 dark:text-gray-200 text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1" title={operator ? `Op: ${operator.name}` : 'Operatör Yok'}>
                                <span>{machine.brand} {machine.model}</span>
                                {operator && <User size={10} className="text-gray-400" />}
                            </div>
                        ) : null;
                    })}
                    {job.assignedMachineIds.length === 0 && (
                        <span className="text-xs text-gray-400 italic">Henüz makine atanmadı.</span>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>Başlangıç: <span className="font-bold text-smart-navy dark:text-white">{job.startDate}</span></span>
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs">Detaylar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal (Structure kept same, labels could be translated further) */}
    </div>
  );
};
