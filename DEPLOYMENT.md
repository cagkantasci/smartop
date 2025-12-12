# Smartop Deployment Guide (Coolify + Hostinger VPS)

Bu kılavuz, Smartop uygulamasını Hostinger VPS üzerinde Coolify ile deploy etmek için adım adım talimatları içerir.

## Ön Gereksinimler

- [x] Hostinger VPS (Ubuntu 22.04+ önerilir)
- [x] Coolify kurulu ve çalışır durumda
- [x] Domain adı: `smartop.com.tr`
- [x] Firebase projesi (push notifications için)
- [x] Git repository (GitHub/GitLab)

## 1. Repository'yi Coolify'a Bağlama

### GitHub Repository Oluşturma (eğer yoksa)

```bash
# Projeyi git'e ekle
cd smartop
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/smartop.git
git push -u origin main
```

### Coolify'da Yeni Proje Oluşturma

1. Coolify Dashboard'a giriş yap
2. **"Add New Resource"** → **"Docker Compose"** seç
3. Repository URL'ini ekle
4. Branch olarak `main` seç
5. Compose file olarak `docker-compose.prod.yml` belirt

## 2. Environment Variables Ayarlama

Coolify'da **Environment Variables** sekmesine git ve aşağıdaki değişkenleri ekle:

### Zorunlu Değişkenler

```env
# Database
POSTGRES_USER=smartop
POSTGRES_PASSWORD=<güçlü-şifre-oluştur>
POSTGRES_DB=smartop

# JWT Authentication (openssl rand -base64 64 ile oluştur)
JWT_SECRET=<64-karakter-random-string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://smartop.com.tr

# Firebase Push Notifications
FIREBASE_SERVICE_ACCOUNT=<firebase-service-account-json>
```

### Firebase Service Account Alma

1. [Firebase Console](https://console.firebase.google.com/) → Projeniz → Project Settings
2. **Service Accounts** sekmesi → **Generate New Private Key**
3. JSON dosyasını indirin
4. JSON'u tek satır haline getirin (newline'ları `\\n` ile değiştirin)
5. Coolify'a yapıştırın

```bash
# JSON'u tek satır yapmak için:
cat firebase-key.json | jq -c . | sed 's/\\n/\\\\n/g'
```

### Opsiyonel Değişkenler

```env
# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com

# S3/Cloudflare R2 (dosya yükleme için)
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=eu-central-1
S3_BUCKET=smartop-uploads
# R2 için:
# S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

## 3. Domain ve SSL Ayarları

### Coolify'da Domain Ekleme

1. Proje ayarlarında **Domains** sekmesine git
2. Domain ekle: `smartop.com.tr`
3. **Generate SSL Certificate** butonuna tıkla (Let's Encrypt)

### DNS Ayarları (Hostinger/Cloudflare)

Domain sağlayıcınızda A Record ekleyin:

```
Type: A
Name: @ (ana domain için)
Value: <VPS-IP-Adresi>
TTL: Auto

# www subdomain (opsiyonel)
Type: CNAME
Name: www
Value: smartop.com.tr
TTL: Auto
```

## 4. Deploy Etme

### İlk Deploy

1. Coolify'da **Deploy** butonuna tıkla
2. Build loglarını takip et
3. Hata varsa logları kontrol et

### Otomatik Deploy (CI/CD)

Coolify otomatik olarak GitHub webhook'ları ayarlar. Her push'ta:
- main branch'e push → production deploy

## 5. Mobil Uygulama Yapılandırması

### Production API URL Ayarlama

Mobil uygulama için EAS Build yapılandırması:

```bash
# eas.json'da production profile ekle
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://smartop.com.tr/api/v1"
      }
    }
  }
}
```

### Production APK/IPA Oluşturma

```bash
cd mobile

# Android APK
eas build --platform android --profile production

# iOS (Apple Developer Account gerekli)
eas build --platform ios --profile production
```

## 6. İlk Çalıştırma Sonrası Yapılacaklar

### Admin Kullanıcı Oluşturma

Backend container'a bağlanıp seed script çalıştırın:

```bash
# Coolify terminal'den veya SSH ile
docker exec -it smartop-backend sh

# İçeride:
npx prisma db seed
```

Veya Adminer üzerinden manuel SQL:

```sql
-- Admin kullanıcı oluştur
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@smartop.com',
  '$2b$10$...', -- bcrypt hash
  'Admin',
  'User',
  'ADMIN',
  true
);
```

### Veritabanı Kontrolleri

```bash
# Migration durumunu kontrol et
docker exec smartop-backend npx prisma migrate status

# Prisma Studio'yu başlat (geçici)
docker exec smartop-backend npx prisma studio
```

## 7. Monitoring ve Bakım

### Log Kontrolü

```bash
# Tüm container logları
docker-compose -f docker-compose.prod.yml logs -f

# Sadece backend
docker logs -f smartop-backend

# Sadece frontend
docker logs -f smartop-frontend
```

### Backup Stratejisi

```bash
# PostgreSQL backup
docker exec smartop-postgres pg_dump -U smartop smartop > backup_$(date +%Y%m%d).sql

# Otomatik backup için cron job
# crontab -e
0 2 * * * docker exec smartop-postgres pg_dump -U smartop smartop > /backups/smartop_$(date +\%Y\%m\%d).sql
```

### Güncelleme

```bash
# Yeni kod deploy
git push origin main  # Coolify otomatik deploy eder

# Manuel deploy
# Coolify Dashboard → Proje → Deploy
```

## 8. Troubleshooting

### Container başlamıyor

```bash
# Logları kontrol et
docker logs smartop-backend
docker logs smartop-frontend

# Container durumunu kontrol et
docker ps -a
```

### Database bağlantı hatası

```bash
# PostgreSQL çalışıyor mu?
docker exec smartop-postgres pg_isready

# Bağlantı test
docker exec smartop-backend npx prisma db execute --stdin <<< "SELECT 1;"
```

### CORS hatası

`.env`'de CORS_ORIGIN değerini kontrol et:
```env
# Doğru
CORS_ORIGIN=https://smartop.com.tr

# Yanlış (http, trailing slash)
CORS_ORIGIN=http://smartop.com.tr/
```

### Push notification çalışmıyor

1. Firebase Service Account JSON'u kontrol et
2. Backend loglarında Firebase hatası var mı kontrol et
3. Mobil cihazda FCM token alınıyor mu kontrol et

## 9. Güvenlik Kontrol Listesi

- [ ] Güçlü database şifresi (min 32 karakter)
- [ ] Güçlü JWT secret (min 64 karakter)
- [ ] HTTPS aktif (SSL sertifikası)
- [ ] Firewall ayarları (sadece 80, 443 açık)
- [ ] Database portu dışarıya kapalı
- [ ] Redis portu dışarıya kapalı
- [ ] Environment variables güvenli saklanıyor
- [ ] Backup stratejisi mevcut

## 10. Performance Optimizasyonları

### Nginx Gzip

Frontend nginx.conf'ta gzip zaten aktif.

### Redis Cache

Backend'de Redis cache kullanılıyor. Ek optimizasyon:

```env
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### PostgreSQL Tuning

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

---

## Hızlı Başlangıç Özeti

1. **Repository'yi Coolify'a ekle** (docker-compose.prod.yml seç)
2. **Environment variables'ları ayarla** (en az: POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGIN, FIREBASE_SERVICE_ACCOUNT)
3. **Domain ve SSL ayarla**
4. **Deploy et**
5. **Admin kullanıcı oluştur**
6. **Mobil için production build al** (EXPO_PUBLIC_API_URL ile)

İyi deploy'lar! 🚀
