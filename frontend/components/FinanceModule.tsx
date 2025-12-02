
import React from 'react';
import { Wallet, CreditCard, Download, TrendingUp, Calendar, AlertCircle, CheckCircle, Percent, FileText } from 'lucide-react';
import { Invoice, Machine, FirmDetails, TranslationDictionary } from '../types';

interface FinanceModuleProps {
  invoices: Invoice[];
  machines: Machine[];
  firmDetails: FirmDetails;
  t: TranslationDictionary['finance'];
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ invoices, machines, firmDetails, t }) => {
  // Financial Calculations
  const machineCount = machines.length;
  const basePrice = 500; // TL
  const discountThreshold = 50;
  const discountActive = machineCount >= discountThreshold;
  const currentRate = discountActive ? basePrice * 0.9 : basePrice; // 10% discount logic
  const monthlyTotal = machineCount * currentRate;
  
  // Next billing date (1st of next month)
  const today = new Date();
  const nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString('tr-TR');

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
          case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
          case 'Overdue': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
          default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'Paid': return 'Ödendi';
          case 'Pending': return 'Bekliyor';
          case 'Overdue': return 'Gecikmiş';
          default: return status;
      }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // ... (Invoice download logic remains same) ...
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    // ... (HTML Generation) ...
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
            <Wallet className="text-smart-yellow" />
            {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-smart-navy dark:text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download size={18} />
            {t.downloadStatement}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Spend */}
          <div className="bg-smart-navy dark:bg-black text-white rounded-xl p-6 shadow-lg relative overflow-hidden border border-transparent dark:border-gray-800">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wallet size={64} />
              </div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">{t.currentMonth}</p>
              <h3 className="text-3xl font-bold mb-4">₺{monthlyTotal.toLocaleString()}</h3>
              <div className="flex items-center gap-2 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                  <TrendingUp size={14} />
                  <span>{machineCount} Aktif Makine</span>
              </div>
          </div>

          {/* Next Invoice */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-50 dark:bg-slate-700 p-2 rounded-lg text-smart-navy dark:text-white">
                      <Calendar size={20} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{t.nextBilling}</p>
              </div>
              <h3 className="text-2xl font-bold text-smart-navy dark:text-white">{nextBillingDate}</h3>
              <p className="text-sm text-gray-400 mt-1">Otomatik çekim yapılacaktır.</p>
          </div>

           {/* Discount Status */}
           <div className={`rounded-xl p-6 shadow-sm border flex flex-col justify-center transition-colors ${discountActive ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
              <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${discountActive ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                      <Percent size={20} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{t.discountStatus}</p>
              </div>
              <h3 className={`text-2xl font-bold ${discountActive ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {discountActive ? '%10 Aktif' : '%0 Standart'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {discountActive 
                    ? 'Hacim indirimi uygulanıyor.' 
                    : `${discountThreshold - machineCount} makine daha eklerseniz %10 indirim kazanacaksınız.`}
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-1 space-y-6">
              <h3 className="text-lg font-bold text-smart-navy dark:text-white">{t.paymentMethod}</h3>
              
              {/* Card Visual */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden h-52 flex flex-col justify-between border border-gray-700">
                   <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   
                   <div className="flex justify-between items-start z-10">
                       <CreditCard className="opacity-80" />
                       <span className="font-mono text-xs opacity-50">CREDIT</span>
                   </div>

                   <div className="z-10">
                       <p className="font-mono text-xl tracking-widest mb-1">**** **** **** 4242</p>
                       <p className="text-xs opacity-50">12/26</p>
                   </div>

                   <div className="flex justify-between items-end z-10">
                       <p className="text-sm font-medium tracking-wide uppercase">{firmDetails.name.substring(0, 20)}</p>
                       <div className="w-10 h-6 bg-white/20 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                   </div>
              </div>

              <button className="w-full border border-gray-300 dark:border-slate-600 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Kartı Güncelle
              </button>
          </div>

          {/* Invoice History */}
          <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-smart-navy dark:text-white mb-6">{t.invoiceHistory}</h3>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-bold uppercase text-xs">
                          <tr>
                              <th className="p-4">{t.table.invoiceNo}</th>
                              <th className="p-4">{t.table.date}</th>
                              <th className="p-4">{t.table.desc}</th>
                              <th className="p-4">{t.table.amount}</th>
                              <th className="p-4">{t.table.status}</th>
                              <th className="p-4 text-right"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                          {invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                  <td className="p-4 font-mono text-gray-600 dark:text-gray-400">#{invoice.id}</td>
                                  <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">{invoice.date}</td>
                                  <td className="p-4 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{invoice.description}</td>
                                  <td className="p-4 font-bold text-smart-navy dark:text-white">₺{invoice.amount.toLocaleString()}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusStyle(invoice.status)}`}>
                                          {getStatusLabel(invoice.status)}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <button 
                                        onClick={() => handleDownloadInvoice(invoice)}
                                        className="text-gray-400 hover:text-smart-navy dark:hover:text-white transition-colors" 
                                        title="PDF İndir"
                                      >
                                          <Download size={18} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};
