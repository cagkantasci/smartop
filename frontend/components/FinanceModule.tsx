
import React, { useState } from 'react';
import { Wallet, CreditCard, Download, TrendingUp, Calendar, AlertCircle, CheckCircle, Percent, FileText, Store, Check, Building2 } from 'lucide-react';
import { Invoice, Machine, FirmDetails, TranslationDictionary } from '../types';

type PaymentMethodType = 'credit_card' | 'marketplace' | 'bank_transfer';

interface FinanceModuleProps {
  invoices: Invoice[];
  machines: Machine[];
  firmDetails: FirmDetails;
  t: TranslationDictionary['finance'];
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ invoices, machines, firmDetails, t }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [showCardUpdateModal, setShowCardUpdateModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

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
          case 'Paid': return t.statuses.paid;
          case 'Pending': return t.statuses.pending;
          case 'Overdue': return t.statuses.overdue;
          default: return status;
      }
  };

  const handleDownloadStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t.print.accountStatement} - ${firmDetails.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1e3a5f; margin: 0; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1e3a5f; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          .status-paid { color: #10b981; font-weight: bold; }
          .status-pending { color: #f59e0b; font-weight: bold; }
          .status-overdue { color: #ef4444; font-weight: bold; }
          .total-row { background: #f0f9ff; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SMARTOP</h1>
          <p>${t.print.accountStatement}</p>
        </div>
        <div class="info-section">
          <div class="info-box">
            <strong>${t.print.company}:</strong> ${firmDetails.name}<br/>
            <strong>${t.print.address}:</strong> ${firmDetails.address || t.print.notSpecified}<br/>
            <strong>${t.print.phone}:</strong> ${firmDetails.phone || t.print.notSpecified}
          </div>
          <div class="info-box">
            <strong>${t.print.date}:</strong> ${new Date().toLocaleDateString()}<br/>
            <strong>${t.activeMachine}:</strong> ${machineCount}<br/>
            <strong>${t.print.monthlyAmount}:</strong> ₺${monthlyTotal.toLocaleString()}
          </div>
        </div>
        <h3>${t.invoiceHistory}</h3>
        <table>
          <thead>
            <tr>
              <th>${t.table.invoiceNo}</th>
              <th>${t.table.date}</th>
              <th>${t.table.desc}</th>
              <th>${t.table.amount}</th>
              <th>${t.table.status}</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td>#${inv.id}</td>
                <td>${inv.date}</td>
                <td>${inv.description}</td>
                <td>₺${inv.amount.toLocaleString()}</td>
                <td class="status-${inv.status.toLowerCase()}">${getStatusLabel(inv.status)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">${t.print.total}</td>
              <td>₺${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <p>${t.print.documentCreatedAt} ${new Date().toLocaleString()}</p>
          <p>Smartop Fleet Management System</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t.table.invoiceNo} #${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e3a5f; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { margin: 0; color: #1e3a5f; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { width: 45%; }
          .party h4 { color: #666; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .details-row:last-child { border-bottom: none; }
          .total { font-size: 24px; font-weight: bold; color: #1e3a5f; text-align: right; margin-top: 20px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .status-paid { background: #d1fae5; color: #059669; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-overdue { background: #fee2e2; color: #dc2626; }
          .footer { margin-top: 50px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SMARTOP</div>
          <div class="invoice-info">
            <h2>${t.table.invoiceNo.toUpperCase()}</h2>
            <p>#${invoice.id}</p>
            <p>${invoice.date}</p>
          </div>
        </div>
        <div class="parties">
          <div class="party">
            <h4>${t.print.sender}</h4>
            <strong>Smartop Teknoloji A.Ş.</strong><br/>
            Istanbul, Turkey<br/>
            info@smartop.com.tr
          </div>
          <div class="party">
            <h4>${t.print.recipient}</h4>
            <strong>${firmDetails.name}</strong><br/>
            ${firmDetails.address || ''}<br/>
            ${firmDetails.email || ''}
          </div>
        </div>
        <div class="details">
          <div class="details-row">
            <span>${t.print.description}</span>
            <span>${invoice.description}</span>
          </div>
          <div class="details-row">
            <span>${t.print.period}</span>
            <span>${invoice.date}</span>
          </div>
          <div class="details-row">
            <span>${t.table.status}</span>
            <span class="status status-${invoice.status.toLowerCase()}">${getStatusLabel(invoice.status)}</span>
          </div>
        </div>
        <div class="total">
          ${t.print.total}: ₺${invoice.amount.toLocaleString()}
        </div>
        <div class="footer">
          <p>${t.print.electronicInvoice}</p>
          <p>Smartop Fleet Management System | ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleUpdateCard = () => {
    // In a real app, this would call an API to update payment info
    if (cardDetails.number && cardDetails.expiry && cardDetails.cvv && cardDetails.name) {
      alert(t.print.cardUpdated);
      setShowCardUpdateModal(false);
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
    }
  };

  const paymentMethods = [
    {
      id: 'credit_card' as PaymentMethodType,
      name: t.paymentMethods.creditCard,
      icon: CreditCard,
      description: t.paymentMethods.autoMonthly,
      details: '**** **** **** 4242'
    },
    {
      id: 'marketplace' as PaymentMethodType,
      name: t.paymentMethods.marketplace,
      icon: Store,
      description: t.paymentMethods.marketplaceDesc,
      details: t.paymentMethods.linkedAccount
    },
    {
      id: 'bank_transfer' as PaymentMethodType,
      name: t.paymentMethods.bankTransfer,
      icon: Building2,
      description: t.paymentMethods.manualTransfer,
      details: 'TR12 3456 7890 1234 5678 90'
    }
  ];

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
        <button
          onClick={handleDownloadStatement}
          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-smart-navy dark:text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
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
                  <span>{machineCount} {t.activeMachine}</span>
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
              <p className="text-sm text-gray-400 mt-1">{t.autoDebit}</p>
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
                  {discountActive ? t.discountActive : t.discountStandard}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {discountActive
                    ? t.volumeDiscount
                    : `${discountThreshold - machineCount} ${t.earnDiscount}`}
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-1 space-y-6">
              <h3 className="text-lg font-bold text-smart-navy dark:text-white">{t.paymentMethod}</h3>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-smart-navy dark:border-smart-yellow bg-blue-50 dark:bg-slate-700'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected
                            ? 'bg-smart-navy dark:bg-smart-yellow text-white dark:text-smart-navy'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-bold ${
                              isSelected ? 'text-smart-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {method.name}
                            </p>
                            {isSelected && (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{method.description}</p>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">{method.details}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Card Visual - Only show when credit card is selected */}
              {selectedPaymentMethod === 'credit_card' && (
                <>
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

                  <button
                    onClick={() => setShowCardUpdateModal(true)}
                    className="w-full border border-gray-300 dark:border-slate-600 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                      {t.updateCard}
                  </button>
                </>
              )}

              {/* Bank Transfer Info - Show when bank transfer is selected */}
              {selectedPaymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
                  <h4 className="font-bold text-smart-navy dark:text-white mb-3 flex items-center gap-2">
                    <Building2 size={18} />
                    {t.bankInfo.title}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t.bankInfo.bank}:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Garanti BBVA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t.bankInfo.accountName}:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Smartop Teknoloji A.Ş.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t.bankInfo.iban}:</span>
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-200">TR12 3456 7890 1234 5678 90</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-white dark:bg-slate-800 p-2 rounded">
                    {t.bankInfo.note}
                  </p>
                </div>
              )}

              {/* Marketplace Info - Show when marketplace is selected */}
              {selectedPaymentMethod === 'marketplace' && (
                <div className="bg-orange-50 dark:bg-slate-700 rounded-xl p-4 border border-orange-200 dark:border-slate-600">
                  <h4 className="font-bold text-smart-navy dark:text-white mb-3 flex items-center gap-2">
                    <Store size={18} />
                    {t.marketplaceInfo.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {t.marketplaceInfo.description}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold text-sm transition-colors">
                      Hepsiburada
                    </button>
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold text-sm transition-colors">
                      Trendyol
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {t.marketplaceInfo.note}
                  </p>
                </div>
              )}
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
                                        title={t.downloadPDF}
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

      {/* Card Update Modal */}
      {showCardUpdateModal && (
        <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-smart-navy dark:bg-black p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard />
                {t.modal.updateCard}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.cardNumber}</label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
                    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                    setCardDetails({ ...cardDetails, number: formatted });
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.expiry}</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '').substring(0, 4);
                      if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2);
                      }
                      setCardDetails({ ...cardDetails, expiry: value });
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.cvv}</label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').substring(0, 3);
                      setCardDetails({ ...cardDetails, cvv: value });
                    }}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">{t.modal.cardName}</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                  placeholder="AD SOYAD"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white uppercase"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCardUpdateModal(false);
                  setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
                }}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                {t.modal.cancel}
              </button>
              <button
                onClick={handleUpdateCard}
                disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name}
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
