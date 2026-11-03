# RENSELL - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Vercel account created
- [ ] Environment variables prepared
- [ ] Code tested locally
- [ ] Images uploaded to Vercel Blob

---

## 🗄️ MongoDB Atlas Setup (Step-by-Step)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Verify email

### 2. Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS recommended)
4. Choose region closest to your users
5. Name your cluster (e.g., "rensell-cluster")
6. Click "Create"

### 3. Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `rensell_user`
5. Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Whitelist IP Address
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your Vercel deployment IPs
5. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `rensell`

Example:
```
mongodb+srv://rensell_user:YOUR_PASSWORD@rensell-cluster.xxxxx.mongodb.net/rensell?retryWrites=true&w=majority
```

---

## ☁️ Vercel Deployment (Step-by-Step)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
Follow the email verification link.

### 3. Initialize Project
```bash
cd nextjs-app
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **rensell** (or your choice)
- Directory? **./nextjs-app**
- Override settings? **N**

### 4. Set Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:

```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your-secret-key-min-32-chars
NEXTAUTH_URL = https://your-domain.vercel.app
NEXTAUTH_SECRET = another-secret-key
BLOB_READ_WRITE_TOKEN = (get from Vercel Blob)
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
UPSTASH_REDIS_REST_URL = https://<your-upstash-endpoint>.upstash.io
UPSTASH_REDIS_REST_TOKEN = <your-upstash-token>
```

#### Option B: Via CLI
```bash
vercel env add MONGODB_URI
# Paste your MongoDB URI when prompted
# Select: Production, Preview, Development

vercel env add JWT_SECRET
# Enter a secure random string

# Repeat for all variables
```

### 5. Deploy to Production
```bash
vercel --prod
```

Your site will be live at: `https://your-project.vercel.app`

---

## 📦 Vercel Blob Storage Setup

### 1. Create Blob Store
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Blob"
6. Name it: `rensell-images`
7. Click "Create"

### 2. Get Access Token
1. After creation, you'll see connection details
2. Copy the `BLOB_READ_WRITE_TOKEN`
3. Add it to environment variables

### 3. Upload Images
Use the upload API endpoint:

```bash
curl -X POST https://your-domain.vercel.app/api/upload \
  -F "file=@/path/to/image.jpg"
```

Or use the admin panel (if created).

---

## 🔄 Continuous Deployment

### Connect GitHub (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/rensell.git
git push -u origin main
```

2. In Vercel Dashboard:
   - Go to project settings
   - Click "Git" tab
   - Connect your GitHub repository

3. Auto-deploy on push:
   - Every push to `main` branch auto-deploys to production
   - Pull requests create preview deployments

---

## 🧪 Testing Production Deployment

### 1. Test API Endpoints
```bash
# Test products endpoint
curl https://your-domain.vercel.app/api/products

# Test signup
curl -X POST https://your-domain.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Test Frontend
1. Visit your deployed URL
2. Check all pages load
3. Test product browsing
4. Test cart functionality
5. Test authentication

### 3. Monitor Logs
```bash
vercel logs
```

Or view in Vercel Dashboard → Deployments → Select deployment → Logs

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env.local` to Git
- Use strong, random secrets (min 32 characters)
- Rotate secrets periodically

### 2. MongoDB Security
- Use strong database passwords
- Restrict IP access in production
- Enable MongoDB Atlas encryption
- Regular backups

### 3. API Security
- Implement rate limiting
- Add CORS configuration

### 4. Distributed Rate Limiting (Recommended)
- Configure Upstash Redis with:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- If both are set, API rate limits are shared across all server instances.
- If either is missing or Redis is temporarily unavailable, the app falls back to in-memory limiting.

### 5. Monitoring Blocked Requests
- Rate-limited payment endpoints log structured security events as:
  - `event`: `rate_limit_blocked`
  - `route`: API path (e.g. `/api/payment/verify`)
  - `scope`: `ip` or `user`
  - `clientIp`: resolved request IP
  - `userHash`: hashed user identifier (no raw userId in logs)
  - `maxRequests`, `remaining`, `resetMs`, `timestamp`
- 429 responses include standard headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After`

### 6. Operational Alerts
- Configure your log/alerting platform to trigger high-priority alerts when either condition is met:
  - `rate_limit_blocked` count > 100 events in 5 minutes for a single route
  - `rate_limit_blocked` count > 30 events in 5 minutes for the same `clientIp`
- Configure medium-priority alerts when either condition is met:
  - 429 response rate > 5% for payment endpoints over 10 minutes
  - Redis limiter fallback message appears repeatedly (indicates distributed limiter instability)
- Suggested first-response playbook:
  - Verify whether traffic spike is legitimate (sale/event) or abuse
  - Check if the impacted scope is `ip` or `user` from logs
  - For abusive traffic, add temporary WAF/IP block and continue monitoring
  - If fallback is active unexpectedly, validate `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
  - If payment routes are impacted, run a manual checkout smoke test end to end

### 7. Incident Severity Matrix

| Severity | Trigger | Response SLA | Owner Action |
| --- | --- | --- | --- |
| Sev 1 | Payment route down, repeated verification failures, or suspected active abuse affecting multiple users | 15 minutes | Investigate immediately, check logs, validate Razorpay/Upstash status, apply temporary block if needed |
| Sev 2 | `rate_limit_blocked` > 100/5m on a route or 429 rate > 5% on payment endpoints | 1 hour | Confirm whether it is abuse or legitimate spike, inspect scope (`ip`/`user`), and monitor mitigation |
| Sev 3 | Redis limiter fallback active, elevated but contained 429s, or single-client repeated blocks | Same business day | Verify env vars, Redis connectivity, and retry conditions; no customer-visible outage expected |
| Sev 4 | Informational or one-off block events | Next routine review | No immediate action unless the pattern repeats |

### 8. Runbook Commands (On-Call)
Use these commands during incident response:

```bash
# Stream live production logs
vercel logs --prod --follow

