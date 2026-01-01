# Quick Setup Guide - Dirty December Platform

## Prerequisites Checklist

Before you begin, ensure you have:
- ✅ Node.js version 18.0.0 or higher
- ✅ npm, yarn, or pnpm package manager
- ✅ Git (for cloning the repository)

## Installation Steps

### Step 1: Clone or Extract the Project

If you received this as a zip file:
```bash
# Extract the zip file and navigate to the folder
cd dirty-december
```

If cloning from a repository:
```bash
git clone <repository-url>
cd dirty-december
```

### Step 2: Install Dependencies

Choose your preferred package manager:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm (recommended for faster installation):**
```bash
pnpm install
```

This will install all required packages including:
- React 18
- Tailwind CSS v4
- Lucide React (icons)
- Motion (animations)
- Recharts (charts)
- And all other dependencies

### Step 3: Start Development Server

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

**Using pnpm:**
```bash
pnpm dev
```

You should see output like:
```
VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open in Browser

1. Open your browser (Chrome, Firefox, Safari, or Edge)
2. Navigate to `http://localhost:5173`
3. Open DevTools (F12 or Right-click → Inspect)
4. Toggle device toolbar to mobile view (Ctrl+Shift+M or Cmd+Shift+M)
5. Select iPhone 12/13/14 Pro or set custom size to 390x844

## Testing the Application

### User Flow
1. **Landing Page**: Click "Get Started"
2. **Onboarding**: Select a package (Basic, Family, or Premium)
3. **Dashboard**: View your contribution status
4. **Contribute**: Make a payment and upload proof
5. **Value Preview**: See your savings breakdown
6. **Announcements**: Check platform updates

### Admin Flow
1. **Landing Page**: Scroll to footer and click "Admin Access"
2. **Admin Login**: Enter any credentials (mock auth)
3. **Dashboard**: View platform overview
4. **Users**: Manage all users
5. **Packages**: View/edit packages
6. **Package Details**: Click any package to see details
7. **View Contributions**: Review and approve user payments
8. **Announcements**: Create platform updates

## Build for Production

When ready to deploy:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production files will be in the `dist` folder.

## Project Configuration

### Port Configuration
Default port is `5173`. To change it, modify `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000 // Your desired port
  },
  // ... rest of config
})
```

### Environment Variables
Currently, the app uses mock data. To integrate a backend:

1. Create a `.env` file in the root directory
2. Add your environment variables:

```env
VITE_API_URL=http://localhost:8000/api
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

3. Access them in your code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Common Issues & Solutions

### Issue: Port already in use
**Solution**: Kill the process using port 5173 or change the port in vite.config.ts

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

### Issue: Module not found errors
**Solution**: Delete node_modules and reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Styles not loading
**Solution**: Ensure all style files are in `/src/styles/` and imported in `index.css`

### Issue: Build fails
**Solution**: Check that all imports use correct paths and all files exist

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

## Package Details

All packages are already installed. Here's what's included:

**UI Framework:**
- `react` & `react-dom` - Core React libraries
- `lucide-react` - Icon library
- `motion` - Animation library

**Styling:**
- `tailwindcss` v4 - Utility-first CSS
- `@tailwindcss/vite` - Tailwind Vite plugin

**Form Handling:**
- `react-hook-form` - Form validation

**Routing:**
- `react-router-dom` - Client-side routing

**Charts:**
- `recharts` - Chart library

**UI Components:**
- Multiple `@radix-ui/*` packages for accessible components
- `sonner` - Toast notifications
- `vaul` - Drawer component

## Folder Structure Quick Reference

```
dirty-december/
├── src/app/              # Application code
│   ├── admin/           # Admin dashboard
│   ├── components/      # Reusable components
│   ├── data/           # Data and types
│   ├── screens/        # User screens
│   └── App.tsx         # Main app
├── src/styles/          # Global styles
├── package.json         # Dependencies
├── vite.config.ts      # Vite configuration
└── index.html          # Entry HTML
```

## Next Steps

After successful setup:

1. **Customize Mock Data**: Edit `/src/app/data/mockData.ts` and `/src/app/data/packages.ts`
2. **Update Branding**: Change colors in component files (search for gradient classes)
3. **Add Backend**: Integrate with your preferred backend (Node.js, Django, etc.)
4. **Payment Integration**: Add Paystack or Flutterwave
5. **Deploy**: Use Vercel, Netlify, or your preferred hosting

## Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop the 'dist' folder to Netlify
```

### Traditional Hosting
```bash
npm run build
# Upload contents of 'dist' folder to your web server
```

## Support

If you encounter any issues:
1. Check the console for errors (F12 in browser)
2. Verify all dependencies are installed
3. Ensure you're using Node 18+
4. Review this guide and README.md

## Development Tips

- Use mobile viewport (390x844) for user screens
- Admin dashboard is desktop-optimized
- Mock data is in `/src/app/data/`
- All icons come from lucide-react
- Gradients follow the purple/pink brand theme

---

🎉 You're all set! Start building amazing features!
