# Quick Reference - Dirty December Platform

Essential commands, file locations, and quick tips.

## 🚀 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Key Files & Locations

### User Screens
```
/src/app/screens/Landing.tsx          # Homepage
/src/app/screens/Login.tsx            # User login
/src/app/screens/Onboarding.tsx       # Package selection
/src/app/screens/Dashboard.tsx        # User dashboard
/src/app/screens/Contribute.tsx       # Payment upload
/src/app/screens/ValuePreview.tsx     # Savings breakdown
/src/app/screens/Announcements.tsx    # Updates feed
```

### Admin Views
```
/src/app/admin/AdminLogin.tsx                      # Admin login
/src/app/admin/views/DashboardOverview.tsx         # Main dashboard
/src/app/admin/views/UsersManagement.tsx           # User list
/src/app/admin/views/PackagesManagement.tsx        # Package CRUD
/src/app/admin/views/PackageDetailsView.tsx        # Package stats
/src/app/admin/views/ContributionsView.tsx         # Payment review ⭐
/src/app/admin/views/AnnouncementsManagement.tsx   # Announcements
```

### Data & Configuration
```
/src/app/data/packages.ts          # Package definitions
/src/app/data/mockData.ts          # Mock contributions, announcements
/src/app/data/partners.ts          # Partner logos
/src/styles/theme.css              # Design tokens
/package.json                      # Dependencies
/.env                              # Environment variables (create this)
```

## 🎨 Quick Styling Guide

### Using Gradients
```tsx
// Purple/Pink (Primary)
className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"

// Emerald/Teal (Success)
className="bg-gradient-to-br from-emerald-600 to-teal-600"

// Amber/Orange (Warning)
className="bg-gradient-to-br from-amber-500 to-orange-500"
```

### Common Cards
```tsx
import { Card } from './components/Card';

<Card className="border-0 shadow-lg">
  {/* Content */}
</Card>
```

### Gradient Buttons
```tsx
import { GradientButton } from './components/GradientButton';

<GradientButton onClick={handleClick}>
  Click Me
</GradientButton>
```

### Status Badges
```tsx
import { StatusBadge } from './components/StatusBadge';

<StatusBadge status="confirmed" size="md" />
// Options: pending, confirmed, missed
```

## 🔧 Quick Fixes

### Port Already in Use
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Clear Cache & Rebuild
```bash
rm -rf node_modules dist .vite
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types without building
npx tsc --noEmit
```

## 📝 Quick Data Modifications

### Add a New Package
Edit `/src/app/data/packages.ts`:
```typescript
{
  id: 'new-package',
  name: 'New Package',
  monthlyAmount: 10000,
  yearlyTotal: 120000,
  estimatedRetailValue: 180000,
  savings: 60000,
  savingsPercent: 50,
  description: 'Description here',
  benefits: ['Benefit 1', 'Benefit 2'],
  detailedBenefits: [...],
  gradient: 'from-blue-500 to-cyan-500',
  shadowColor: 'shadow-blue-500/30'
}
```

### Add an Announcement
Edit `/src/app/data/mockData.ts`:
```typescript
{
  id: 4,
  title: 'New Announcement',
  message: 'Message here',
  date: '2024-12-01',
  priority: 'high' // high, medium, low
}
```

### Add a Mock Contribution
Edit `/src/app/data/mockData.ts`:
```typescript
{
  month: 'December',
  amount: 5000,
  status: 'confirmed', // confirmed, pending, missed
  date: '2024-12-01',
  transactionId: 'DD-2024-DEC-001234',
  paymentMethod: 'Bank Transfer',
  reference: 'REF-123456',
  time: '10:00 AM'
}
```

## 🎯 Testing Checklist

### User Flow Test
- [ ] Landing page loads
- [ ] Click "Get Started" → Onboarding
- [ ] Select package (all 3 tiers)
- [ ] Fill signup form
- [ ] Dashboard displays correctly
- [ ] Click "Make Contribution"
- [ ] Upload file (JPG/PNG)
- [ ] Submit contribution
- [ ] View "Value Preview"
- [ ] Set delivery preferences
- [ ] View announcements
- [ ] Logout

