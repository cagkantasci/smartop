# Push Notification Sistem Tanılaması

## 🔍 Sorun Analizi

Push bildirimi alamama sorununuz için sistemin tüm katmanlarını kontrol ettim.

---

## 📱 Sistem Mimarisi

```
Mobile App (React Native)
    ↓ FCM Token
Backend (NestJS)
    ↓ Firebase Admin SDK
Firebase Cloud Messaging (FCM)
    ↓ Push Notification
Mobile Device
```

---

## ✅ Mevcut Kod Durumu

### 1. Mobile App - Push Token Alma ✅

**Dosya:** `mobile/src/services/pushNotifications.ts`

Kod doğru kurulmuş:
- ✅ FCM token alma (satır 89-91)
- ✅ Expo token fallback (satır 96-99)
- ✅ Android notification channels (satır 110-163)
- ✅ Permission request (satır 73-76)
- ✅ Device registration API call (satır 222-245)

**Özellikler:**
- FCM token öncelikli (development builds için)
- Expo token fallback (Expo Go için)
- 5 farklı Android channel
- Foreground & background notification handling

### 2. Backend - Firebase Setup ✅

**Dosya:** `backend/src/modules/notifications/push-notification.service.ts`

Kod doğru kurulmuş:
- ✅ Firebase initialization (satır 43-81)
- ✅ Base64 & JSON support
- ✅ Device token registration (satır 90-116)
- ✅ Send notification method (satır 118-169)
- ✅ Batch sending support (satır 171-216)

**İzlenen Stratejiler:**
- Base64 encoded credentials (production için)
- Raw JSON (development için)
- Private key newline fix

---

## ❌ Olası Sorunlar ve Çözümleri

### **1. Firebase Credentials Eksik** 🔴 (EN YÜKSEK OLASILIK)

**Belirti:** Backend loglarında şu uyarı:
```
Firebase service account not configured. Push notifications disabled.
```

**Sorun:** `.env` dosyasında `FIREBASE_SERVICE_ACCOUNT` veya `FIREBASE_SERVICE_ACCOUNT_BASE64` yok.

**Çözüm:**

#### Adım 1: Firebase Projesi Oluştur
```
1. https://console.firebase.google.com/ adresine git
2. "Add Project" tıkla
3. Proje adı: "smartop-app" (veya istediğin isim)
4. Google Analytics: Opsiyonel
5. "Create Project" tıkla
```

#### Adım 2: Firebase Cloud Messaging Aktif Et
```
1. Sol menüden "Build" → "Cloud Messaging" seç
2. "Get Started" veya "Configure" tıkla
3. Cloud Messaging API'yi enable et
```

#### Adım 3: Service Account Key İndir
```
1. Project Settings (sol üst köşedeki çark ikonu)
2. "Service accounts" sekmesi
3. "Generate new private key" tıkla
4. JSON dosyasını indir (smartop-app-xxxxx.json)
```

#### Adım 4: Backend .env Dosyasına Ekle

**Yöntem A: Base64 (Önerilen - Production)**
```bash
# Linux/Mac
base64 -i smartop-app-xxxxx.json

# Windows PowerShell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("smartop-app-xxxxx.json"))

# .env dosyasına ekle:
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW5...
```

**Yöntem B: Raw JSON (Development)**
```bash
# JSON içeriğini tek satıra çevir ve .env'e ekle
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"smartop-app",...}
```

**NOT:** Private key içindeki `\n` karakterlerini escape et: `\\n`

#### Adım 5: Backend Restart
```bash
cd backend
npm run dev
```

Logda şunu görmeli:
```
[PushNotificationService] Firebase initialized successfully
```

---

### **2. FCM Token Alınamıyor** 🟡

**Belirti:** Mobile app loglarında:
```
Failed to get any push token: [Error]
```

**Sorunlar:**
- Emulator'da çalışıyorsun (fiziksel cihaz gerekir)
- Android/iOS permissions verilmemiş
- Expo Go kullanıyorsun ama FCM token alınmaya çalışılıyor

