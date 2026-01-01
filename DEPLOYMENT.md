# Deployment Guide - Dirty December Platform

Complete guide for deploying the Dirty December platform to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] API endpoints integrated (or mock data ready)
- [ ] Payment gateway configured (if applicable)
- [ ] Build passes without errors
- [ ] Mobile responsiveness verified
- [ ] Admin dashboard accessible
- [ ] Images and assets optimized

## Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This creates an optimized production build in the `dist` folder.

## Deployment Options

### 1. Vercel (Recommended - Easiest)

**Why Vercel?**
- Free tier available
- Automatic deployments from Git
- Built-in SSL
- Excellent performance
- Zero configuration for Vite projects

**Steps:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? No
   - Project name? dirty-december
   - Which directory? ./
   - Auto-detected Vite. Continue? Yes

5. Production deployment:
```bash
vercel --prod
```

**Environment Variables in Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add your variables:
   - `VITE_API_URL`
   - `VITE_PAYSTACK_PUBLIC_KEY`
   - etc.

**Automatic Deployments:**
1. Push your code to GitHub
2. Connect repository in Vercel dashboard
3. Vercel auto-deploys on every push to main branch

---

### 2. Netlify

**Why Netlify?**
- Free tier with generous limits
- Simple drag-and-drop deployment
- Form handling built-in
- Serverless functions support

**Steps:**

**Option A: Drag and Drop**
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to Netlify
4. Done!

**Option B: CLI**
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Deploy:
```bash
netlify deploy --prod
```

**Configuration File:**
Create `netlify.toml` in root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables:**
1. Site settings → Build & deploy → Environment
2. Add variables
3. Redeploy

---

### 3. AWS S3 + CloudFront

**Why AWS?**
- Scalable
- Highly available
- Full control
- Cost-effective for static sites

**Steps:**

1. Create S3 Bucket:
```bash
aws s3 mb s3://dirty-december-app
```

2. Enable static website hosting:
```bash
aws s3 website s3://dirty-december-app/ \
  --index-document index.html \
  --error-document index.html
```

3. Build and upload:
```bash
npm run build
aws s3 sync dist/ s3://dirty-december-app/
```

4. Set bucket policy for public access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dirty-december-app/*"
    }
  ]
}
```

5. Create CloudFront distribution for HTTPS and CDN

---

### 4. Traditional VPS (DigitalOcean, Linode, etc.)

**Requirements:**
- Ubuntu 22.04 server
- Node.js 18+
- Nginx
- PM2 (for serving)

**Steps:**

1. SSH into server:
```bash
ssh root@your-server-ip
```

2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

4. Clone and build:
```bash
cd /var/www
git clone <your-repo-url> dirty-december
cd dirty-december
npm install
npm run build
```

5. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/dirty-december
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/dirty-december/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

6. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dirty-december /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. Install SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### 5. GitHub Pages (Free)

**Limitations:**
- Client-side routing requires workarounds
- Custom domain optional
- No server-side code

**Steps:**

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Update `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/dirty-december",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/dirty-december/', // Your repo name
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages:
   - Repository → Settings → Pages
   - Source: gh-pages branch
   - Save

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxx
VITE_ENABLE_ANALYTICS=true
```

**Never commit `.env` files to Git!**

---

## Domain Configuration

### Custom Domain Setup

**Vercel/Netlify:**
1. Add domain in dashboard
2. Update DNS records:
   - Type: A
   - Name: @
   - Value: (provided by platform)
   
   - Type: CNAME
   - Name: www
   - Value: (provided by platform)

**Traditional Hosting:**
1. Point A record to server IP
2. Configure Nginx for domain

---

## Performance Optimization

### 1. Image Optimization

Compress images before deployment:
```bash
npm install -g imagemin-cli
imagemin src/assets/* --out-dir=src/assets/optimized
```

### 2. Code Splitting

Already handled by Vite, but verify:
```typescript
// Dynamic imports for routes
const Dashboard = lazy(() => import('./screens/Dashboard'));
```

### 3. Caching Headers

**Nginx:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Vercel (`vercel.json`):**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Compression

Enable gzip/brotli compression:
- Vercel/Netlify: Automatic
- Nginx: Configure in site config
- CloudFront: Enable in distribution settings

---

## Monitoring & Analytics

### Google Analytics

1. Get tracking ID from Google Analytics
2. Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Error Tracking)

1. Install:
```bash
npm install @sentry/react @sentry/tracing
```

2. Initialize in `App.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

---

## SSL/HTTPS

### Free SSL Options:
1. **Let's Encrypt** - Free, auto-renewing
2. **Cloudflare** - Free SSL + CDN
3. **Vercel/Netlify** - Automatic SSL

### Force HTTPS:

**Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    # SSL config...
}
```

---

## Backup Strategy

### Code
- Git repository (GitHub/GitLab)
- Regular commits and tags

### Database
```bash
# PostgreSQL backup
pg_dump dbname > backup.sql

# Automated daily backups
0 2 * * * pg_dump dbname > /backups/db-$(date +\%Y\%m\%d).sql
```

### User Uploads
- Sync to S3/Supabase Storage
- Enable versioning

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.API_URL }}
        VITE_PAYSTACK_PUBLIC_KEY: ${{ secrets.PAYSTACK_KEY }}
    
    - name: Deploy to Vercel
      run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Post-Deployment Checklist

- [ ] Test all user flows on mobile devices
- [ ] Verify admin dashboard functionality
- [ ] Check SSL certificate
- [ ] Test payment integration (if applicable)
- [ ] Verify all images load correctly
- [ ] Test contribution submission
- [ ] Check delivery form submission
- [ ] Verify announcements display
- [ ] Test search and filter functions
- [ ] Check responsive design on various devices
- [ ] Set up monitoring/analytics
- [ ] Configure backups
- [ ] Document deployment process
- [ ] Share URLs with team

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### 404 on Refresh
- Configure server to redirect to index.html
- See platform-specific routing configs above

### Environment Variables Not Working
- Prefix with `VITE_`
- Rebuild after adding variables
- Check platform-specific env config

### Images Not Loading
- Check file paths
- Verify assets are in dist folder
- Check CORS headers

---

## Cost Estimates

**Free Tier Options:**
- Vercel: Free for personal projects
- Netlify: 100GB bandwidth/month free
- GitHub Pages: Free unlimited
- Cloudflare: Free SSL + CDN

**Paid Options:**
- DigitalOcean Droplet: $6/month
- AWS (small traffic): ~$5-10/month
- Custom domain: ~$10-15/year

---

## Support Resources

- [Vite Deployment Docs](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/s3/index.html)

---

🚀 **You're ready to deploy!** Choose your platform and follow the steps above.
