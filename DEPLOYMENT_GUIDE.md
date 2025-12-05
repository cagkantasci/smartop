# Smartop Kurulum ve Deployment Rehberi

Bu rehber, Smartop ağır ekipman yönetim platformunun sıfırdan kurulumu ve deployment sürecini adım adım açıklamaktadır.

## İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Hızlı Başlangıç (Docker ile)](#hızlı-başlangıç-docker-ile)
4. [Manuel Kurulum](#manuel-kurulum)
5. [Firebase Push Notifications Kurulumu](#firebase-push-notifications-kurulumu)
6. [Ortam Değişkenleri Detaylı Açıklama](#ortam-değişkenleri-detaylı-açıklama)
7. [Database Kurulumu ve Migrations](#database-kurulumu-ve-migrations)
8. [Production Deployment](#production-deployment)
9. [Mobil Uygulama Kurulumu](#mobil-uygulama-kurulumu)
10. [Sorun Giderme](#sorun-giderme)

---

## Sistem Gereksinimleri

### Minimum Gereksinimler

- **Node.js**: v20.x veya üzeri
- **PostgreSQL**: v16 veya üzeri
- **Redis**: v7.x (opsiyonel, cache için)
- **RAM**: En az 4GB (Development için), 8GB+ (Production için)
- **Disk**: En az 10GB boş alan
- **İşletim Sistemi**: Windows 10/11, macOS, Linux (Ubuntu 20.04+)

### Önerilen Gereksinimler

- **Node.js**: v20.x LTS
- **PostgreSQL**: v16.x
- **Redis**: v7.x
- **RAM**: 8GB+
- **Disk**: 20GB+ SSD
- **Docker** (opsiyonel): v24.x veya üzeri
- **Docker Compose**: v2.x veya üzeri

---

## Teknoloji Stack

### Backend
- **Framework**: NestJS v11.x
- **ORM**: Prisma v7.x
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT + Passport
- **File Storage**: AWS S3 / Cloudflare R2
- **Email**: SMTP / SendGrid
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Real-time**: Socket.IO
- **API Documentation**: Swagger (OpenAPI)

### Frontend (Web)
- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Maps**: React Leaflet
- **UI**: Lucide Icons, Framer Motion

### Mobile (Expo/React Native)
- **Framework**: React Native 0.81.x
- **Platform**: Expo ~54.x
- **Navigation**: React Navigation v7
- **State Management**: Zustand
- **Maps**: React Native Maps
- **Notifications**: Expo Notifications
- **Storage**: Expo Secure Store

---

## Hızlı Başlangıç (Docker ile)

Docker kullanarak en hızlı şekilde projeyi ayağa kaldırabilirsiniz.

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/yourusername/smartop.git
cd smartop
```

### 2. Ortam Değişkenlerini Ayarlayın

Backend için `.env` dosyası oluşturun:

```bash
cd backend
cp .env.example .env
```

`.env` dosyasını düzenleyin (en azından `JWT_SECRET` değiştirin):

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/smartop?schema=public"
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Docker Compose ile Başlatın

```bash
cd ..  # Ana dizine dönün
docker-compose up -d
```

Bu komut şunları başlatır:
- PostgreSQL veritabanı (port 5432)
- Redis cache (port 6379)
- Backend API (port 3000)
- Adminer database GUI (port 8080)

### 4. Database Migration'ları Çalıştırın

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed  # Örnek data ekler
```

### 5. Frontend'i Başlatın

```bash
cd ../frontend
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacaktır.

### 6. Tarayıcıda Açın

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api
- **Database GUI (Adminer)**: http://localhost:8080

---

## Manuel Kurulum

Docker kullanmak istemiyorsanız, manuel kurulum yapabilirsiniz.

### 1. PostgreSQL Kurulumu

#### Windows

1. [PostgreSQL Windows Installer](https://www.postgresql.org/download/windows/) indirin
2. Installer'ı çalıştırın ve kurulum adımlarını takip edin
3. Şifre belirleyin (örnek: `postgres`)
4. Port olarak `5432` seçin

#### macOS

```bash
# Homebrew ile
brew install postgresql@16
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Database Oluşturma

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Database oluşturun
CREATE DATABASE smartop;

# Çıkış
\q
```

### 2. Redis Kurulumu (Opsiyonel)

#### Windows

[Redis for Windows](https://github.com/microsoftarchive/redis/releases) indirin veya Docker kullanın:

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. Node.js Kurulumu

[Node.js LTS](https://nodejs.org/) sürümünü indirin ve kurun (v20.x önerilir).

Kurulumu kontrol edin:

```bash
node --version  # v20.x.x olmalı
npm --version   # v9.x.x veya üzeri
```

### 4. Backend Kurulumu

```bash
cd backend
npm install
```

### 5. Ortam Değişkenlerini Ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartop?schema=public"

# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# JWT (ÖNEMLİ: Production'da mutlaka değiştirin!)
JWT_SECRET=super-gizli-anahtar-buraya-rastgele-karakter-dizisi
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis (Opsiyonel)
REDIS_URL=redis://localhost:6379
```

### 6. Database Migration ve Seed

```bash
# Prisma client oluştur
npm run prisma:generate

# Migration'ları çalıştır (database şemasını oluştur)
npm run prisma:migrate

# Örnek data ekle
npm run prisma:seed
```

### 7. Backend'i Başlatın

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Backend http://localhost:3000 adresinde çalışacaktır.

### 8. Frontend Kurulumu

```bash
cd ../frontend
npm install
```

### 9. Frontend'i Başlatın

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

Frontend http://localhost:5173 adresinde çalışacaktır.

---

## Firebase Push Notifications Kurulumu

Mobil uygulama için push notification'lar Firebase Cloud Messaging (FCM) kullanır.

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" veya "Proje ekle" butonuna tıklayın
3. Proje adı girin: `smartop-app` (veya istediğiniz bir isim)
4. Google Analytics'i etkinleştirin (opsiyonel)
5. Projeyi oluşturun

### 2. Firebase Cloud Messaging (FCM) Etkinleştirme

1. Firebase projenizde sol menüden **Build** > **Cloud Messaging** seçin
2. "Get started" veya "Başla" butonuna tıklayın
3. Varsayılan ayarları kabul edin

### 3. Service Account Key Oluşturma (Backend için)

1. Firebase projenizde sağ üstteki ⚙️ (Settings) ikonuna tıklayın
2. **Project Settings** > **Service accounts** sekmesine gidin
3. "Generate new private key" butonuna tıklayın
4. JSON dosyasını indirin (örnek: `smartop-app-firebase-adminsdk.json`)

**ÖNEMLİ**: Bu dosyayı güvenli bir yerde saklayın ve asla Git'e commit etmeyin!

### 4. Backend'e Firebase Yapılandırması

İndirdiğiniz JSON dosyasını açın. İçeriği tek satıra çevirerek backend `.env` dosyasına ekleyin:

```bash
# Örnek Firebase Service Account JSON
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"smartop-app","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...","client_email":"firebase-adminsdk-xxx@smartop-app.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40smartop-app.iam.gserviceaccount.com"}
```

**Not**: JSON'u tek satıra dönüştürürken yeni satır karakterlerini (`\n`) koruyun.

**Alternatif Yöntem**: JSON dosyasını `backend/config/firebase-adminsdk.json` olarak kaydedin ve kodda şöyle kullanın:

```typescript
// backend/src/modules/notifications/push-notification.service.ts içinde
const serviceAccount = require('../../../config/firebase-adminsdk.json');
```

### 5. Mobil Uygulama için Firebase Yapılandırması

#### Android Kurulumu

1. Firebase Console'da projenize gidin
2. "Add app" > "Android" seçin
3. **Android package name**: `com.smartop.mobile` (app.json'daki ile aynı olmalı)
4. "Register app" butonuna tıklayın
5. `google-services.json` dosyasını indirin
6. Dosyayı `mobile/` dizinine kopyalayın

#### iOS Kurulumu

1. Firebase Console'da projenize gidin
2. "Add app" > "iOS" seçin
3. **iOS bundle ID**: `com.smartop.mobile`
4. "Register app" butonuna tıklayın
5. `GoogleService-Info.plist` dosyasını indirin
6. Dosyayı `mobile/` dizinine kopyalayın

### 6. Expo Project ID Alma

1. [Expo.dev](https://expo.dev) hesabı oluşturun (ücretsiz)
2. Yeni bir proje oluşturun veya mevcut projeyi bağlayın
3. Project ID'yi alın (örnek: `@kullanici-adi/smartop`)

Mobil uygulamada `.env` dosyası oluşturun:

```bash
cd mobile
echo "EXPO_PUBLIC_PROJECT_ID=@kullanici-adi/smartop" > .env
```

### 7. Push Notification Test

Backend'i başlattıktan sonra test için:

```bash
# Backend loglarını kontrol edin
# Şunu görmelisiniz:
# [PushNotificationService] Firebase Admin SDK initialized successfully
```

Mobil uygulamada notification permissions istenir ve token otomatik oluşturulur.

---

## Ortam Değişkenleri Detaylı Açıklama

### Backend `.env` Dosyası

```env
# ===========================================
# DATABASE (Zorunlu)
# ===========================================
DATABASE_URL="postgresql://kullanici:sifre@host:port/veritabani?schema=public"
# Örnek: postgresql://postgres:postgres@localhost:5432/smartop?schema=public

# ===========================================
# APPLICATION (Zorunlu)
# ===========================================
NODE_ENV=development           # development | production | test
PORT=3000                       # Backend API port
CORS_ORIGIN=http://localhost:5173  # Frontend URL'i

# ===========================================
# JWT AUTH (Zorunlu)
# ===========================================
JWT_SECRET=en-az-32-karakter-uzunlugunda-rastgele-gizli-anahtar
JWT_EXPIRES_IN=15m              # Access token süresi (15 dakika)
REFRESH_TOKEN_EXPIRES_IN=7d    # Refresh token süresi (7 gün)

# JWT_SECRET için güçlü bir değer oluşturmak:
# Node.js ile: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ===========================================
# REDIS (Opsiyonel - Cache için)
# ===========================================
REDIS_URL=redis://localhost:6379
# Docker kullanıyorsanız: redis://redis:6379

# ===========================================
# FILE STORAGE - AWS S3 veya Cloudflare R2
# (Dosya yükleme özelliği için gerekli)
# ===========================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-central-1
S3_BUCKET=smartop-uploads
S3_PUBLIC_URL=https://smartop-uploads.s3.eu-central-1.amazonaws.com

# Cloudflare R2 kullanıyorsanız:
# S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com

# ===========================================
# EMAIL - SMTP / SendGrid
# (Email bildirimleri için gerekli)
# ===========================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@smartop.com

# Gmail kullanıyorsanız:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password  # 2FA etkinse app password gerekli

# ===========================================
# FIREBASE (Push Notifications için)
# ===========================================
# JSON formatında service account
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# ===========================================
# AI - Google Gemini (Opsiyonel)
# ===========================================
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend `.env` Dosyası (Opsiyonel)

```env
# Gemini AI kullanıyorsanız
GEMINI_API_KEY=your-gemini-api-key
```

### Mobile `.env` Dosyası

```env
# Expo Project ID
EXPO_PUBLIC_PROJECT_ID=@kullanici-adi/smartop

# Backend API URL (production için)
EXPO_PUBLIC_API_URL=https://api.smartop.com
```

---

## Database Kurulumu ve Migrations

### Prisma Schema Hakkında

Smartop, veritabanı yönetimi için Prisma ORM kullanır. Schema dosyası `backend/prisma/schema.prisma` konumundadır.

### Migration İşlemleri

#### 1. Yeni Bir Database Oluşturma

```bash
cd backend

# Prisma client oluştur
npm run prisma:generate

# Migration'ları çalıştır (database tablolarını oluşturur)
npm run prisma:migrate

# İsim istediğinde anlamlı bir isim verin, örnek: "init"
```

#### 2. Seed Data (Örnek Veriler) Ekleme

```bash
npm run prisma:seed
```

Bu komut şunları ekler:
- Demo organizasyon
- Admin, manager ve operator kullanıcıları
- Örnek makineler
- Örnek checklist'ler

**Varsayılan Kullanıcılar**:
- **Admin**: `admin@smartop.com` / `password123`
- **Manager**: `manager@smartop.com` / `password123`
- **Operator**: `operator@smartop.com` / `password123`

#### 3. Schema Değişikliklerini Uygulama

Schema'da değişiklik yaptıysanız:

```bash
# Migration oluştur
npm run prisma:migrate

# Veya development'ta
npm run prisma:migrate:dev
```

#### 4. Production'da Migration

```bash
# Production migration (geri alınamaz!)
npm run prisma:migrate:prod
```

#### 5. Database Studio (GUI)

Prisma Studio ile veritabanını görsel olarak yönetin:

```bash
npm run prisma:studio
```

Tarayıcıda http://localhost:5555 açılacaktır.

### Database Backup

#### PostgreSQL Backup

```bash
# Backup alma
pg_dump -U postgres -d smartop -F c -f smartop_backup_$(date +%Y%m%d).dump

# Backup'ı geri yükleme
pg_restore -U postgres -d smartop -v smartop_backup_20240115.dump
```

#### Docker ile Backup

```bash
# Container'dan backup
docker exec smartop-postgres pg_dump -U postgres smartop > backup.sql

# Backup'ı geri yükleme
docker exec -i smartop-postgres psql -U postgres smartop < backup.sql
```

---

## Production Deployment

### 1. Sunucu Gereksinimleri

**Minimum**:
- 2 CPU cores
- 4GB RAM
- 20GB SSD
- Ubuntu 20.04+ veya Debian 11+

**Önerilen**:
- 4 CPU cores
- 8GB RAM
- 50GB SSD

### 2. Sunucu Hazırlığı

```bash
# Sistemi güncelleyin
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri kurun
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Node.js 20.x kurun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (Process Manager) kurun
sudo npm install -g pm2

# PostgreSQL 16 kurun
sudo apt install -y postgresql-16 postgresql-contrib

# Redis kurun
sudo apt install -y redis-server
```

### 3. Database Kurulumu

```bash
# PostgreSQL'e geçin
sudo -u postgres psql

# Production database oluşturun
CREATE DATABASE smartop_production;

# Güçlü bir şifre ile kullanıcı oluşturun
CREATE USER smartop_user WITH ENCRYPTED PASSWORD 'super-guclu-sifre-buraya';

# İzinleri verin
GRANT ALL PRIVILEGES ON DATABASE smartop_production TO smartop_user;

# Çıkış
\q
```

### 4. Uygulama Deployment

```bash
# Uygulama dizini oluşturun
sudo mkdir -p /var/www/smartop
sudo chown -R $USER:$USER /var/www/smartop

# Repository'yi klonlayın
cd /var/www/smartop
git clone https://github.com/yourusername/smartop.git .

# Backend kurulumu
cd backend
npm ci --production
npm run build

# .env dosyasını oluşturun (güvenli bir şekilde)
nano .env
# Production değerlerini girin!

# Migration'ları çalıştırın
npm run prisma:migrate:prod

# PM2 ile backend başlatın
pm2 start dist/main.js --name smartop-backend

# PM2'yi başlangıçta otomatik başlat
pm2 startup
pm2 save
```

### 5. Frontend Build ve Deployment

```bash
cd /var/www/smartop/frontend

# Bağımlılıkları kurun
npm ci

# Production build
npm run build

# Build dosyaları dist/ klasöründe oluşur
```

### 6. Nginx Yapılandırması

```bash
sudo nano /etc/nginx/sites-available/smartop
```

Aşağıdaki yapılandırmayı ekleyin:

```nginx
# Backend API
server {
    listen 80;
    server_name api.smartop.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

# Frontend
server {
    listen 80;
    server_name smartop.com www.smartop.com;

    root /var/www/smartop/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Yapılandırmayı etkinleştirin:

```bash
# Symlink oluşturun
sudo ln -s /etc/nginx/sites-available/smartop /etc/nginx/sites-enabled/

# Nginx yapılandırmasını test edin
sudo nginx -t

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
```

### 7. SSL Certificate (HTTPS)

```bash
# Let's Encrypt ile ücretsiz SSL
sudo certbot --nginx -d smartop.com -d www.smartop.com -d api.smartop.com

# Otomatik yenileme için
sudo certbot renew --dry-run
```

### 8. Firewall Ayarları

```bash
# UFW firewall kurun
sudo apt install -y ufw

# SSH, HTTP, HTTPS portlarını açın
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'ı etkinleştirin
sudo ufw enable

# Durumu kontrol edin
sudo ufw status
```

### 9. Monitoring ve Logs

```bash
# PM2 log'ları
pm2 logs smartop-backend

# Nginx log'ları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Sistem resource'ları
pm2 monit
```

### 10. Otomatik Backup Script

```bash
# Backup scripti oluşturun
sudo nano /usr/local/bin/smartop-backup.sh
```

Script içeriği:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/smartop"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup dizini oluştur
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U smartop_user smartop_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Eski backup'ları sil (30 günden eski)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Çalıştırılabilir yapın:

```bash
sudo chmod +x /usr/local/bin/smartop-backup.sh
```

Cron job ekleyin (her gece saat 2'de):

```bash
sudo crontab -e

# Şunu ekleyin:
0 2 * * * /usr/local/bin/smartop-backup.sh >> /var/log/smartop-backup.log 2>&1
```

---

## Mobil Uygulama Kurulumu

### Development (Geliştirme)

#### 1. Expo CLI Kurulumu

```bash
npm install -g expo-cli
```

#### 2. Mobil App Bağımlıklarını Kurun

```bash
cd mobile
npm install
```

#### 3. Expo Hesabı Oluşturun

```bash
expo login
```

veya [expo.dev](https://expo.dev) üzerinden hesap oluşturun.

#### 4. Uygulamayı Başlatın

```bash
# Tüm platformlar için
npm start

# Sadece Android
npm run android

# Sadece iOS (macOS gerekli)
npm run ios
```

#### 5. Telefonunuzda Test Edin

1. **Android**: Google Play Store'dan "Expo Go" uygulamasını indirin
2. **iOS**: App Store'dan "Expo Go" uygulamasını indirin
3. Expo Go'yu açın ve QR kodu tarayın

### Production Build

#### Android APK/AAB Build

```bash
# EAS CLI kurun
npm install -g eas-cli

# EAS hesabına giriş yapın
eas login

# Build yapılandırması oluşturun
eas build:configure

# APK build (test için)
eas build --platform android --profile preview

# AAB build (Google Play için)
eas build --platform android --profile production
```

#### iOS Build (macOS gerekli)

```bash
# iOS build
eas build --platform ios --profile production

# Apple Developer hesabı gereklidir
```

#### Build İndirme

Build tamamlandığında Expo Dashboard'dan indirin:
https://expo.dev/accounts/[kullanici-adi]/projects/smartop/builds

### Google Play Store'a Yükleme

1. [Google Play Console](https://play.google.com/console) hesabı oluşturun ($25 tek seferlik ücret)
2. Yeni uygulama oluşturun
3. AAB dosyasını yükleyin
4. Mağaza listesi bilgilerini girin
5. İçerik derecelendirmesi alın
6. Test ve yayınlayın

### Apple App Store'a Yükleme

1. [Apple Developer Program](https://developer.apple.com/programs/) üyeliği ($99/yıl)
2. App Store Connect'te uygulama oluşturun
3. IPA dosyasını yükleyin
4. App Store bilgilerini girin
5. İnceleme için gönderin

---

## Sorun Giderme

### Backend Sorunları

#### Problem: Database bağlantısı başarısız

```bash
# PostgreSQL çalışıyor mu kontrol edin
sudo systemctl status postgresql

# PostgreSQL'i başlatın
sudo systemctl start postgresql

# Connection string'i kontrol edin
# .env dosyasındaki DATABASE_URL doğru mu?
```

#### Problem: "Port 3000 already in use"

```bash
# Port 3000'i kullanan process'i bulun
lsof -i :3000

# veya Windows'ta
netstat -ano | findstr :3000

# Process'i sonlandırın
kill -9 <PID>

# veya Windows'ta
taskkill /PID <PID> /F
```

#### Problem: Prisma migration hatası

```bash
# Prisma client'ı yeniden oluşturun
npm run prisma:generate

# Database'i sıfırlayın (DİKKAT: Tüm data silinir!)
npx prisma migrate reset

# Migration'ları yeniden çalıştırın
npm run prisma:migrate
```

#### Problem: Firebase initialization failed

- `FIREBASE_SERVICE_ACCOUNT` environment variable'ı doğru formatta mı?
- JSON tek satırda ve escape edilmiş mi?
- Firebase console'da Cloud Messaging etkin mi?

```bash
# Test için Firebase yapılandırmasını kontrol edin
node -e "console.log(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))"
```

### Frontend Sorunları

#### Problem: API istekleri başarısız

- Backend çalışıyor mu? (`http://localhost:3000` açılıyor mu?)
- CORS ayarları doğru mu? (Backend `.env`'de `CORS_ORIGIN=http://localhost:5173`)
- vite.config.ts'deki proxy ayarları doğru mu?

```bash
# Backend'i kontrol edin
curl http://localhost:3000/api/health

# veya
curl http://localhost:3000
```

#### Problem: Build hatası

```bash
# node_modules'ı temizleyin
rm -rf node_modules package-lock.json
npm install

# Cache'i temizleyin
npm run build -- --force
```

### Mobil Uygulama Sorunları

#### Problem: Expo Go'da uygulama açılmıyor

```bash
# Expo cache'i temizleyin
expo start -c

# node_modules'ı yeniden yükleyin
rm -rf node_modules
npm install
```

#### Problem: Push notifications çalışmıyor

- Fiziksel cihaz kullanıyor musunuz? (Emülatörde push notification çalışmaz)
- Notification izinlerini verdiniz mi?
- Firebase yapılandırması doğru mu? (`google-services.json` / `GoogleService-Info.plist`)
- Backend'de Firebase initialized edildi mi?

```bash
# Mobil app loglarını kontrol edin
# Metro bundler'da "Push token:" görüyor musunuz?
```

#### Problem: Maps görünmüyor

- Internet bağlantısı var mı?
- Location permissions verildi mi?
- API keys doğru mu?

### Database Sorunları

#### Problem: Prisma timeout hatası

```bash
# PostgreSQL max connections artırın
sudo nano /etc/postgresql/16/main/postgresql.conf

# max_connections değerini artırın:
max_connections = 200

# PostgreSQL'i yeniden başlatın
sudo systemctl restart postgresql
```

#### Problem: Disk dolu

```bash
# Disk kullanımını kontrol edin
df -h

# PostgreSQL log'larını temizleyin
sudo find /var/log/postgresql -name "*.log" -mtime +30 -delete

# Eski backup'ları silin
sudo find /var/backups -name "*.dump" -mtime +30 -delete
```

### Production Sorunları

#### Problem: PM2 process crash oluyor

```bash
# Log'ları kontrol edin
pm2 logs smartop-backend --lines 100

# Process'i restart edin
pm2 restart smartop-backend

# Memory kullanımını kontrol edin
pm2 monit
```

#### Problem: Nginx 502 Bad Gateway

```bash
# Backend çalışıyor mu?
pm2 status

# Nginx error log'ları
sudo tail -f /var/log/nginx/error.log

# Backend'i restart edin
pm2 restart smartop-backend
```

#### Problem: SSL certificate sorunu

```bash
# Certificate'i yenileyin
sudo certbot renew

# Nginx'i restart edin
sudo systemctl restart nginx

# Certificate durumunu kontrol edin
sudo certbot certificates
```

### Performans Sorunları

#### Problem: API yanıt süreleri yavaş

```bash
# Database indexlerini kontrol edin
npm run prisma:studio

# Database query'lerini optimize edin
# Backend log'larında "slow query" arayin

# Redis cache'i etkinleştirin
# .env'de REDIS_URL ayarlı mı?
```

#### Problem: Frontend yükleme yavaş

```bash
# Production build yapın
npm run build

# Build size'ı kontrol edin
ls -lh dist/assets

# Code splitting ve lazy loading ekleyin
# Resim optimizasyonu yapın
```

---

## Güvenlik En İyi Uygulamaları

### 1. Environment Variables

- **.env dosyasını asla Git'e commit etmeyin**
- Production'da güçlü şifreler kullanın
- `JWT_SECRET` en az 32 karakter olmalı
- API anahtarlarını güvenli saklayın

### 2. Database

- Database kullanıcısına minimum yetkiler verin
- Düzenli backup alın
- SSL/TLS ile şifreli bağlantı kullanın
- SQL injection'a karşı Prisma ORM kullanın (güvenli)

### 3. API

- Rate limiting etkinleştirin (NestJS Throttler)
- CORS'u production domain'e kısıtlayın
- Input validation kullanın (class-validator)
- JWT token'larını güvenli saklayın

### 4. Server

- Firewall kurun (UFW)
- SSH için key-based authentication kullanın
- Düzenli sistem güncellemeleri yapın
- Fail2ban kurun (brute force koruması)

### 5. Monitoring

- Log dosyalarını düzenli kontrol edin
- Error tracking ekleyin (Sentry gibi)
- Uptime monitoring kurun
- Resource kullanımını izleyin

---

## Ek Kaynaklar

### Dokümantasyon

- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **React**: https://react.dev
- **Expo**: https://docs.expo.dev
- **Firebase**: https://firebase.google.com/docs

### Faydalı Komutlar

```bash
# Backend
npm run start:dev          # Development mode
npm run build              # Production build
npm run prisma:studio      # Database GUI
npm run prisma:migrate     # Run migrations

# Frontend
npm run dev                # Development server
npm run build              # Production build
npm run preview            # Preview production build

# Mobile
npm start                  # Start Expo
npm run android            # Android build
npm run ios                # iOS build

# Docker
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
```

### Support

Sorun yaşarsanız:

1. Bu dokümandaki sorun giderme bölümünü kontrol edin
2. GitHub Issues'a bakın
3. Yeni issue açın (detaylı açıklama ile)

---

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Güncellenme**: {{ CURRENT_DATE }}
**Versiyon**: 1.0.0
**Hazırlayan**: Smartop Team

---

## Hızlı Referans Kartı

### Port'lar
- Frontend: 5173
- Backend: 3000
- PostgreSQL: 5432
- Redis: 6379
- Adminer: 8080
- Prisma Studio: 5555

### Varsayılan Kullanıcılar (Seed sonrası)
- Admin: admin@smartop.com / password123
- Manager: manager@smartop.com / password123
- Operator: operator@smartop.com / password123

### Önemli Dizinler
- Backend: `./backend`
- Frontend: `./frontend`
- Mobile: `./mobile`
- Prisma Schema: `./backend/prisma/schema.prisma`
- Docker Config: `./docker-compose.yml`

### Sık Kullanılan Komutlar
```bash
# Tüm servisleri başlat
docker-compose up -d

# Backend dev
cd backend && npm run start:dev

# Frontend dev
cd frontend && npm run dev

# Mobil dev
cd mobile && npm start

# Database migrate
cd backend && npm run prisma:migrate

# Database seed
cd backend && npm run prisma:seed
```