# Pull recent logs snapshot
vercel logs --prod
```

```powershell
# Windows PowerShell: show security block events from a saved log file
Get-Content .\vercel-logs.txt | Select-String 'rate_limit_blocked'

# Filter payment route 429 responses from a saved log file
Get-Content .\vercel-logs.txt | Select-String '/api/payment/create-order|/api/payment/verify|/api/payment/reconcile| 429 '

# Detect distributed limiter fallback occurrences
Get-Content .\vercel-logs.txt | Select-String 'Distributed rate limiter unavailable; falling back to memory limiter'
```

```bash
# Linux/macOS equivalent filters on saved logs
grep 'rate_limit_blocked' vercel-logs.txt
grep -E '/api/payment/create-order|/api/payment/verify|/api/payment/reconcile| 429 ' vercel-logs.txt
grep 'Distributed rate limiter unavailable; falling back to memory limiter' vercel-logs.txt
```

### 9. Post-Incident Postmortem Checklist
After any **Sev 1** or **Sev 2** incident, complete the following within 24 hours:

**Timeline Reconstruction**
- [ ] Document exact start/end time of incident
- [ ] Identify first alert trigger and confirm severity classification
- [ ] List all affected endpoints and affected user count
- [ ] Note when issue was detected and by whom

**Root-Cause Analysis**
- [ ] Review security logs for `rate_limit_blocked` patterns (IP scope vs user scope)
- [ ] Check for abnormal request volumes or patterns in Vercel logs
- [ ] Determine if incident was abuse, legitimate spike, or system misconfiguration
- [ ] Verify Razorpay API health status at incident time
- [ ] Confirm Redis/Upstash availability during incident window
- [ ] Check if limiter fell back to in-memory mode (indicates Redis issue)

**Security Log Review**
- [ ] Filter logs using runbook commands to isolate event stream
- [ ] Identify hashed user IDs (`userHash`) with repeated blocks
- [ ] Correlate blocked IPs (`clientIp`) across time window
- [ ] Compare incident to baseline rate-limit block patterns (review last 7 days)
- [ ] Determine if individual user rate limits or global IP limits were exhausted

**Limiter Configuration Audit**
- [ ] Verify rate-limit thresholds match DEPLOYMENT.md (IP/user scopes per endpoint)
- [ ] Confirm `.env` has valid `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Check if fallback to in-memory limiter was triggered (acceptable, but indicates Redis issue)
- [ ] Review recent changes to `/lib/rateLimit.ts` or Upstash Redis configuration
- [ ] Validate that 429 response headers are correctly populated (`RateLimit-*` headers)

**Customer Impact Assessment**
- [ ] Determine if legitimate customers were blocked (check for support tickets during incident)
- [ ] Identify overlap between affected users and high-value customers
- [ ] Calculate failed payment attempts (if Sev 1) and transaction value impact
- [ ] Prepare customer communication if transparency is needed

**Preventative Actions**
- [ ] Increase thresholds if legitimate spike caused false positive (document reason)
- [ ] Add IP whitelist or customer allowlist if specific users were wrongly blocked
- [ ] Adjust rate-limit scope if attacks shifted strategy (e.g., distributed user IDs)
- [ ] Schedule Redis health check or upgrade plan if fallback mode was triggered
- [ ] Add monitoring alert for future similar patterns
- [ ] Update runbook if new incident pattern was discovered

**Closeout**
- [ ] Post postmortem summary to internal incident channel
- [ ] Assign follow-up tasks for preventative actions
- [ ] Update DEPLOYMENT.md with any threshold or configuration changes
- [ ] Close incident ticket with root-cause link

---

- Validate all inputs
- Use HTTPS only

---

## 📊 Performance Optimization

### 1. Enable Caching
In `next.config.js`:
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
  // Enable static optimization
  output: 'standalone',
}
```

### 2. Image Optimization
- Use Next.js Image component
- Compress images before upload
- Use WebP format
- Lazy load images

### 3. Database Indexing
Ensure indexes are created:
```javascript
// In MongoDB Atlas
db.products.createIndex({ category: 1, type: 1 })
db.products.createIndex({ name: "text", description: "text" })
db.orders.createIndex({ userId: 1, createdAt: -1 })
```

---

## 🐛 Troubleshooting

### Deployment Fails
```bash
# Clear cache and rebuild
vercel --force

# Check build logs
vercel logs --follow
```

### MongoDB Connection Timeout
- Check IP whitelist
- Verify connection string
- Check MongoDB Atlas status

### Environment Variables Not Working
```bash
# List all env vars
vercel env ls

# Pull env vars locally
vercel env pull .env.local
```

### Images Not Loading
- Check Vercel Blob token
- Verify image URLs
- Check Next.js image configuration

---

## 📈 Monitoring & Analytics

### 1. Vercel Analytics
Enable in Vercel Dashboard → Analytics

### 2. Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay

### 3. Performance Monitoring
- Vercel Speed Insights
- Google Lighthouse
- Web Vitals

---

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
git add .
git commit -m "Update description"
git push origin main
# Auto-deploys to Vercel
```

### Rollback Deployment
1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Database Migrations
```bash
# Run migration script
node scripts/migrate.js
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://www.mongodb.com/docs
- **Vercel Support**: support@vercel.com

---

## ✅ Post-Deployment Checklist

- [ ] All pages accessible
- [ ] API endpoints working
- [ ] Authentication functional
- [ ] Images loading correctly
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Backup strategy in place

---

**Congratulations! Your RENSELL platform is now live! 🎉**
