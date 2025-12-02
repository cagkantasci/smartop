
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, TrendingUp, Shield, Smartphone, ArrowRight, Activity, Zap, BarChart3, Globe, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

interface LandingPageProps {
  onLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { login, isLoading } = useAuth();
  const [machineCount, setMachineCount] = useState(15);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      setShowLoginModal(false);
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    // Pre-fill with demo credentials
    setEmail('admin@demo-insaat.com');
    setPassword('Admin123!');
  };
  
  // ROI Calculator Logic
  const monthlyCostPaper = machineCount * 450; // Paper forms, lost time, manual entry cost approx
  const monthlyCostSmart = machineCount * 450; // Base savings calc (just visualization)
  const savings = (monthlyCostPaper * 0.4).toLocaleString('tr-TR'); // 40% efficiency

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-smart-yellow selection:text-smart-navy overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-smart-yellow rounded-lg flex items-center justify-center">
              <Activity className="text-smart-navy w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Smartop</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Özellikler</a>
            <a href="#roi" className="hover:text-white transition-colors">Hesaplama</a>
            <a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a>
          </div>
          <button
            onClick={openLoginModal}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2"
          >
            Portal Girişi <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-smart-yellow/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
              🚀 İş Makineleri Yönetiminde Yeni Çağ
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              Saha Operasyonlarını <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-smart-yellow to-orange-500">Dijitalleştirin.</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Kağıt formlardan kurtulun. Ekskavatör, vinç ve kamyonlarınızı cebinizden yönetin. 
              Arızaları %40 azaltın, verimliliği artırın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={openLoginModal}
                className="bg-smart-yellow text-smart-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl shadow-yellow-500/20 flex items-center gap-2"
              >
                Ücretsiz Başlayın <ChevronRight />
              </button>
              <button className="px-8 py-4 rounded-xl font-bold text-lg text-white hover:bg-white/5 border border-white/10 transition-all">
                Demo Talep Et
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
             className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-xl shadow-2xl border border-white/10 opacity-80"
            />
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi" className="py-24 bg-slate-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ne Kadar Tasarruf Edersiniz?</h2>
              <p className="text-gray-400 mb-8">
                Makine sayınıza göre aylık operasyonel kayıpları ve Smartop ile kazanacağınız net tasarrufu hesaplayın.
              </p>
              
              <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-lg">
                <label className="block text-sm font-bold text-gray-400 mb-4">Filodaki Makine Sayısı: <span className="text-white text-xl ml-2">{machineCount}</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={machineCount} 
                  onChange={(e) => setMachineCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-smart-yellow mb-8"
                />
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Aylık Tahmini Tasarruf</p>
                    <p className="text-4xl font-black text-white tracking-tight">₺{savings}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Zap, title: "Hız", desc: "Form doldurma süresinde %70 azalma." },
                { icon: Shield, title: "Güvenlik", desc: "Arızaları önceden tespit edin." },
                { icon: BarChart3, title: "Analiz", desc: "Veriye dayalı bakım kararları." },
                { icon: Smartphone, title: "Mobil", desc: "Her operatörün cebinde." },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <item.icon className="text-smart-yellow mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Neden Smartop?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Geleneksel yöntemler yavaş, hataya açık ve pahalıdır. Biz süreci modernize ediyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Uzaktan Takip</h3>
              <p className="text-gray-400 leading-relaxed">
                Şantiyeye gitmeden hangi makinenin çalıştığını, hangisinin yattığını harita üzerinden görün.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-smart-yellow/20 rounded-lg flex items-center justify-center text-smart-yellow mb-6">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Dijital Onay</h3>
              <p className="text-gray-400 leading-relaxed">
                Operatör formu doldurur, yönetici anında onaylar. Islak imza bekleme derdine son.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Gelişmiş Raporlama</h3>
              <p className="text-gray-400 leading-relaxed">
                Hangi parça ne sıklıkla arıza yapıyor? Hangi operatör daha verimli? Hepsi tek ekranda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-smart-navy to-blue-900 rounded-3xl p-12 text-center relative overflow-hidden border border-white/10">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <Activity size={200} />
           </div>
           
           <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Filo Yönetimini Şimdi Başlatın</h2>
           <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
             Kredi kartı gerekmeden 14 gün boyunca tüm özellikleri ücretsiz deneyin.
           </p>
           <button
             onClick={openLoginModal}
             className="bg-smart-yellow text-smart-navy px-10 py-4 rounded-xl font-bold text-xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl relative z-10"
           >
             Hemen Kayıt Olun
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-900 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="text-smart-yellow w-5 h-5" />
            <span className="font-bold text-white">Smartop</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white">Kullanım Şartları</a>
            <a href="#" className="hover:text-white">Destek</a>
          </div>
          <p>© 2024 Smartop Inc. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-smart-yellow rounded-lg flex items-center justify-center">
                    <Activity className="text-smart-navy w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Portal Girişi</h2>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-300">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                    placeholder="ornek@firma.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-smart-yellow text-smart-navy py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-center text-gray-400 text-sm mb-3">Demo Hesapları:</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between bg-slate-900/50 px-3 py-2 rounded-lg">
                    <span>Admin:</span>
                    <span className="text-gray-300">admin@demo-insaat.com / Admin123!</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/50 px-3 py-2 rounded-lg">
                    <span>Manager:</span>
                    <span className="text-gray-300">manager@demo-insaat.com / Manager123!</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/50 px-3 py-2 rounded-lg">
                    <span>Operator:</span>
                    <span className="text-gray-300">operator1@demo-insaat.com / Operator123!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};