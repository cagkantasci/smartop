# Smartop - Post Deployment Tasks

Deployment tamamlandıktan sonra yapılması gereken opsiyonel görevler.

## Priority: High (Recommended)

### 1. S3/R2 File Storage Configuration
**Purpose:** Dosya yükleme (makine fotoğrafları, dökümanlar, vb.)

**Options:**
- **Cloudflare R2** (Recommended - S3 compatible, cheaper)
- **AWS S3**
- **MinIO** (self-hosted)

**Required Environment Variables:**
```env
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_BUCKET=smartop-files
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto
```

**Steps:**
1. Create Cloudflare R2 bucket or AWS S3 bucket
2. Generate API credentials
3. Add environment variables to Coolify Backend
4. Restart backend service

---

### 2. SMTP Email Configuration
**Purpose:** Email notifications (password reset, reports, alerts)

**Options:**
- **Resend** (Recommended - 3000 free/month, easy setup)
- **SendGrid** (100 free/month)
- **Gmail** (500/day, requires App Password)
- **Brevo** (300/day free)

**Required Environment Variables:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxx
SMTP_FROM=noreply@smartop.com.tr
```

**Steps:**
1. Create account on chosen provider
2. Verify domain (for production)
3. Generate API key / SMTP credentials
4. Add environment variables to Coolify Backend
5. Restart backend service

---

## Priority: Medium

### 3. Domain & SSL Configuration
**Purpose:** Custom domain with HTTPS

**Steps:**
1. Point DNS A record to VPS IP: `smartop.com.tr` → `VPS_IP`
2. Point API subdomain: `api.smartop.com.tr` → `VPS_IP`
3. Configure in Coolify:
   - Frontend: `smartop.com.tr`
   - Backend: `api.smartop.com.tr`
4. Enable SSL (Coolify auto-generates Let's Encrypt)

---

### 4. Database Backup Configuration
**Purpose:** Automated PostgreSQL backups

**Options:**
- Coolify built-in backup (if available)
- pg_dump cron job
- External backup service

**Recommended Schedule:**
- Daily: 7-day retention
- Weekly: 4-week retention
- Monthly: 12-month retention

---

### 5. Monitoring & Alerts
**Purpose:** Application health monitoring

**Options:**
- **Uptime Kuma** (self-hosted, Coolify template available)
- **Betterstack** (free tier)
- **UptimeRobot** (free tier)

**Endpoints to Monitor:**
- `https://api.smartop.com.tr/api/v1/health`
- `https://smartop.com.tr`

---

## Priority: Low (Nice to Have)

### 6. Redis Persistence Configuration
**Purpose:** Session and cache data persistence across restarts

**Current:** Default Redis settings (may lose data on restart)
**Recommended:** Enable AOF persistence

---

### 7. Log Aggregation
**Purpose:** Centralized log management

**Options:**
- **Grafana Loki** (self-hosted)
- **Papertrail** (free tier)
- **Logtail** (free tier)

---

### 8. Performance Optimization
- Enable gzip compression in Traefik
- Configure CDN for frontend static assets
- Database query optimization
- Redis caching for frequent queries

---

### 9. Security Hardening
- [ ] Enable rate limiting (already in code, verify config)
- [ ] Configure CORS properly for production domain
- [ ] Set up fail2ban on VPS
- [ ] Regular security updates

---

### 10. Mobile App Production Build
**Purpose:** Production APK/AAB for Google Play Store

**Steps:**
1. Update `app.json` with production values
2. Configure EAS Build credentials
3. Build production APK: `eas build --platform android --profile production`
4. Test on real devices
5. Submit to Google Play Store

---

## Quick Reference - Service Status

| Service | Status | Notes |
|---------|--------|-------|
| Backend API | ✅ Running | Port 3000 |
| PostgreSQL | ✅ Running | Coolify managed |
| Redis | ✅ Running | Coolify managed |
| Frontend | ⏳ Pending | Next to deploy |
| Firebase Push | ✅ Configured | Base64 env added |
| S3/R2 Storage | ⏳ Pending | Optional |
| SMTP Email | ⏳ Pending | Optional |
| Custom Domain | ⏳ Pending | After frontend |
| SSL | ⏳ Pending | Auto with domain |

---

*Last Updated: December 15, 2025*
