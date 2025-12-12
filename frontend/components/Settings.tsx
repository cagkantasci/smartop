
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Building2, Bell, Lock, Save, Camera, Mail, Shield, Smartphone, Globe, Moon, Sun, Loader2, CheckCircle } from 'lucide-react';
import { FirmDetails, Language, TranslationDictionary } from '../types';
import { userService } from '../src/services/userService';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: 'admin' | 'manager' | 'operator';
}

interface SettingsProps {
  firmDetails: FirmDetails;
  updateFirmDetails: (details: FirmDetails) => void;
  isDarkMode: boolean;
  toggleTheme?: () => void;
  language?: Language;
  setLanguage?: (lang: Language) => void;
  t: TranslationDictionary['settings'];
  user?: UserProfile | null;
  onUserUpdate?: (updates: Partial<UserProfile>) => void;
}

type TabType = 'profile' | 'company' | 'notifications' | 'security';

export const Settings: React.FC<SettingsProps> = ({ firmDetails, updateFirmDetails, isDarkMode, toggleTheme, language, setLanguage, t, user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [saveError, setSaveError] = useState('');

  // Form States - initialized from user prop
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || ''
  });

  // Sync profile data when user prop changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        jobTitle: user.jobTitle || ''
      });
    }
  }, [user]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Local state for form editing, initialized with props
  const [companyData, setCompanyData] = useState<FirmDetails>(firmDetails);

  // Sync local state if props change (optional, but good practice)
  useEffect(() => {
    setCompanyData(firmDetails);
  }, [firmDetails]);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    maintenanceAlert: true,
    marketing: false
  });

  const handleSave = async () => {
    // Validate password if on security tab
    if (activeTab === 'security' && passwordData.newPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Şifreler eşleşmiyor');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setPasswordError('Şifre en az 8 karakter olmalı');
        return;
      }
      if (!passwordData.currentPassword) {
        setPasswordError('Mevcut şifrenizi girin');
        return;
      }
    }

    setIsLoading(true);
    setPasswordError('');
    setSaveError('');

    try {
      if (activeTab === 'profile' && user) {
        // Call API to update user profile (email is read-only for security)
        const updatedUser = await userService.update(user.id, {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          jobTitle: profileData.jobTitle
        });

        // Update local state via callback
        if (onUserUpdate) {
          onUserUpdate({
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            jobTitle: updatedUser.jobTitle
          });
        }
      } else if (activeTab === 'company') {
        updateFirmDetails(companyData);
      } else if (activeTab === 'security' && passwordData.newPassword) {
        // TODO: Implement password change API
        // Clear password fields after successful change
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveError(error.response?.data?.message || 'Kaydetme sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAActivation = () => {
    if (verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      setVerificationCode('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: t.tabs.profile, icon: UserIcon },
    { id: 'company', label: t.tabs.company, icon: Building2 },
    { id: 'notifications', label: t.tabs.notifications, icon: Bell },
    { id: 'security', label: t.tabs.security, icon: Lock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-700">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                  <UserIcon size={40} className="text-gray-400" />
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-smart-navy dark:text-white">{t.labels.profilePhoto}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.labels.profilePhotoHint}</p>
              </div>
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4">
                {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{language === 'en' ? 'First Name' : 'Ad'}</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{language === 'en' ? 'Last Name' : 'Soyad'}</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.title}</label>
                <input
                  type="text"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">
                  {t.labels.email}
                  <span className="ml-2 text-xs text-gray-400 font-normal">({language === 'en' ? 'Cannot be changed' : 'Değiştirilemez'})</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
               <h3 className="text-lg font-bold text-smart-navy dark:text-white mb-4">{t.labels.appPreferences}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.language}</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select 
                        value={language}
                        onChange={(e) => setLanguage && setLanguage(e.target.value as Language)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white appearance-none"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                 </div>
                 
                 {toggleTheme && (
                   <div>
                      <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.theme}</label>
                      <button 
                        onClick={toggleTheme}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-700 dark:text-white"
                      >
                        <span className="flex items-center gap-2">
                          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                          {isDarkMode ? t.labels.darkMode : t.labels.lightMode}
                        </span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-smart-yellow' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                        </div>
                      </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-3">
              <Building2 className="text-smart-navy dark:text-blue-300 mt-1" />
              <div>
                <h4 className="font-bold text-smart-navy dark:text-white text-sm">{t.labels.companyInfoImportant}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{t.labels.companyInfoDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.firmName}</label>
                <input 
                  type="text" 
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.taxNo}</label>
                <input 
                  type="text" 
                  value={companyData.taxNo}
                  onChange={(e) => setCompanyData({...companyData, taxNo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.taxOffice}</label>
                <input 
                  type="text" 
                  value={companyData.taxOffice}
                  onChange={(e) => setCompanyData({...companyData, taxOffice: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.phone}</label>
                <input 
                  type="text" 
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.address}</label>
                <textarea 
                  rows={3}
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-fadeIn">
            {[
              { id: 'emailAlerts', label: t.notifications.emailAlerts, desc: t.notifications.emailAlertsDesc },
              { id: 'pushNotifications', label: t.notifications.pushNotifications, desc: t.notifications.pushDesc },
              { id: 'maintenanceAlert', label: t.notifications.maintenanceAlerts, desc: t.notifications.maintenanceDesc, important: true },
              { id: 'weeklyReport', label: t.notifications.weeklyReport, desc: t.notifications.weeklyReportDesc },
              { id: 'marketing', label: t.notifications.marketing, desc: t.notifications.marketingDesc },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
                <div className="flex items-center gap-3">
                   {item.important && <Bell className="text-smart-yellow" size={20} />}
                   <div>
                     <h4 className="font-bold text-smart-navy dark:text-white">{item.label}</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(notifications as any)[item.id]} 
                    onChange={() => setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-smart-navy"></div>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 flex items-start gap-3">
               <Shield className="text-orange-600 dark:text-orange-400 mt-1" />
               <div>
                  <h4 className="font-bold text-orange-800 dark:text-orange-300">{t.labels.accountSecurity}</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">{t.labels.securityHint}</p>
               </div>
             </div>

             {passwordError && (
               <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                 {passwordError}
               </div>
             )}

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.currentPassword}</label>
                   <input
                     type="password"
                     value={passwordData.currentPassword}
                     onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                     className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.newPassword}</label>
                   <input
                     type="password"
                     value={passwordData.newPassword}
                     onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                     className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-smart-navy dark:text-gray-300 mb-2">{t.labels.confirmPassword}</label>
                   <input
                     type="password"
                     value={passwordData.confirmPassword}
                     onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                     className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white text-gray-900 dark:bg-slate-700 dark:text-white"
                   />
                </div>
             </div>

             <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                   <div>
                      <h4 className="font-bold text-smart-navy dark:text-white flex items-center gap-2">
                        <Smartphone size={18} /> {t.labels.twoFactor}
                        {is2FAEnabled && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                            Aktif
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.labels.twoFactorDesc}</p>
                   </div>
                   <button
                     onClick={() => !is2FAEnabled && setShow2FAModal(true)}
                     className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${
                       is2FAEnabled
                         ? 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 cursor-default'
                         : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-700'
                     }`}
                   >
                      {is2FAEnabled ? 'Etkin' : t.labels.activate}
                   </button>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-smart-navy dark:text-white flex items-center gap-3">
             <UserIcon className="text-smart-yellow" />
             {t.title}
           </h2>
           <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg animate-bounce">
            <CheckCircle size={18} /> {t.saved}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${
                activeTab === tab.id 
                  ? 'bg-smart-navy dark:bg-white text-white dark:text-smart-navy shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          {renderContent()}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-smart-navy dark:bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-900 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {t.save}
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-smart-navy/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-smart-navy dark:bg-black p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield />
                İki Faktörlü Doğrulama
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <div className="text-4xl font-mono">QR</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Google Authenticator veya benzeri bir uygulama ile QR kodu tarayın
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Manuel giriş kodu:</p>
                <p className="font-mono text-sm text-smart-navy dark:text-white tracking-wider">
                  ABCD EFGH IJKL MNOP
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-smart-navy dark:text-white mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-smart-navy/20 outline-none bg-white text-gray-900 dark:bg-slate-700 dark:text-white text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Uygulamadaki 6 haneli kodu girin
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShow2FAModal(false);
                  setVerificationCode('');
                }}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handle2FAActivation}
                disabled={verificationCode.length !== 6}
                className="px-6 py-2 bg-smart-navy dark:bg-black text-white rounded-lg font-bold hover:bg-blue-900 dark:hover:bg-gray-700 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle size={18} />
                Aktifleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
