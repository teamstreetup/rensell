# RENSELL - Complete Setup Instructions

## 🚀 From Zero to Production in 30 Minutes

Follow these steps to get your RENSELL platform running locally and deployed to production.

---

## ✅ Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] MongoDB Atlas account (free tier)
- [ ] Vercel account (free tier)
- [ ] Code editor (VS Code recommended)

---

## 📦 Step 1: Install Dependencies

```bash
cd nextjs-app
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- MongoDB/Mongoose
- JWT libraries
- Zod validation
- Vercel Blob SDK

---

## 🗄️ Step 2: Setup MongoDB Atlas

### Create Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create new cluster (FREE M0 tier)
4. Wait for cluster creation (~5 minutes)

### Create Database User
1. Database Access → Add New Database User
2. Username: `rensell_admin`
3. Password: Generate strong password (save it!)
4. Privileges: Read and write to any database

### Whitelist IP
1. Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

### Get Connection String
1. Clusters → Connect → Connect your application
2. Copy connection string
3. Replace `<password>` with your password
4. Replace `<dbname>` with `rensell`

Example:
```
mongodb+srv://rensell_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rensell?retryWrites=true&w=majority
```

---

## 🔐 Step 3: Setup Environment Variables

Create `.env.local` file in `nextjs-app` directory:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://rensell_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rensell?retryWrites=true&w=majority

# JWT Secret (generate random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-random-secret-key-32-chars

# Vercel Blob (leave empty for now, will add after Vercel setup)
BLOB_READ_WRITE_TOKEN=

# Optional: Upstash Redis for distributed rate limiting
# If omitted, app uses in-memory fallback limiter.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate Secure Secrets
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🌱 Step 4: Seed Database

Populate your database with initial products:

```bash
node scripts/seed.js
```

You should see:
```
Connected to MongoDB
Cleared existing products
Seeded products successfully
Database connection closed
```

---

## 🏃 Step 5: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

You should see:
- Homepage with products
- Navigation working
- All pages accessible

---

## 🧪 Step 6: Test Locally

### Test Authentication
1. Go to http://localhost:3000/auth/signup
2. Create account
3. Login
4. Verify token in localStorage

### Test Products
1. Browse products
2. Click on product → Detail page
3. Add to cart
4. View cart

### Test API
```bash
# Test products endpoint
curl http://localhost:3000/api/products

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

---

## ☁️ Step 7: Deploy to Vercel

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```
Check your email and verify.

### Deploy
```bash
cd nextjs-app
vercel
```

Answer prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **rensell**
- Directory? **./**
- Override settings? **N**

Wait for deployment (~2 minutes)

---

## 📦 Step 8: Setup Vercel Blob Storage

### Create Blob Store
1. Go to https://vercel.com/dashboard
2. Select your project
3. Storage tab → Create Database
4. Select "Blob"
5. Name: `rensell-images`
6. Create

### Get Token
1. Copy `BLOB_READ_WRITE_TOKEN`
2. Add to Vercel environment variables

### Add Environment Variables to Vercel
```bash
# Via CLI
vercel env add MONGODB_URI
# Paste your MongoDB URI
# Select: Production, Preview, Development

vercel env add JWT_SECRET
# Paste your JWT secret
# Select: Production, Preview, Development

vercel env add NEXTAUTH_SECRET
# Paste your NextAuth secret
# Select: Production, Preview, Development

vercel env add BLOB_READ_WRITE_TOKEN
# Paste your Blob token
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://your-project.vercel.app
# Select: Production, Preview, Development
```

Or add via Dashboard:
1. Project Settings → Environment Variables
2. Add each variable
3. Select all environments

---

## 🚀 Step 9: Deploy to Production

```bash
vercel --prod
```

Your site is now live at: `https://your-project.vercel.app`

---

## ✅ Step 10: Verify Production

### Test Production Site
1. Visit your Vercel URL
2. Test signup/login
3. Browse products
4. Add to cart
5. Test all pages

### Check Logs
```bash
vercel logs
```

Or in Vercel Dashboard → Deployments → Logs

---

## 🎯 Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Products display
- [ ] Cart functionality works
- [ ] Images load
- [ ] Mobile responsive
- [ ] SSL certificate active (https)
- [ ] API endpoints working
- [ ] Database connected
- [ ] No console errors

---

## 🔄 Making Updates

### Local Development
```bash
# Make changes
npm run dev

# Test locally
# Commit changes
git add .
git commit -m "Your changes"
```

### Deploy Updates
```bash
# If using Git integration (recommended)
git push origin main
# Auto-deploys to Vercel

# Or manual deploy
vercel --prod
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Failed
- Check connection string format
- Verify password (no special characters issues)
- Check IP whitelist
- Ensure cluster is running

### Build Fails
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Environment Variables Not Working
```bash
# Restart dev server
# Check .env.local exists
# Verify variable names (no typos)
# Restart Vercel deployment
```

---

## 📊 Monitoring

### Vercel Analytics
Enable in: Project Settings → Analytics

### Check Performance
```bash
# Lighthouse score
npm run build
npm start
# Open Chrome DevTools → Lighthouse
```

### Monitor Errors
Check Vercel Dashboard → Deployments → Functions → Logs

---

## 🎉 Success!

Your RENSELL platform is now:
- ✅ Running locally
- ✅ Deployed to production
- ✅ Connected to MongoDB
- ✅ File storage configured
- ✅ Fully functional

**Next Steps:**
1. Customize branding/colors
2. Add more products
3. Configure custom domain (optional)
4. Enable analytics
5. Add payment gateway (future)

---

## 📞 Need Help?

- **Documentation**: Check README.md and DEPLOYMENT.md
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Congratulations! 🎊**

You've successfully set up and deployed a production-ready full-stack e-commerce platform!

Total Setup Time: ~30 minutes
Status: Production Ready ✅