**Çözümler:**

#### Fiziksel Cihaz Kullan
```bash
# Emulator yerine fiziksel telefon
cd mobile
npx expo start
# QR kodu telefonla tara
```

#### Permission Check
```javascript
// Mobile app'de permission status kontrol et
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status);

// 'denied' ise:
const { status: newStatus } = await Notifications.requestPermissionsAsync();
```

#### Expo Go vs Development Build

**Expo Go kullanıyorsan:**
- Expo Push Token kullanılmalı
- Backend Firebase yerine Expo Push servisini kullanmalı
- **ÖNERİ:** Development build yap

**Development Build yap:**
```bash
cd mobile

# Android için
eas build --profile development --platform android

# Veya local build
npx expo prebuild
npx expo run:android
```

---

### **3. Token Backend'e Kaydedilmiyor** 🟡

**Belirti:** Token alınıyor ama backend'e gönderilmiyor

**Kontrol Et:**

#### Mobile App'de Debug
```javascript
// App.tsx veya ana component'inde
import { pushNotificationService } from './src/services/pushNotifications';

useEffect(() => {
  const setupPush = async () => {
    await pushNotificationService.init();

    const token = pushNotificationService.getExpoPushToken();
    console.log('🔔 Push Token:', token);

    const registered = await pushNotificationService.registerDeviceWithServer();
    console.log('✅ Device registered:', registered);
  };

  setupPush();
}, []);
```

#### Backend'de Debug
```typescript
// backend/src/modules/notifications/notifications.controller.ts
@Post('device')
async registerDevice(@Body() dto: any, @CurrentUser() user: any) {
  console.log('📱 Device registration request:', {
    userId: user.id,
    platform: dto.platform,
    token: dto.token?.substring(0, 50) + '...',
  });

  return this.pushService.registerDevice(user.id, dto);
}
```

---

### **4. Notification Gönderilmiyor** 🟡

**Belirti:** Token kayıtlı ama notification gelmiyor

**Test Et:**

#### Test Notification Gönder
```bash
# Backend endpoint'inden test
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Manuel Test (Firebase Console)
```
1. Firebase Console → Cloud Messaging
2. "Send your first message"
3. Notification title & body gir
4. "Send test message" tıkla
5. FCM token'ı yapıştır
```

#### Backend Log Kontrol
```typescript
// Backend'de notification gönderilirken:
@Post('test')
async sendTestNotification(@CurrentUser() user: any) {
  console.log('🔔 Sending test notification to user:', user.id);

  const result = await this.pushService.sendToUser(
    user.id,
    {
      title: 'Test Bildirimi',
      body: 'Push notifications çalışıyor!',
      data: { type: 'test' },
    }
  );

  console.log('📤 Send result:', result);
  return result;
}
```

---

### **5. Mobile App'de Notification Görünmüyor** 🟢

**Belirti:** Backend gönderdi ama telefonun görmedi

**Kontroller:**

#### Android Notification Permissions
```
Settings → Apps → Smartop → Notifications → Aktif olmalı
```

#### iOS Notification Settings
```
Settings → Notifications → Smartop → Allow Notifications: ON
```

#### Foreground Notification Handler
```javascript
// Mobile app'de listener var mı kontrol et
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // ✅ Mutlaka true
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

---

## 🛠️ Debugging Checklist

### Backend Kontrolleri

- [ ] `.env` dosyasında `FIREBASE_SERVICE_ACCOUNT` var mı?
- [ ] Backend başlarken "Firebase initialized" logu var mı?
- [ ] `POST /api/notifications/device` endpoint çalışıyor mu?
- [ ] Database'de `DeviceToken` tablosu var mı ve tokenler kaydediliyor mu?

```sql
-- Prisma Studio ile kontrol et
SELECT * FROM "DeviceToken" WHERE "isActive" = true;
```

### Mobile App Kontrolleri

