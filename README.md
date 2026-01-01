# Dirty December - Nigerian Contribution & Bulk-Buying Platform

A modern PWA-style mobile-first platform where users contribute monthly and receive bulk-purchased provisions in December at significant savings (30%+ value).

## 🎯 Features

### User Features
- **Landing Page** - Beautiful gradient hero with testimonials and partner logos
- **Authentication** - Simple login/signup flow
- **Onboarding** - Multi-step package selection with smooth transitions
- **Dashboard** - Overview of contributions, package status, and delivery preferences
- **Contribution Screen** - Bank transfer details with proof of payment upload
- **Value Preview** - Visual breakdown of savings and package contents
- **Announcements** - Community updates and notifications
- **Delivery Management** - Set pickup/delivery preferences

### Admin Features
- **Admin Dashboard** - Comprehensive overview of all platform metrics
- **User Management** - View and manage all users with filtering capabilities
- **Package Management** - Create, edit, and manage subscription packages
- **Contributions Management** - Review, approve, or decline user contributions with proof of payment
- **Announcements Management** - Create and manage platform announcements
- **Package Details View** - Deep dive into specific package performance
- **Delivery Management** - View user delivery preferences and filter by type

## 🎨 Design System

### Color Scheme
- **Primary Gradients**: Purple/Indigo/Pink (`from-indigo-600 via-purple-600 to-pink-600`)
- **Secondary Gradients**: Emerald/Teal, Amber/Orange
- **Background**: Slate gray (`bg-slate-50`)
- **Success Actions**: Emerald/Teal (`from-emerald-600 to-teal-600`)
- **Text**: Professional slate/gray tones

### Typography
- Professional bank-app inspired design
- Custom font sizing via `/src/styles/theme.css`
- No inline Tailwind font classes (managed via theme)

## 📦 Package Tiers

1. **Basic Bundle** - ₦5,000/month (₦60,000/year)
   - Estimated retail value: ₦85,700
   - Savings: 43%

2. **Family Bundle** - ₦15,000/month (₦180,000/year) *POPULAR*
   - Estimated retail value: ₦257,100
   - Savings: 43%

3. **Premium Bundle** - ₦50,000/month (₦600,000/year) *BEST VALUE*
   - Estimated retail value: ₦857,000
   - Savings: 43%

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd dirty-december
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The build output will be in the `dist` folder.

## 📱 Mobile-First Design

This application is strictly mobile-first with a viewport width of **360-430px**. For the best experience:
- Use mobile device or browser DevTools in mobile mode
- Recommended viewport: 390px x 844px (iPhone 12/13/14 Pro)

## 🗂️ Project Structure

```
dirty-december/
├── src/
│   ├── app/
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── views/               # Admin view components
│   │   │   │   ├── DashboardOverview.tsx
│   │   │   │   ├── UsersManagement.tsx
│   │   │   │   ├── PackagesManagement.tsx
│   │   │   │   ├── PackageDetailsView.tsx
│   │   │   │   ├── ContributionsView.tsx
│   │   │   │   └── AnnouncementsManagement.tsx
│   │   │   ├── components/          # Admin components
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── AdminLogin.tsx
│   │   ├── components/              # Shared components
│   │   │   ├── ui/                  # Shadcn UI components
│   │   │   ├── Card.tsx
│   │   │   ├── GradientButton.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── DeliveryInfoModal.tsx
│   │   │   └── TransactionDrawer.tsx
│   │   ├── data/                    # Data models and mock data
│   │   │   ├── packages.ts
│   │   │   ├── mockData.ts
│   │   │   └── partners.ts
│   │   ├── screens/                 # User-facing screens
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Contribute.tsx
│   │   │   ├── ValuePreview.tsx
│   │   │   ├── Announcements.tsx
│   │   │   └── CatchUpPayment.tsx
│   │   └── App.tsx                  # Main app component
│   └── styles/
│       ├── index.css               # Main CSS entry
│       ├── tailwind.css            # Tailwind imports
│       ├── theme.css               # Theme tokens
│       └── fonts.css               # Font imports
├── package.json
├── vite.config.ts
└── README.md
```

## 🔑 Key Files

### `/src/app/App.tsx`
Main application component managing routing and state

### `/src/app/data/packages.ts`
Package definitions and utilities:
- `packages` - Array of all package data
- `getPackageById()` - Retrieve package by ID
- `calculateProportionalPackageValue()` - Calculate value based on months paid

### `/src/app/admin/AdminDashboard.tsx`
Admin portal with full navigation and view management

### `/src/styles/theme.css`
Contains all design tokens and typography rules. DO NOT use Tailwind font classes in components.

## 🎭 Admin Access

To access the admin dashboard:
1. Click "Admin Access" on the landing page footer
2. Enter admin credentials (currently mock auth)
3. Navigate through admin views using the sidebar

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Utility-first CSS
- **Lucide React** - Icon library
- **Motion/React** - Animations
- **React Router DOM** - Routing
- **Recharts** - Charts and graphs
- **React Hook Form** - Form management

## 📝 Development Notes

### Adding New Packages
Edit `/src/app/data/packages.ts`:

```typescript
export const packages: Package[] = [
  {
    id: 'new-package',
    name: 'New Package',
    monthlyAmount: 10000,
    yearlyTotal: 120000,
    estimatedRetailValue: 180000,
    savings: 60000,
    savingsPercent: 50,
    description: 'Package description',
    benefits: ['Benefit 1', 'Benefit 2'],
    detailedBenefits: [...],
    gradient: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/30'
  }
];
```

### Modifying Mock Data
Edit `/src/app/data/mockData.ts` for:
- Contribution history
- Announcements
- Chat messages

### Styling Guidelines
- Use existing Tailwind classes for layout and spacing
- DO NOT use font size/weight classes (`text-xl`, `font-bold`)
- Typography is managed via `/src/styles/theme.css`
- Use gradient utilities for brand colors
- Maintain mobile-first (max-w-[430px]) for user screens
- Admin dashboard is responsive (desktop-optimized)

## 🔄 Contribution Workflow

### User Flow
1. User makes bank transfer
2. User uploads proof of payment on Contribute screen
3. Contribution shows as "pending" on dashboard

### Admin Flow
1. Admin navigates to Package Details
2. Clicks "View Contributions"
3. Reviews payment proof
4. Approves or declines contribution
5. Status updates on user dashboard

## 📊 Admin Dashboard Features

### Dashboard Overview
- Total contributions, users, and revenue metrics
- Package performance breakdown
- Recent activity feed
- Quick access to packages

### Users Management
- Complete user list with search and filter
- User status (Active/Reserved/Inactive)
- Package assignments
- Contribution history per user
- Delivery preferences

### Package Management
- Create/edit/view packages
- Detailed benefit configuration
- Package performance metrics
- User assignments per package

### Contributions Management
- View all contributions per package
- Filter by status (pending/confirmed/declined)
- View payment proofs
- Approve/decline with one click
- Transaction details

### Delivery Management
- Filter users by delivery type (Pickup/Delivery)
- View complete addresses
- Export delivery information

## 🚧 Future Enhancements

- [ ] Backend API integration
- [ ] Real payment gateway (Paystack/Flutterwave)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Export user data to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Multi-admin roles and permissions
- [ ] Real-time chat support
- [ ] PWA offline capabilities

## 📄 License

Private project - All rights reserved

## 👥 Support

For questions or issues, contact the development team.

---

Built with ❤️ for the Nigerian community