### Admin Flow Test
- [ ] Click "Admin Access" on landing footer
- [ ] Login (any credentials)
- [ ] Dashboard metrics display
- [ ] Click package → Package Details
- [ ] Click "View Contributions"
- [ ] Search/filter contributions
- [ ] Click eye icon → View details
- [ ] Click "View Payment Proof"
- [ ] Approve a pending contribution
- [ ] Navigate to Users
- [ ] Filter users by package/status
- [ ] Click delivery badge → View address
- [ ] Navigate to Packages
- [ ] Edit a package
- [ ] Add detailed benefit
- [ ] Save package
- [ ] Create announcement
- [ ] Logout

## 🌐 Browser DevTools Setup

### Mobile View (Required for User Screens)
1. Press F12 to open DevTools
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or custom 390x844
4. Refresh page

### Desktop View (Admin Dashboard)
1. Close device toolbar
2. Resize window to 1440px width
3. Admin dashboard is responsive

## 🔑 Environment Variables

Create `.env` in root:
```env
# API (when ready to integrate)
VITE_API_URL=http://localhost:8000/api

# Payment Gateway
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_PAYMENTS=false
VITE_ENABLE_CHAT=false
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📦 Package Management

### Install a Package
```bash
npm install package-name
```

### Remove a Package
```bash
npm uninstall package-name
```

### Update All Packages
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

## 🎨 Color Reference

### Gradients
```typescript
// Copy-paste ready
'from-indigo-500 via-purple-500 to-pink-500'    // Basic (Purple)
'from-emerald-500 via-teal-500 to-cyan-500'     // Family (Green)
'from-amber-500 via-orange-500 to-red-500'      // Premium (Orange)
'from-blue-500 to-cyan-500'                     // Blue accent
'from-emerald-600 to-teal-600'                  // Success
'from-red-600 to-red-700'                       // Error
```

### Status Colors
```typescript
'confirmed' → 'bg-emerald-100 text-emerald-700'
'pending'   → 'bg-amber-100 text-amber-700'
'declined'  → 'bg-red-100 text-red-700'
'missed'    → 'bg-gray-100 text-gray-700'
```

## 🔍 Search Patterns

### Find All Uses of a Component
```bash
grep -r "import.*GradientButton" src/
```

### Find All TODOs
```bash
grep -r "TODO\|FIXME" src/
```

### Find All console.log (before production)
```bash
grep -r "console.log" src/
```

## 🚀 Deployment Quick Commands

### Vercel
```bash
npm install -g vercel
vercel login
vercel           # Deploy preview
vercel --prod    # Deploy to production
```

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Build Only
```bash
npm run build
# Upload 'dist' folder to any static host
```

## 📊 File Size Reference

- **Total Project:** ~500MB (with node_modules)
- **Source Code:** ~2MB
- **Production Build:** ~2MB (optimized)
- **node_modules:** ~498MB

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| White screen on start | Check console for errors, verify `index.html` exists |
| Components not found | Check import paths, ensure file exists |
| Styles not applying | Verify Tailwind is running, check class names |
| Icons missing | Verify lucide-react is installed |
| Build fails | Clear cache: `rm -rf node_modules dist .vite` then `npm install` |
| Port in use | Kill process on 5173 or change port in vite.config.ts |

## 💡 Pro Tips

1. **Always use mobile view** when testing user screens
2. **Use desktop view** for admin dashboard
3. **Check both light mode** (theme is light-only currently)
4. **Test file upload** with actual images
5. **Verify gradients render** across browsers
6. **Test on actual mobile device** before launch
7. **Use React DevTools** for debugging state
8. **Enable source maps** for debugging build
9. **Check performance** with Lighthouse
10. **Test forms** with empty/invalid data

## 📱 Screen Sizes

```
User Screens:  360px - 430px (mobile only)
Admin Views:   1024px+ (desktop optimized)
Breakpoints:   sm(640px), md(768px), lg(1024px), xl(1280px)
```

## 🎓 Learning Resources

- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vite: https://vitejs.dev
- TypeScript: https://typescriptlang.org
- Lucide Icons: https://lucide.dev

## 📞 Where to Get Help

1. Check `README.md` for main documentation
2. Check `FEATURES.md` for feature details
3. Check `API_INTEGRATION.md` for backend help
4. Check `DEPLOYMENT.md` for deployment help
5. Check error console in browser DevTools
6. Review code comments in files

---

**Keep this file handy for quick reference!**

Last Updated: January 2026
