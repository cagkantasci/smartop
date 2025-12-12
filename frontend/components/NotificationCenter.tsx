import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  CreditCard,
  Receipt,
  Info,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Smartphone,
  UserCheck,
  Filter,
  History,
  X
} from 'lucide-react';
import api from '../src/services/api';
import { Language } from '../types';

interface NotificationCenterProps {
  isDarkMode: boolean;
  language: Language;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}

interface NotificationHistory {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  recipientCount: number;
}

type NotificationType = 'broadcast' | 'payment' | 'subscription' | 'info';

const TRANSLATIONS = {
  tr: {
    title: 'Bildirim Merkezi',
    subtitle: 'Kullanıcılara bildirim gönderin',
    sendNotification: 'Bildirim Gönder',
    notificationHistory: 'Bildirim Geçmişi',
    notificationTitle: 'Başlık',
    notificationTitlePlaceholder: 'Bildirim başlığı...',
    message: 'Mesaj',
    messagePlaceholder: 'Bildirim mesajı...',
    notificationType: 'Bildirim Türü',
    targetAudience: 'Hedef Kitle',
    allUsers: 'Tüm Kullanıcılar',
    adminsOnly: 'Sadece Yöneticiler',
    managersOnly: 'Sadece Müdürler',
    operatorsOnly: 'Sadece Operatörler',
    managersAndOperators: 'Müdürler ve Operatörler',
    specificUsers: 'Belirli Kullanıcılar',
    selectUsers: 'Kullanıcı Seç',
    deliveryOptions: 'Gönderim Seçenekleri',
    pushNotification: 'Push Bildirim',
    emailNotification: 'E-posta Bildirim',
    send: 'Gönder',
    sending: 'Gönderiliyor...',
    success: 'Bildirim başarıyla gönderildi!',
    error: 'Bildirim gönderilemedi',
    sentTo: 'kişiye gönderildi',
    types: {
      broadcast: 'Genel Duyuru',
      payment: 'Ödeme Bildirimi',
      subscription: 'Abonelik Bildirimi',
      info: 'Bilgilendirme'
    },
    typeDescriptions: {
      broadcast: 'Genel duyurular ve önemli haberler',
      payment: 'Ödeme hatırlatmaları ve fatura bildirimleri',
      subscription: 'Abonelik durumu ve yenileme bildirimleri',
      info: 'Genel bilgilendirme mesajları'
    },
    quickTemplates: 'Hızlı Şablonlar',
    templates: {
      paymentReminder: 'Ödeme Hatırlatması',
      subscriptionExpiring: 'Abonelik Bitiyor',
      maintenanceNotice: 'Bakım Bildirimi',
      newFeature: 'Yeni Özellik'
    },
    noHistory: 'Henüz gönderilmiş bildirim yok',
    recipients: 'alıcı',
    loadingUsers: 'Kullanıcılar yükleniyor...',
    loadingHistory: 'Geçmiş yükleniyor...',
    selectedUsers: 'seçili kullanıcı',
    clearSelection: 'Seçimi Temizle'
  },
  en: {
    title: 'Notification Center',
    subtitle: 'Send notifications to users',
    sendNotification: 'Send Notification',
    notificationHistory: 'Notification History',
    notificationTitle: 'Title',
    notificationTitlePlaceholder: 'Notification title...',
    message: 'Message',
    messagePlaceholder: 'Notification message...',
    notificationType: 'Notification Type',
    targetAudience: 'Target Audience',
    allUsers: 'All Users',
    adminsOnly: 'Admins Only',
    managersOnly: 'Managers Only',
    operatorsOnly: 'Operators Only',
    managersAndOperators: 'Managers & Operators',
    specificUsers: 'Specific Users',
    selectUsers: 'Select Users',
    deliveryOptions: 'Delivery Options',
    pushNotification: 'Push Notification',
    emailNotification: 'Email Notification',
    send: 'Send',
    sending: 'Sending...',
    success: 'Notification sent successfully!',
    error: 'Failed to send notification',
    sentTo: 'sent to',
    types: {
      broadcast: 'General Announcement',
      payment: 'Payment Notification',
      subscription: 'Subscription Notification',
      info: 'Information'
    },
    typeDescriptions: {
      broadcast: 'General announcements and important news',
      payment: 'Payment reminders and invoice notifications',
      subscription: 'Subscription status and renewal notifications',
      info: 'General information messages'
    },
    quickTemplates: 'Quick Templates',
    templates: {
      paymentReminder: 'Payment Reminder',
      subscriptionExpiring: 'Subscription Expiring',
      maintenanceNotice: 'Maintenance Notice',
      newFeature: 'New Feature'
    },
    noHistory: 'No notifications sent yet',
    recipients: 'recipients',
    loadingUsers: 'Loading users...',
    loadingHistory: 'Loading history...',
    selectedUsers: 'selected users',
    clearSelection: 'Clear Selection'
  }
};