- [ ] Fiziksel cihazda mı test ediyorsun? (Emulator'da push çalışmaz)
- [ ] Notification permission verildi mi?
- [ ] `pushNotificationService.init()` çağrılıyor mu?
- [ ] Token başarıyla alınıyor mu? (Console loglarını kontrol et)
- [ ] `registerDeviceWithServer()` çağrılıyor ve başarılı mı?

### Network Kontrolleri

- [ ] Mobile app backend API'ye erişebiliyor mu?
- [ ] Firebase Cloud Messaging API enable mi?
- [ ] Backend internet'e çıkabiliyor mu? (Firebase'e erişim için)

---

## 🚀 Hızlı Test Senaryosu

### Adım 1: Firebase Setup (5 dakika)
```
1. Firebase Console'a git
2. Yeni proje oluştur
3. Service account key indir
4. Backend .env'e ekle
5. Backend restart
```

### Adım 2: Mobile Token Al (2 dakika)
```javascript
// App.tsx'e ekle
useEffect(() => {
  pushNotificationService.init().then(() => {
    const token = pushNotificationService.getExpoPushToken();
    console.log('🔔 TOKEN:', token);

    pushNotificationService.registerDeviceWithServer().then(() => {
      console.log('✅ Registered!');
    });
  });
}, []);
```

### Adım 3: Test Notification Gönder (1 dakika)
```javascript
// Settings ekranına test butonu ekle
const sendTest = async () => {
  await usePushNotifications().sendTestNotification();
  alert('Local notification gönderildi!');
};
```

### Adım 4: Backend'den Test (1 dakika)
```bash
# API'den test notification endpoint'i çağır
POST /api/notifications/test
```

---

## 📋 En Muhtemel Sorun Senaryoları

### Senaryo 1: Firebase Kurulmamış (90% olasılık)
```
Belirti: Backend'de uyarı, notification hiç gönderilmiyor
Çözüm: Firebase Console'dan service account key al, .env'e ekle
Süre: 10 dakika
```

### Senaryo 2: Expo Go Kullanılıyor (70% olasılık)
```
Belirti: Token alınıyor ama notification gelmiyor
Çözüm: Development build yap veya Expo Push servisine geç
Süre: 30 dakika (development build) veya 5 dakika (expo push)
```

### Senaryo 3: Token Kaydedilmiyor (50% olasılık)
```
Belirti: Token alınıyor ama backend'de yok
Çözüm: registerDeviceWithServer() çağrılmıyormu kontrol et
Süre: 5 dakika
```

### Senaryo 4: Permission Verilmemiş (30% olasılık)
```
Belirti: Token alınamıyor, permission denied
Çözüm: App'i sil, tekrar yükle, permission iste
Süre: 2 dakika
```

---

## 🎯 Hemen Yapılacaklar

### 1. Backend .env Kontrol
```bash
cd backend
cat .env | grep FIREBASE
```

Çıktı olmalı:
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...
# VEYA
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlI...
```

Yoksa Firebase setup yap!

### 2. Backend Log Kontrol
```bash
cd backend
npm run dev
```

Görmeli:
```
[PushNotificationService] Firebase initialized successfully
```

Görmüyorsan Firebase credentials eksik!

### 3. Mobile Log Kontrol
```bash
cd mobile
npx expo start
```

Console'da görmeli:
```
🔔 Push token: ExponentPushToken[xxxxx]
# VEYA
🔔 FCM Token obtained: xxxxx...
✅ Device registered with server: android
```

Görmüyorsan init() çağrılmıyor!

---

## 📞 Destek Bilgileri

Sorunu çözmek için:

1. **Backend logs:** `npm run dev` çıktısını kontrol et
2. **Mobile logs:** Expo console çıktısını kontrol et
3. **Database:** Prisma Studio ile `DeviceToken` tablosunu kontrol et
4. **Firebase Console:** Cloud Messaging aktif mi kontrol et

En önemli soru: **Backend .env dosyasında Firebase credentials var mı?**

Büyük ihtimalle sorun bu! 🎯
