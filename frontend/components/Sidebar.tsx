
import React from 'react';
import { LayoutDashboard, Truck, CheckSquare, Settings, LogOut, HardHat, Building2, Phone, Briefcase, Wallet, ClipboardList, Sun, Moon, Smartphone, Users } from 'lucide-react';
import { Language, TranslationDictionary } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  firmName?: string;
  firmPhone?: string;
  subscriptionPlan?: string;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  language?: Language;
  setLanguage?: (lang: Language) => void;
  translations: TranslationDictionary['sidebar'];
  userName?: string;
  userRole?: 'admin' | 'manager' | 'operator';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  firmName = "Demo İnşaat A.Ş.",
  firmPhone = "+90 555 123 45 67",
  subscriptionPlan = "Kurumsal Plan",
  isDarkMode,
  toggleTheme,
  language,
  setLanguage,
  translations,
  userName,
  userRole
}) => {
  const t = translations;

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'machines', label: t.machines, icon: Truck },
    { id: 'operators', label: t.operators, icon: Users },
    { id: 'jobs', label: t.jobs, icon: Briefcase },
    { id: 'checklists', label: t.checklists, icon: ClipboardList },
    { id: 'approvals', label: t.approvals, icon: CheckSquare },
    { id: 'finance', label: t.finance, icon: Wallet },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-smart-navy dark:bg-black text-white flex flex-col fixed left-0 top-0 z-10 shadow-xl border-r border-yellow-500/20">
      <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-smart-navy dark:bg-black">
        <div className="w-10 h-10 bg-smart-yellow rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <HardHat className="text-smart-navy w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Smartop</h1>
          <p className="text-xs text-smart-yellow font-medium">{t.managerPortal}</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={48} />
            </div>
            
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-wider">{t.firmInfo}</p>
            
            <h3 className="text-sm font-bold text-white mb-1 truncate" title={firmName}>{firmName}</h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                <Phone size={10} />
                <span>{firmPhone}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs font-medium text-smart-yellow">{subscriptionPlan}</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
            </div>

            {userName && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-1">Giriş yapan:</p>
                <p className="text-sm font-medium text-white">{userName}</p>
                {userRole && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    userRole === 'admin' ? 'bg-red-500/20 text-red-300' :
                    userRole === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {userRole === 'admin' ? 'Admin' : userRole === 'manager' ? 'Yönetici' : 'Operatör'}
                  </span>
                )}
              </div>
            )}
        </div>
      </div>

      <nav className="flex-1 py-2 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent ${
              currentView === item.id
                ? 'bg-smart-yellow text-smart-navy font-bold shadow-lg border-yellow-400'
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Mobile Demo Button */}
        <button
            onClick={() => setCurrentView('mobile-sim')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-gray-600 hover:border-smart-yellow hover:text-smart-yellow transition-colors text-gray-400 mt-4 group"
        >
            <Smartphone className="w-5 h-5 group-hover:animate-pulse" />
            <span className="text-sm">Mobil App Demo</span>
        </button>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {setLanguage && (
            <div className="flex bg-white/5 rounded-lg p-1 mb-2">
                <button 
                    onClick={() => setLanguage('tr')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-bold transition-all ${language === 'tr' ? 'bg-smart-navy shadow text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <img src="https://flagcdn.com/w20/tr.png" className="w-4 h-3 rounded-[2px]" alt="TR" />
                    TR
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-bold transition-all ${language === 'en' ? 'bg-smart-navy shadow text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <img src="https://flagcdn.com/w20/gb.png" className="w-4 h-3 rounded-[2px]" alt="EN" />
                    EN
                </button>
            </div>
        )}

        {toggleTheme && (
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{isDarkMode ? t.lightMode : t.darkMode}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-smart-yellow' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
            </button>
        )}
        <button 
            onClick={() => setCurrentView('logout')}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};