const QUICK_TEMPLATES = {
  tr: {
    paymentReminder: {
      title: 'Ödeme Hatırlatması',
      body: 'Aylık faturanızın son ödeme tarihi yaklaşıyor. Lütfen ödemenizi zamanında yapınız.',
      type: 'payment' as NotificationType
    },
    subscriptionExpiring: {
      title: 'Abonelik Süresi Doluyor',
      body: 'Aboneliğinizin bitiş tarihi yaklaşıyor. Kesintisiz hizmet için yenileme yapınız.',
      type: 'subscription' as NotificationType
    },
    maintenanceNotice: {
      title: 'Planlı Bakım Bildirimi',
      body: 'Sistemimizde planlı bakım çalışması yapılacaktır. Bu süre zarfında hizmet kesintisi yaşanabilir.',
      type: 'info' as NotificationType
    },
    newFeature: {
      title: 'Yeni Özellik!',
      body: 'SmartOP\'a yeni özellikler eklendi. Keşfetmek için uygulamayı açın.',
      type: 'broadcast' as NotificationType
    }
  },
  en: {
    paymentReminder: {
      title: 'Payment Reminder',
      body: 'Your monthly invoice due date is approaching. Please make your payment on time.',
      type: 'payment' as NotificationType
    },
    subscriptionExpiring: {
      title: 'Subscription Expiring',
      body: 'Your subscription is about to expire. Renew now for uninterrupted service.',
      type: 'subscription' as NotificationType
    },
    maintenanceNotice: {
      title: 'Scheduled Maintenance',
      body: 'Scheduled maintenance will be performed on our system. Service interruption may occur during this time.',
      type: 'info' as NotificationType
    },
    newFeature: {
      title: 'New Feature!',
      body: 'New features have been added to SmartOP. Open the app to explore.',
      type: 'broadcast' as NotificationType
    }
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isDarkMode, language }) => {
  const t = TRANSLATIONS[language];
  const templates = QUICK_TEMPLATES[language];

  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('broadcast');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUsers();
    loadHistory();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/notifications/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/notifications/history');
      setHistory(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setErrorMessage(language === 'tr' ? 'Başlık ve mesaj gerekli' : 'Title and message required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload: any = {
        title,
        body,
        type: notificationType,
        sendPush,
        sendEmail
      };

      if (targetAudience === 'specific' && selectedUserIds.length > 0) {
        payload.targetUserIds = selectedUserIds;
      } else if (targetAudience !== 'all') {
        payload.targetRoles = getTargetRoles();
      }

      const response = await api.post('/notifications/broadcast', payload);

      setSuccessMessage(`${t.success} (${response.data.sent} ${t.sentTo})`);
      setTitle('');
      setBody('');
      setSelectedUserIds([]);
      loadHistory();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetRoles = (): string[] => {
    switch (targetAudience) {
      case 'admins': return ['admin'];
      case 'managers': return ['manager'];
      case 'operators': return ['operator'];
      case 'managers_operators': return ['manager', 'operator'];
      default: return [];
    }
  };

  const applyTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    setTitle(template.title);
    setBody(template.body);
    setNotificationType(template.type);
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'broadcast': return <Megaphone className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'subscription': return <Receipt className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'broadcast': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'subscription': return 'bg-purple-500';
      case 'info': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-500" />
          {t.title}
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {t.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'send'
              ? 'bg-blue-500 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Send className="w-4 h-4" />
          {t.sendNotification}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'history'
              ? 'bg-blue-500 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <History className="w-4 h-4" />
          {t.notificationHistory}
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-2 text-green-500">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {activeTab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className={`lg:col-span-2 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            {/* Notification Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.notificationType}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['broadcast', 'payment', 'subscription', 'info'] as NotificationType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setNotificationType(type)}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      notificationType === type
                        ? 'border-blue-500 bg-blue-500/10'
                        : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${getTypeColor(type)} text-white`}>
                      {getTypeIcon(type)}
                    </div>
                    <span className="text-sm font-medium">{t.types[type]}</span>
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.typeDescriptions[notificationType]}
              </p>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t.notificationTitle}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.notificationTitlePlaceholder}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.message}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.messagePlaceholder}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              />
            </div>

            {/* Target Audience */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.targetAudience}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'all', label: t.allUsers, icon: <Users className="w-4 h-4" /> },
                  { value: 'admins', label: t.adminsOnly, icon: <UserCheck className="w-4 h-4" /> },
                  { value: 'managers', label: t.managersOnly, icon: <UserCheck className="w-4 h-4" /> },
                  { value: 'operators', label: t.operatorsOnly, icon: <UserCheck className="w-4 h-4" /> },
                  { value: 'managers_operators', label: t.managersAndOperators, icon: <Users className="w-4 h-4" /> },
                  { value: 'specific', label: t.specificUsers, icon: <Filter className="w-4 h-4" /> },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTargetAudience(option.value);
                      if (option.value === 'specific') {
                        setShowUserSelector(true);
                      }
                    }}
                    className={`p-3 rounded-lg border transition flex items-center gap-2 ${
                      targetAudience === option.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Selected Users Display */}
              {targetAudience === 'specific' && selectedUserIds.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-blue-500">{selectedUserIds.length} {t.selectedUsers}</span>
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    {t.clearSelection}
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.deliveryOptions}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">{t.pushNotification}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{t.emailNotification}</span>
                </label>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !title.trim() || !body.trim()}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                isLoading || !title.trim() || !body.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.send}
                </>
              )}
            </button>
          </div>

          {/* Quick Templates Sidebar */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg h-fit`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t.quickTemplates}
            </h3>
            <div className="space-y-3">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key as keyof typeof templates)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(template.type)}
                    <span className="font-medium text-sm">{template.title}</span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                    {template.body}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2">{t.loadingHistory}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Bell className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t.noHistory}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type as NotificationType)} text-white`}>
                      {getTypeIcon(notification.type as NotificationType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(notification.createdAt).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {t.types[notification.type as NotificationType] || notification.type}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.recipientCount} {t.recipients}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md mx-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.selectUsers}</h3>
              <button
                onClick={() => setShowUserSelector(false)}
                className={`p-1 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">{t.loadingUsers}</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {users.map(user => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedUserIds.includes(user.id)
                        ? 'bg-blue-500/10 border border-blue-500'
                        : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 rounded text-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                      user.role === 'manager' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {user.role}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowUserSelector(false)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
              <button
                onClick={() => setShowUserSelector(false)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                {language === 'tr' ? 'Tamam' : 'Done'} ({selectedUserIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
