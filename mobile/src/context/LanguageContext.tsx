import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'tr' | 'en';

// Türkçe çeviriler - Türkçe karakterler ile
const tr = {
  // Common
  common: {
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    close: 'Kapat',
    confirm: 'Onayla',
    search: 'Ara',
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    warning: 'Uyarı',
    retry: 'Tekrar Dene',
    all: 'Tümü',
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    completed: 'Tamamlandı',
    inProgress: 'Devam Ediyor',
    notFound: 'Bulunamadı',
  },

  // Tab Labels
  tabs: {
    dashboard: 'Anasayfa',
    machines: 'Makineler',
    jobs: 'İşler',
    checklist: 'Kontrol',
    approvals: 'Onaylar',
    profile: 'Profil',
  },

  // Dashboard
  dashboard: {
    greeting: {
      morning: 'Günaydın',
      afternoon: 'İyi günler',
      evening: 'İyi akşamlar',
    },
    user: 'Kullanıcı',
    stats: {
      activeMachines: 'Aktif Makine',
      pendingChecklists: 'Bekleyen Kontrol',
      activeJobs: 'Aktif İş',
      alerts: 'Uyarı',
    },
    sections: {
      machines: 'Makineler',
      activeJobs: 'Aktif İşler',
      seeAll: 'Tümünü Gör',
      map: 'Canlı Harita',
    },
    map: {
      active: 'Aktif',
      idle: 'Boşta',
      maintenance: 'Bakımda',
      outOfService: 'Devre Dışı',
      job: 'İş',
      progress: 'İlerleme',
      noLocation: 'Henüz konum verisi yok',
    },
    empty: {
      machines: 'Henüz makine yok',
      jobs: 'Aktif iş yok',
    },
  },

  // Machines
  machines: {
    title: 'Makineler',
    subtitle: '{count} makine listeleniyor',
    search: 'Makine ara...',
    addNew: 'Yeni Makine Ekle',
    status: {
      all: 'Tümü',
      active: 'Aktif',
      idle: 'Boşta',
      maintenance: 'Bakımda',
      outOfService: 'Servis Dışı',
    },
    fields: {
      name: 'Makine Adı',
      brand: 'Marka',
      model: 'Model',
      plateNumber: 'Plaka',
      year: 'Yıl',
      hours: 'saat',
    },
    detail: {
      info: 'Bilgiler',
      operator: 'Operatör',
      checklists: 'Kontrol Geçmişi',
      assignOperator: 'Operatör Ata',
      changeStatus: 'Durum Değiştir',
      noOperator: 'Operatör atanmamış',
      selectOperator: 'Operatör Seç',
      assign: 'Ata',
      noChecklists: 'Henüz kontrol kaydı yok',
    },
    empty: {
      title: 'Makine Bulunamadı',
      filtered: 'Arama kriterlerinize uygun makine bulunamadı',
      noMachines: 'Henüz kayıtlı makine yok',
    },
    messages: {
      addSuccess: 'Makine eklendi',
      addError: 'Makine eklenemedi',
      updateSuccess: 'Makine güncellendi',
      updateError: 'Makine güncellenemedi',
      requiredFields: 'Lütfen zorunlu alanları doldurun',
    },
  },

  // Jobs
  jobs: {
    title: 'İşler',
    subtitle: '{count} iş listeleniyor',
    addNew: 'Yeni İş Ekle',
    search: 'İş ara...',
    status: {
      all: 'Tümü',
      pending: 'Bekliyor',
      inProgress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    },
    priority: {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      urgent: 'Acil',
    },
    fields: {
      title: 'İş Başlığı',
      description: 'Açıklama',
      machine: 'Makine',
      priority: 'Öncelik',
      location: 'Konum',
      selectLocation: 'Haritadan Konum Seç',
      locationSelected: 'Konum seçildi',
    },
    detail: {
      jobDetail: 'İş Detayı',
      location: 'Konum',
      startJob: 'İşi Başlat',
      completeJob: 'İşi Tamamla',
    },
    empty: {
      title: 'İş Bulunamadı',
      filtered: 'Arama kriterlerinize uygun iş bulunamadı',
      noJobs: 'Henüz kayıtlı iş yok',
    },
    messages: {
      addSuccess: 'İş oluşturuldu',
      addError: 'İş oluşturulamadı',
      startSuccess: 'İş başlatıldı',
      completeSuccess: 'İş tamamlandı',
      requiredFields: 'Lütfen zorunlu alanları doldurun',
    },
  },

  // Checklist
  checklist: {
    title: 'Günlük Kontrol',
    subtitle: 'Makine seçin',
    instruction: 'Kontrol yapmak istediğiniz makineyi seçin',
    progress: '{checked}/{total} kontrol tamamlandı',
    complete: 'Kontrolü Tamamla',
    issueReported: '{count} sorun bildirildi',
    hasIssue: 'Sorun Var',
    describeIssue: 'Sorunu açıklayın...',
    success: {
      title: 'Kontrol Tamamlandı!',
      message: '{machine} için günlük kontrol başarıyla kaydedildi.',
      newCheck: 'Yeni Kontrol Başlat',
    },
    empty: {
      noMachines: 'Aktif makine bulunamadı',
      noTemplate: 'Bu makine için kontrol listesi bulunamadı',
    },
    confirm: {
      incomplete: 'Eksik Kontrol',
      incompleteMessage: '{count} kontrol maddesi işaretlenmedi. Yine de göndermek istiyor musunuz?',
      send: 'Gönder',
    },
    messages: {
      loadError: 'Kontrol listesi yüklenemedi',
      submitError: 'Kontrol listesi gönderilemedi',
    },
  },

  // Approvals
  approvals: {
    title: 'Onay İşlemleri',
    subtitle: '{count} bekleyen onay',
    status: {
      all: 'Tümü',
      pending: 'Bekleyen',
      approved: 'Onaylanan',
      rejected: 'Reddedilen',
    },
    detail: {
      title: 'Kontrol Detayı',
      machine: 'Makine',
      operator: 'Operatör',
      template: 'Şablon',
      date: 'Tarih',
      items: 'Kontrol Maddeleri',
      notes: 'Notlar',
    },
    approve: 'Onayla',
    reject: 'Reddet',
    confirmReject: 'Bu kontrol listesini reddetmek istediğinizden emin misiniz?',
    issues: '{count} Sorun',
    empty: {
      title: 'Hepsi Tamam!',
      noPending: 'Bekleyen onay bulunmuyor',
      noSubmissions: 'Kontrol listesi bulunamadı',
    },
    messages: {
      approved: 'Kontrol listesi onaylandı',
      rejected: 'Kontrol listesi reddedildi',
      error: 'İşlem başarısız oldu',
    },
  },

  // Profile
  profile: {
    title: 'Profil',
    role: {
      admin: 'Yönetici',
      manager: 'Saha Yöneticisi',
      operator: 'Operatör',
      user: 'Kullanıcı',
    },
    sections: {
      account: 'Hesap',
      app: 'Uygulama',
      support: 'Destek',
    },
    menu: {
      profileInfo: 'Profil Bilgileri',
      profileInfoSub: 'Kişisel bilgilerinizi düzenleyin',
      changePassword: 'Şifre Değiştir',
      changePasswordSub: 'Hesap güvenliğinizi yönetin',
      notifications: 'Bildirimler',
      notificationsSub: 'Bildirim tercihlerinizi ayarlayın',
      appearance: 'Görünüm',
      language: 'Dil',
      sync: 'Veri Senkronizasyonu',
      syncSub: 'Çevrimdışı veri ayarları',
      helpCenter: 'Yardım Merkezi',
      createTicket: 'Destek Talebi Oluştur',
      terms: 'Kullanım Koşulları',
      privacy: 'Gizlilik Politikası',
      logout: 'Çıkış Yap',
    },
    modals: {
      profileTitle: 'Profil Bilgileri',
      passwordTitle: 'Şifre Değiştir',
      notificationsTitle: 'Bildirim Ayarları',
      appearanceTitle: 'Görünüm',
      languageTitle: 'Dil Seçimi',
      syncTitle: 'Senkronizasyon',
      supportTitle: 'Destek Talebi',
    },
    fields: {
      firstName: 'Ad',
      lastName: 'Soyad',
      phone: 'Telefon',
      email: 'E-posta',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Yeni Şifre (Tekrar)',
    },
    placeholders: {
      firstName: 'Adınız',
      lastName: 'Soyadınız',
      phone: '05XX XXX XX XX',
      currentPassword: 'Mevcut şifreniz',
      newPassword: 'Yeni şifreniz',
      confirmPassword: 'Yeni şifrenizi tekrar girin',
    },
    notifications: {
      channels: 'Bildirim Kanalları',
      push: 'Push Bildirimleri',
      pushSub: 'Uygulama bildirimleri',
      emailNotif: 'E-posta Bildirimleri',
      emailSub: 'Önemli güncellemeler için',
      sms: 'SMS Bildirimleri',
      smsSub: 'Kritik uyarılar için',
      types: 'Bildirim Türleri',
      checklistReminder: 'Kontrol Hatırlatıcıları',
      checklistReminderSub: 'Günlük kontrol bildirimleri',
      jobUpdates: 'İş Güncellemeleri',
      jobUpdatesSub: 'Yeni iş ve değişiklikler',
      maintenanceAlerts: 'Bakım Uyarıları',
      maintenanceAlertsSub: 'Yaklaşan bakım bildirimleri',
    },
    theme: {
      dark: 'Koyu Tema',
      darkSub: 'Göz yorgunluğunu azaltır',
      light: 'Açık Tema',
      lightSub: 'Klasik görünüm',
      system: 'Sistem Ayarı',
      systemSub: 'Cihaz ayarına göre',
    },
    sync: {
      auto: 'Otomatik Senkronizasyon',
      autoSub: 'Verileri otomatik senkronize et',
      wifiOnly: 'Sadece Wi-Fi',
      wifiOnlySub: 'Mobil veride senkronizasyon yapma',
      interval: 'Senkronizasyon Aralığı',
      minutes: '{count} dakika',
      syncNow: 'Şimdi Senkronize Et',
    },
    support: {
      subject: 'Konu',
      subjectPlaceholder: 'Sorun veya önerinizi kısaca yazın',
      message: 'Mesaj',
      messagePlaceholder: 'Detaylı açıklama yazın...',
      alternativeContact: 'Alternatif İletişim',
      send: 'Gönder',
    },
    logout: {
      title: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
    },
    messages: {
      profileUpdated: 'Profil bilgileriniz güncellendi',
      profileError: 'Profil güncellenemedi',
      passwordChanged: 'Şifreniz değiştirildi',
      passwordError: 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.',
      notificationsSaved: 'Bildirim tercihleri kaydedildi',
      settingsError: 'Ayarlar kaydedilemedi',
      supportSent: 'Destek talebiniz iletildi. En kısa sürede döneceğiz.',
      supportError: 'Talep gönderilemedi',
      pageError: 'Sayfa açılamadı',
      requiredFields: 'Lütfen tüm alanları doldurun',
      passwordMismatch: 'Yeni şifreler eşleşmiyor',
      passwordTooShort: 'Şifre en az 6 karakter olmalı',
      nameRequired: 'Ad ve soyad zorunludur',
    },
    appInfo: {
      version: 'Smartop v1.0.0',
      copyright: '© 2024 Smartop Filo Yönetimi',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'Giriş Yap',
      email: 'E-posta',
      password: 'Şifre',
      submit: 'Giriş Yap',
      forgotPassword: 'Şifremi Unuttum',
    },
    messages: {
      loginError: 'Giriş başarısız. E-posta ve şifrenizi kontrol edin.',
    },
  },

  // Operators
  operators: {
    title: 'Ekip Yönetimi',
    subtitle: '{count} kişi listeleniyor',
    search: 'İsim veya email ile ara...',
    addNew: 'Yeni Personel Ekle',
    filter: {
      all: 'Tümü',
      operators: 'Operatörler',
      managers: 'Yöneticiler',
    },
    role: {
      admin: 'Admin',
      manager: 'Yönetici',
      operator: 'Operatör',
    },
    status: {
      active: 'Aktif',
      inactive: 'Pasif',
      total: 'Toplam',
    },
    detail: {
      info: 'Bilgiler',
      contact: 'İletişim',
      licenses: 'Sertifikalar',
      specialties: 'Uzmanlık Alanları',
      assignedMachines: 'Atanan Makineler',
      performance: 'Performans',
      noAssignedMachines: 'Atanmış makine yok',
    },
    empty: {
      title: 'Personel Bulunamadı',
      filtered: 'Arama kriterlerine uygun kullanıcı bulunamadı',
      noOperators: 'Henüz ekip üyesi yok',
    },
    messages: {
      loadError: 'Kullanıcılar yüklenirken bir hata oluştu',
      addSuccess: 'Personel eklendi',
      updateSuccess: 'Personel güncellendi',
      deleteSuccess: 'Personel silindi',
    },
  },

  // Checklist Templates
  checklistTemplates: {
    title: 'Kontrol Şablonları',
    addTemplate: 'Yeni Şablon',
    editTemplate: 'Şablonu Düzenle',
    items: 'madde',
    form: {
      name: 'Şablon Adı',
      namePlaceholder: 'Örn: Günlük Kontrol Listesi',
      description: 'Açıklama',
      descriptionPlaceholder: 'Şablon açıklaması (opsiyonel)',
      items: 'Kontrol Maddeleri',
      itemPlaceholder: 'Yeni madde ekle...',
      noItems: 'Henüz kontrol maddesi eklenmedi',
    },
    confirmDelete: {
      title: 'Şablonu Sil',
      message: 'Bu şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    },
    empty: {
      title: 'Şablon Bulunamadı',
      subtitle: 'Henüz kontrol şablonu oluşturulmamış',
    },
    messages: {
      loadError: 'Şablonlar yüklenemedi',
      createSuccess: 'Şablon oluşturuldu',
      updateSuccess: 'Şablon güncellendi',
      deleteSuccess: 'Şablon silindi',
      saveError: 'Şablon kaydedilemedi',
      deleteError: 'Şablon silinemedi',
      nameRequired: 'Şablon adı zorunludur',
      itemsRequired: 'En az bir kontrol maddesi ekleyin',
    },
  },
};

// English translations
const en = {
  // Common
  common: {
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    retry: 'Retry',
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    inProgress: 'In Progress',
    notFound: 'Not Found',
  },

  // Tab Labels
  tabs: {
    dashboard: 'Home',
    machines: 'Machines',
    jobs: 'Jobs',
    checklist: 'Checklist',
    approvals: 'Approvals',
    profile: 'Profile',
  },

  // Dashboard
  dashboard: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    user: 'User',
    stats: {
      activeMachines: 'Active Machines',
      pendingChecklists: 'Pending Checklists',
      activeJobs: 'Active Jobs',
      alerts: 'Alerts',
    },
    sections: {
      machines: 'Machines',
      activeJobs: 'Active Jobs',
      seeAll: 'See All',
      map: 'Live Map',
    },
    map: {
      active: 'Active',
      idle: 'Idle',
      maintenance: 'Maintenance',
      outOfService: 'Out of Service',
      job: 'Job',
      progress: 'Progress',
      noLocation: 'No location data yet',
    },
    empty: {
      machines: 'No machines yet',
      jobs: 'No active jobs',
    },
  },

  // Machines
  machines: {
    title: 'Machines',
    subtitle: '{count} machines listed',
    search: 'Search machines...',
    addNew: 'Add New Machine',
    status: {
      all: 'All',
      active: 'Active',
      idle: 'Idle',
      maintenance: 'Maintenance',
      outOfService: 'Out of Service',
    },
    fields: {
      name: 'Machine Name',
      brand: 'Brand',
      model: 'Model',
      plateNumber: 'Plate Number',
      year: 'Year',
      hours: 'hours',
    },
    detail: {
      info: 'Information',
      operator: 'Operator',
      checklists: 'Checklist History',
      assignOperator: 'Assign Operator',
      changeStatus: 'Change Status',
      noOperator: 'No operator assigned',
      selectOperator: 'Select Operator',
      assign: 'Assign',
      noChecklists: 'No checklist records yet',
    },
    empty: {
      title: 'No Machines Found',
      filtered: 'No machines match your search criteria',
      noMachines: 'No machines registered yet',
    },
    messages: {
      addSuccess: 'Machine added',
      addError: 'Failed to add machine',
      updateSuccess: 'Machine updated',
      updateError: 'Failed to update machine',
      requiredFields: 'Please fill in required fields',
    },
  },

  // Jobs
  jobs: {
    title: 'Jobs',
    subtitle: '{count} jobs listed',
    addNew: 'Add New Job',
    search: 'Search jobs...',
    status: {
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    },
    fields: {
      title: 'Job Title',
      description: 'Description',
      machine: 'Machine',
      priority: 'Priority',
      location: 'Location',
      selectLocation: 'Select Location from Map',
      locationSelected: 'Location selected',
    },
    detail: {
      jobDetail: 'Job Detail',
      location: 'Location',
      startJob: 'Start Job',
      completeJob: 'Complete Job',
    },
    empty: {
      title: 'No Jobs Found',
      filtered: 'No jobs match your search criteria',
      noJobs: 'No jobs registered yet',
    },
    messages: {
      addSuccess: 'Job created',
      addError: 'Failed to create job',
      startSuccess: 'Job started',
      completeSuccess: 'Job completed',
      requiredFields: 'Please fill in required fields',
    },
  },

  // Checklist
  checklist: {
    title: 'Daily Checklist',
    subtitle: 'Select a machine',
    instruction: 'Select the machine you want to check',
    progress: '{checked}/{total} checks completed',
    complete: 'Complete Checklist',
    issueReported: '{count} issues reported',
    hasIssue: 'Has Issue',
    describeIssue: 'Describe the issue...',
    success: {
      title: 'Checklist Completed!',
      message: 'Daily check for {machine} has been saved successfully.',
      newCheck: 'Start New Check',
    },
    empty: {
      noMachines: 'No active machines found',
      noTemplate: 'No checklist template found for this machine',
    },
    confirm: {
      incomplete: 'Incomplete Checklist',
      incompleteMessage: '{count} items are not checked. Do you still want to submit?',
      send: 'Submit',
    },
    messages: {
      loadError: 'Failed to load checklist',
      submitError: 'Failed to submit checklist',
    },
  },

  // Approvals
  approvals: {
    title: 'Approval Process',
    subtitle: '{count} pending approvals',
    status: {
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    detail: {
      title: 'Checklist Detail',
      machine: 'Machine',
      operator: 'Operator',
      template: 'Template',
      date: 'Date',
      items: 'Checklist Items',
      notes: 'Notes',
    },
    approve: 'Approve',
    reject: 'Reject',
    confirmReject: 'Are you sure you want to reject this checklist?',
    issues: '{count} Issues',
    empty: {
      title: 'All Done!',
      noPending: 'No pending approvals',
      noSubmissions: 'No checklists found',
    },
    messages: {
      approved: 'Checklist approved',
      rejected: 'Checklist rejected',
      error: 'Operation failed',
    },
  },

  // Profile
  profile: {
    title: 'Profile',
    role: {
      admin: 'Administrator',
      manager: 'Field Manager',
      operator: 'Operator',
      user: 'User',
    },
    sections: {
      account: 'Account',
      app: 'Application',
      support: 'Support',
    },
    menu: {
      profileInfo: 'Profile Information',
      profileInfoSub: 'Edit your personal information',
      changePassword: 'Change Password',
      changePasswordSub: 'Manage your account security',
      notifications: 'Notifications',
      notificationsSub: 'Set your notification preferences',
      appearance: 'Appearance',
      language: 'Language',
      sync: 'Data Sync',
      syncSub: 'Offline data settings',
      helpCenter: 'Help Center',
      createTicket: 'Create Support Ticket',
      terms: 'Terms of Use',
      privacy: 'Privacy Policy',
      logout: 'Logout',
    },
    modals: {
      profileTitle: 'Profile Information',
      passwordTitle: 'Change Password',
      notificationsTitle: 'Notification Settings',
      appearanceTitle: 'Appearance',
      languageTitle: 'Language Selection',
      syncTitle: 'Synchronization',
      supportTitle: 'Support Ticket',
    },
    fields: {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      email: 'Email',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
    },
    placeholders: {
      firstName: 'Your first name',
      lastName: 'Your last name',
      phone: 'Your phone number',
      currentPassword: 'Your current password',
      newPassword: 'Your new password',
      confirmPassword: 'Confirm your new password',
    },
    notifications: {
      channels: 'Notification Channels',
      push: 'Push Notifications',
      pushSub: 'App notifications',
      emailNotif: 'Email Notifications',
      emailSub: 'For important updates',
      sms: 'SMS Notifications',
      smsSub: 'For critical alerts',
      types: 'Notification Types',
      checklistReminder: 'Checklist Reminders',
      checklistReminderSub: 'Daily check notifications',
      jobUpdates: 'Job Updates',
      jobUpdatesSub: 'New jobs and changes',
      maintenanceAlerts: 'Maintenance Alerts',
      maintenanceAlertsSub: 'Upcoming maintenance notifications',
    },
    theme: {
      dark: 'Dark Theme',
      darkSub: 'Reduces eye strain',
      light: 'Light Theme',
      lightSub: 'Classic appearance',
      system: 'System Setting',
      systemSub: 'Based on device setting',
    },
    sync: {
      auto: 'Auto Sync',
      autoSub: 'Sync data automatically',
      wifiOnly: 'Wi-Fi Only',
      wifiOnlySub: 'Don\'t sync on mobile data',
      interval: 'Sync Interval',
      minutes: '{count} minutes',
      syncNow: 'Sync Now',
    },
    support: {
      subject: 'Subject',
      subjectPlaceholder: 'Briefly describe your issue or suggestion',
      message: 'Message',
      messagePlaceholder: 'Write detailed description...',
      alternativeContact: 'Alternative Contact',
      send: 'Send',
    },
    logout: {
      title: 'Logout',
      message: 'Are you sure you want to logout from your account?',
    },
    messages: {
      profileUpdated: 'Your profile has been updated',
      profileError: 'Failed to update profile',
      passwordChanged: 'Your password has been changed',
      passwordError: 'Failed to change password. Check your current password.',
      notificationsSaved: 'Notification preferences saved',
      settingsError: 'Failed to save settings',
      supportSent: 'Your support request has been sent. We will get back to you soon.',
      supportError: 'Failed to send request',
      pageError: 'Failed to open page',
      requiredFields: 'Please fill in all fields',
      passwordMismatch: 'New passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      nameRequired: 'First name and last name are required',
    },
    appInfo: {
      version: 'Smartop v1.0.0',
      copyright: '© 2024 Smartop Fleet Management',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'Login',
      email: 'Email',
      password: 'Password',
      submit: 'Login',
      forgotPassword: 'Forgot Password',
    },
    messages: {
      loginError: 'Login failed. Please check your email and password.',
    },
  },

  // Operators
  operators: {
    title: 'Team Management',
    subtitle: '{count} people listed',
    search: 'Search by name or email...',
    addNew: 'Add New Member',
    filter: {
      all: 'All',
      operators: 'Operators',
      managers: 'Managers',
    },
    role: {
      admin: 'Admin',
      manager: 'Manager',
      operator: 'Operator',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      total: 'Total',
    },
    detail: {
      info: 'Information',
      contact: 'Contact',
      licenses: 'Certifications',
      specialties: 'Specialties',
      assignedMachines: 'Assigned Machines',
      performance: 'Performance',
      noAssignedMachines: 'No assigned machines',
    },
    empty: {
      title: 'No Personnel Found',
      filtered: 'No users match search criteria',
      noOperators: 'No team members yet',
    },
    messages: {
      loadError: 'An error occurred while loading users',
      addSuccess: 'Personnel added',
      updateSuccess: 'Personnel updated',
      deleteSuccess: 'Personnel deleted',
    },
  },

  // Checklist Templates
  checklistTemplates: {
    title: 'Checklist Templates',
    addTemplate: 'New Template',
    editTemplate: 'Edit Template',
    items: 'items',
    form: {
      name: 'Template Name',
      namePlaceholder: 'E.g., Daily Inspection Checklist',
      description: 'Description',
      descriptionPlaceholder: 'Template description (optional)',
      items: 'Checklist Items',
      itemPlaceholder: 'Add new item...',
      noItems: 'No checklist items added yet',
    },
    confirmDelete: {
      title: 'Delete Template',
      message: 'Are you sure you want to delete this template? This action cannot be undone.',
    },
    empty: {
      title: 'No Templates Found',
      subtitle: 'No checklist templates created yet',
    },
    messages: {
      loadError: 'Failed to load templates',
      createSuccess: 'Template created',
      updateSuccess: 'Template updated',
      deleteSuccess: 'Template deleted',
      saveError: 'Failed to save template',
      deleteError: 'Failed to delete template',
      nameRequired: 'Template name is required',
      itemsRequired: 'Add at least one checklist item',
    },
  },
};

export type Translations = typeof tr;

const translations: Record<Language, Translations> = { tr, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@smartop_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && ['tr', 'en'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = translations[language];

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper function for string interpolation
export function interpolate(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
