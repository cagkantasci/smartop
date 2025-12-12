
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, TrendingUp, Shield, Smartphone, ArrowRight, Activity, Zap, BarChart3, Globe, X, Loader2, AlertCircle, Mail, Building2, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { TranslationDictionary } from '../types';

interface LandingPageProps {
  onLogin?: () => void;
  t: TranslationDictionary['landing'];
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, t }) => {
  const { login, register, isLoading } = useAuth();
  const [machineCount, setMachineCount] = useState(15);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      setShowLoginModal(false);
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.errors.loginFailed);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError(t.auth.errors.passwordMismatch);
      return;
    }
    if (registerData.password.length < 8) {
      setError(t.auth.errors.passwordTooShort);
      return;
    }

    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        organizationName: registerData.organizationName
      });
      setSuccessMessage(t.auth.success.registerSuccess);
      setAuthMode('login');
      setEmail(registerData.email);
      setRegisterData({
        organizationName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.errors.registerFailed);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError(t.auth.errors.emailRequired);
      return;
    }

    // Simulate sending reset email
    setSuccessMessage(t.auth.success.resetLinkSent);
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMessage('');
    }, 3000);
  };

  const handleGoogleLogin = () => {
    // Google OAuth implementation placeholder
    setError(t.auth.errors.googleSoon);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setAuthMode('login');
    setError('');
    setSuccessMessage('');
    // Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    setPassword('');
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setAuthMode('login');
    setError('');
    setSuccessMessage('');
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
            <img src="/smartop-white.png" alt="Smartop" className="h-10 w-auto" />
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#roi" className="hover:text-white transition-colors">{t.nav.calculator}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.nav.pricing}</a>
          </div>
          <button
            onClick={openLoginModal}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2"
          >
            {t.nav.portalLogin} <ArrowRight size={16} />
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
              {t.hero.badge}
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              {t.hero.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-smart-yellow to-orange-500">{t.hero.titleHighlight}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={openLoginModal}
                className="bg-smart-yellow text-smart-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl shadow-yellow-500/20 flex items-center gap-2"
              >
                {t.hero.startFree} <ChevronRight />
              </button>
              <button className="px-8 py-4 rounded-xl font-bold text-lg text-white hover:bg-white/5 border border-white/10 transition-all">
                {t.hero.requestDemo}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.roi.title}</h2>
              <p className="text-gray-400 mb-8">
                {t.roi.subtitle}
              </p>

              <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-lg">
                <label className="block text-sm font-bold text-gray-400 mb-4">{t.roi.machineCount} <span className="text-white text-xl ml-2">{machineCount}</span></label>
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
                    <p className="text-sm text-gray-400">{t.roi.estimatedSavings}</p>
                    <p className="text-4xl font-black text-white tracking-tight">₺{savings}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Zap, title: t.roi.benefits.speed.title, desc: t.roi.benefits.speed.desc },
                { icon: Shield, title: t.roi.benefits.security.title, desc: t.roi.benefits.security.desc },
                { icon: BarChart3, title: t.roi.benefits.analysis.title, desc: t.roi.benefits.analysis.desc },
                { icon: Smartphone, title: t.roi.benefits.mobile.title, desc: t.roi.benefits.mobile.desc },
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
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.features.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">{t.features.remoteTracking.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t.features.remoteTracking.desc}
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-smart-yellow/20 rounded-lg flex items-center justify-center text-smart-yellow mb-6">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">{t.features.digitalApproval.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t.features.digitalApproval.desc}
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">{t.features.advancedReporting.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t.features.advancedReporting.desc}
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

           <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">{t.cta.title}</h2>
           <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
             {t.cta.subtitle}
           </p>
           <button
             onClick={openLoginModal}
             className="bg-smart-yellow text-smart-navy px-10 py-4 rounded-xl font-bold text-xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl relative z-10"
           >
             {t.cta.button}
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-900 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/smartop-white.png" alt="Smartop" className="h-5 w-auto" />
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white">{t.footer.terms}</a>
            <a href="#" className="hover:text-white">{t.footer.support}</a>
          </div>
          <p>{t.footer.copyright}</p>
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
            onClick={closeLoginModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <img src="/smartop-white.png" alt="Smartop" className="h-10 w-auto" />
                  <h2 className="text-2xl font-bold text-white">
                    {authMode === 'login' && t.auth.login}
                    {authMode === 'register' && t.auth.register}
                    {authMode === 'forgot-password' && t.auth.forgotPassword}
                  </h2>
                </div>
                <button
                  onClick={closeLoginModal}
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

              {successMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-300">
                  <CheckCircle size={18} />
                  <span className="text-sm">{successMessage}</span>
                </div>
              )}

              {/* Login Form */}
              {authMode === 'login' && (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.email}</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.emailPlaceholder}
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.password}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 pl-11 pr-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.passwordPlaceholder}
                          required
                        />
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-slate-900 text-smart-yellow focus:ring-smart-yellow focus:ring-offset-slate-800"
                        />
                        <span className="text-sm text-gray-400">{t.auth.rememberMe}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot-password'); setError(''); }}
                        className="text-sm text-smart-yellow hover:underline"
                      >
                        {t.auth.forgotPasswordLink}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-smart-yellow text-smart-navy py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          {t.auth.loggingIn}
                        </>
                      ) : (
                        t.auth.loginButton
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-gray-500 text-sm">{t.auth.or}</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  {/* Google Login */}
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t.auth.googleLogin}
                  </button>

                  {/* Register Link */}
                  <p className="text-center text-gray-400 text-sm mt-6">
                    {t.auth.noAccount}{' '}
                    <button
                      onClick={() => { setAuthMode('register'); setError(''); }}
                      className="text-smart-yellow hover:underline font-medium"
                    >
                      {t.auth.registerLink}
                    </button>
                  </p>

                </>
              )}

              {/* Register Form */}
              {authMode === 'register' && (
                <>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.companyName}</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={registerData.organizationName}
                          onChange={(e) => setRegisterData({...registerData, organizationName: e.target.value})}
                          className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.companyPlaceholder}
                          required
                        />
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.firstName}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                            className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                            placeholder={t.auth.firstNamePlaceholder}
                            required
                          />
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.lastName}</label>
                        <input
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.lastNamePlaceholder}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.email}</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.emailPlaceholder}
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.password}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="w-full px-4 py-3 pl-11 pr-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.passwordMinLength}
                          required
                        />
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.confirmPassword}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.confirmPasswordPlaceholder}
                          required
                        />
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-smart-yellow text-smart-navy py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          {t.auth.registering}
                        </>
                      ) : (
                        t.auth.registerButton
                      )}
                    </button>
                  </form>

                  {/* Login Link */}
                  <p className="text-center text-gray-400 text-sm mt-6">
                    {t.auth.hasAccount}{' '}
                    <button
                      onClick={() => { setAuthMode('login'); setError(''); }}
                      className="text-smart-yellow hover:underline font-medium"
                    >
                      {t.auth.loginLink}
                    </button>
                  </p>
                </>
              )}

              {/* Forgot Password Form */}
              {authMode === 'forgot-password' && (
                <>
                  <p className="text-gray-400 text-sm mb-6">
                    {t.auth.forgotPasswordDesc}
                  </p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t.auth.email}</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 pl-11 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-smart-yellow focus:border-transparent transition-all"
                          placeholder={t.auth.emailPlaceholder}
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-smart-yellow text-smart-navy py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          {t.auth.sending}
                        </>
                      ) : (
                        t.auth.sendResetLink
                      )}
                    </button>
                  </form>

                  {/* Back to Login */}
                  <p className="text-center text-gray-400 text-sm mt-6">
                    <button
                      onClick={() => { setAuthMode('login'); setError(''); setSuccessMessage(''); }}
                      className="text-smart-yellow hover:underline font-medium"
                    >
                      {t.auth.backToLogin}
                    </button>
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


