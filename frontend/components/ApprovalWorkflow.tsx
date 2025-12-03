
import React, { useState } from 'react';
import { Check, X, AlertOctagon, User, Clock, FileText, Eye, Camera, CheckCircle } from 'lucide-react';
import { ChecklistItem, ChecklistStatus, TranslationDictionary, Machine } from '../types';

// Default translations for when t prop is not provided
const DEFAULT_TRANSLATIONS = {
  title: 'Onay Kuyruğu',
  subtitle: 'Operatörlerden gelen günlük kontrol formlarını inceleyin.',
  empty: 'Her Şey Güncel!',
  approve: 'Onayla',
  reject: 'Reddet',
  review: 'İncele',
  queue: 'Ön Kontrol'
};

interface ApprovalWorkflowProps {
  checklists: ChecklistItem[];
  machines?: Machine[];
  handleApproval: (id: string, approved: boolean) => void;
  t?: TranslationDictionary['approvals'];
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ checklists, machines = [], handleApproval, t = DEFAULT_TRANSLATIONS }) => {
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistItem | null>(null);
  const pendingItems = checklists.filter(c => c.status === ChecklistStatus.Pending);

  // Helper function to get machine name from ID
  const getMachineName = (machineId: string): string => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : machineId;
  };

  const openDetails = (item: ChecklistItem) => {
      setSelectedChecklist(item);
  };

  const closeDetails = () => {
      setSelectedChecklist(null);
  };

  const handleModalAction = (approved: boolean) => {
      if (selectedChecklist) {
          handleApproval(selectedChecklist.id, approved);
          closeDetails();
      }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-2">
            <FileText className="text-smart-yellow" />
            {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {pendingItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-smart-success dark:text-green-400 w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t.empty}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-l-4 border-l-smart-yellow overflow-hidden flex flex-col lg:flex-row transition-transform hover:translate-x-1">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-smart-yellow text-smart-navy text-xs font-bold px-3 py-1 rounded shadow-sm uppercase">{t.queue}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm flex items-center gap-1 font-medium">
                    <Clock size={14} /> {item.date}
                  </span>
                </div>
                
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-lg font-bold text-smart-navy dark:text-white mb-1">{getMachineName(item.machineId)}</h3>
                     <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
                       <User size={14} />
                       {item.operatorName}
                     </div>
                   </div>
                </div>

                {/* Issues Summary */}
                {item.issues.length > 0 ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 mb-4">
                    <h4 className="text-red-800 dark:text-red-300 font-bold text-sm mb-2 flex items-center gap-2">
                      <AlertOctagon size={16} />
                      Raporlanan Sorunlar ({item.issues.length}):
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-200 font-medium">
                      {item.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-3 mb-4 text-green-800 dark:text-green-300 text-sm flex items-center gap-2 font-medium">
                    <CheckCircle size={16} />
                    Tüm sistemler normal raporlandı.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 dark:bg-slate-700 p-6 lg:w-48 flex flex-col items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-600">
                 <button 
                    onClick={() => openDetails(item)}
                    className="w-full bg-smart-navy dark:bg-black text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                 >
                     <Eye size={18} /> {t.review}
                 </button>
                 <div className="flex w-full gap-2">
                    <button 
                        onClick={() => handleApproval(item.id, true)}
                        className="flex-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 px-3 py-2 rounded-lg font-bold hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                    >
                        {t.approve}
                    </button>
                    <button 
                        onClick={() => handleApproval(item.id, false)}
                        className="flex-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 px-3 py-2 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                    >
                        {t.reject}
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal (Existing Logic) */}
      {selectedChecklist && (
          <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-smart-navy dark:bg-black p-6 flex justify-between items-start rounded-t-2xl">
                      <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <FileText />
                              Kontrol Listesi Detayı
                          </h3>
                          <p className="text-blue-200 text-sm mt-1">{selectedChecklist.date} • {selectedChecklist.operatorName}</p>
                      </div>
                      <button onClick={closeDetails} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-slate-900">
                      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Makine</p>
                          <p className="text-lg font-bold text-smart-navy dark:text-white">{getMachineName(selectedChecklist.machineId)}</p>
                      </div>

                      <h4 className="font-bold text-smart-navy dark:text-white mb-4 flex items-center gap-2">
                          <CheckCircle size={18} />
                          Kontrol Maddeleri
                      </h4>

                      <div className="space-y-3">
                          {selectedChecklist.entries && selectedChecklist.entries.length > 0 ? (
                              selectedChecklist.entries.map((entry, idx) => (
                                  <div key={idx} className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${entry.isOk ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${entry.isOk ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300' : 'border-red-500 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}>
                                          {entry.isOk ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                                      </div>
                                      
                                      <div className="flex-1">
                                          <div className="flex justify-between">
                                              <p className={`font-bold ${entry.isOk ? 'text-gray-700 dark:text-gray-200' : 'text-red-800 dark:text-red-200'}`}>{entry.label}</p>
                                              {entry.value && (
                                                  <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{entry.value}</span>
                                              )}
                                          </div>
                                          {!entry.isOk && (
                                              <div className="mt-2 text-sm text-red-600 dark:text-red-300 font-medium">
                                                  Sorun Bildirildi.
                                              </div>
                                          )}
                                          {entry.photoUrl && (
                                              <div className="mt-3">
                                                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Camera size={12}/> Operatör Fotoğrafı:</p>
                                                  <img src={entry.photoUrl} alt="Issue" className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <p className="text-gray-400 italic text-center py-4">Detaylı liste verisi bulunamadı.</p>
                          )}
                      </div>

                      {selectedChecklist.notes && (
                          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                              <p className="text-xs text-yellow-800 dark:text-yellow-400 uppercase font-bold mb-1">Operatör Notu</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedChecklist.notes}"</p>
                          </div>
                      )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-4 rounded-b-2xl">
                      <button 
                          onClick={() => handleModalAction(false)}
                          className="flex-1 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                      >
                          <X size={20} /> {t.reject}
                      </button>
                      <button 
                          onClick={() => handleModalAction(true)}
                          className="flex-[2] bg-smart-success text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-colors flex items-center justify-center gap-2"
                      >
                          <Check size={20} /> {t.approve}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
