# API Integration Guide - Dirty December Platform

This guide explains how to integrate the Dirty December frontend with a backend API.

## Overview

Currently, the application uses mock data stored in `/src/app/data/mockData.ts` and `/src/app/data/packages.ts`. This guide will help you replace mock data with real API calls.

## Recommended Backend Stack

- **Node.js + Express** with PostgreSQL
- **Django + DRF** with PostgreSQL
- **Laravel** with MySQL
- **Supabase** (PostgreSQL with built-in Auth and Storage)
- **Firebase** (NoSQL alternative)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, reserved, inactive
  package_id UUID REFERENCES packages(id),
  delivery_type VARCHAR(20) DEFAULT 'pickup', -- pickup, delivery
  delivery_address TEXT,
  delivery_state VARCHAR(100),
  delivery_lga VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Packages Table
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  yearly_total DECIMAL(10, 2) NOT NULL,
  estimated_retail_value DECIMAL(10, 2) NOT NULL,
  savings DECIMAL(10, 2) NOT NULL,
  savings_percent INTEGER NOT NULL,
  benefits JSONB, -- Array of benefit strings
  detailed_benefits JSONB, -- Array of benefit objects
  gradient VARCHAR(100),
  shadow_color VARCHAR(100),
  badge VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Contributions Table
```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  package_id UUID REFERENCES packages(id),
  month VARCHAR(20) NOT NULL, -- January, February, etc.
  year INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, declined
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50), -- Bank Transfer, Card, USSD
  reference VARCHAR(100),
  proof_url TEXT, -- URL to payment proof image
  admin_notes TEXT,
  confirmed_by UUID REFERENCES admin_users(id),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Announcements Table
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "phone": "08012345678",
  "full_name": "John Doe",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
User login
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "package_id": "uuid",
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/admin/login
Admin login
```json
Request:
{
  "email": "admin@dirtydecember.com",
  "password": "adminpassword123"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@dirtydecember.com",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

### User Endpoints

#### GET /api/user/profile
Get user profile
```json
Headers: { "Authorization": "Bearer jwt_token" }

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "08012345678",
    "status": "active",
    "package": {
      "id": "uuid",
      "name": "Family Bundle",
      "monthly_amount": 15000
    },
    "delivery_type": "delivery",
    "delivery_address": "Full address here"
  }
}
```

#### PUT /api/user/delivery
Update delivery preferences
```json
Request:
{
  "delivery_type": "delivery",
  "delivery_address": "123 Main Street",
  "delivery_state": "Lagos",
  "delivery_lga": "Ikeja"
}

Response:
{
  "success": true,
  "message": "Delivery preferences updated"
}
```

#### GET /api/user/contributions
Get user's contribution history
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "month": "January",
      "amount": 15000,
      "status": "confirmed",
      "date": "2024-01-15",
      "transaction_id": "DD-2024-JAN-001542"
    }
  ]
}
```

### Package Endpoints

#### GET /api/packages
Get all packages
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Basic Bundle",
      "monthly_amount": 5000,
      "yearly_total": 60000,
      "estimated_retail_value": 85700,
      "savings": 25700,
      "savings_percent": 43,
      "benefits": ["Premium Rice (25kg)", "..."],
      "detailed_benefits": [...]
    }
  ]
}
```

#### GET /api/packages/:id
Get package by ID
```json
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Family Bundle",
    "monthly_amount": 15000,
    ...
  }
}
```

### Contribution Endpoints

#### POST /api/contributions
Create a new contribution
```json
Request:
{
  "package_id": "uuid",
  "month": "January",
  "year": 2024,
  "amount": 15000,
  "payment_method": "Bank Transfer",
  "reference": "FLW-234891234",
  "proof": "base64_image_or_file"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "transaction_id": "DD-2024-JAN-001542",
    "status": "pending",
    "proof_url": "https://storage.example.com/proofs/uuid.jpg"
  }
}
```

#### GET /api/contributions/:id
Get contribution details
```json
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "user@example.com"
    },
    "month": "January",
    "amount": 15000,
    "status": "pending",
    "proof_url": "https://..."
  }
}
```

### Admin Endpoints

#### GET /api/admin/dashboard/stats
Get dashboard statistics
```json
Headers: { "Authorization": "Bearer admin_jwt_token" }

Response:
{
  "success": true,
  "data": {
    "total_users": 1247,
    "active_users": 1089,
    "total_contributions": 18705000,
    "total_packages": 3,
    "pending_contributions": 45,
    "monthly_growth": 12.5
  }
}
```

#### GET /api/admin/users
Get all users (with pagination and filtering)
```json
Query params: ?page=1&limit=50&status=active&package=uuid

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1247,
      "pages": 25
    }
  }
}
```

#### GET /api/admin/contributions
Get all contributions (with filtering)
```json
Query params: ?status=pending&package_id=uuid

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { "full_name": "John Doe", ... },
      "amount": 15000,
      "status": "pending",
      "proof_url": "https://...",
      "created_at": "2024-01-15T14:23:00Z"
    }
  ]
}
```

#### PUT /api/admin/contributions/:id/approve
Approve a contribution
```json
Request:
{
  "admin_notes": "Verified payment proof"
}

Response:
{
  "success": true,
  "message": "Contribution approved"
}
```

#### PUT /api/admin/contributions/:id/decline
Decline a contribution
```json
Request:
{
  "admin_notes": "Invalid payment proof"
}

Response:
{
  "success": true,
  "message": "Contribution declined"
}
```

#### POST /api/admin/announcements
Create announcement
```json
Request:
{
  "title": "December Distribution Date Set!",
  "message": "Provisions will be distributed on December 20th...",
  "priority": "high",
  "is_published": true
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "December Distribution Date Set!",
    "created_at": "2024-11-25T10:00:00Z"
  }
}
```

## Frontend Integration

### Step 1: Create API Service

Create `/src/app/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateDelivery(data: any) {
    return this.request('/user/delivery', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserContributions() {
    return this.request('/user/contributions');
  }

  // Packages
  async getPackages() {
    return this.request('/packages');
  }

  async getPackageById(id: string) {
    return this.request(`/packages/${id}`);
  }

  // Contributions
  async createContribution(data: any) {
    return this.request('/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getAllUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  async getContributions(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/contributions?${query}`);
  }

  async approveContribution(id: string, notes?: string) {
    return this.request(`/admin/contributions/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ admin_notes: notes }),
    });
  }

  async declineContribution(id: string, notes?: string) {
    return this.request(`/admin/contributions/${id}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ admin_notes: notes }),
    });
  }

  async createAnnouncement(data: any) {
    return this.request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
```

### Step 2: Update Components

Example: Update `Dashboard.tsx` to use API:

```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function Dashboard({ ... }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.getUserContributions();
        setContributions(response.data);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Rest of component...
}
```

### Step 3: Handle File Uploads

For payment proof uploads, use FormData:

```typescript
async function uploadProofOfPayment(file: File, contributionData: any) {
  const formData = new FormData();
  formData.append('proof', file);
  formData.append('package_id', contributionData.package_id);
  formData.append('month', contributionData.month);
  formData.append('amount', contributionData.amount.toString());
  
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_URL}/contributions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
}
```

## Payment Gateway Integration

### Paystack Integration

1. Install Paystack SDK:
```bash
npm install react-paystack
```

2. Initialize payment:
```typescript
import { PaystackButton } from 'react-paystack';

const config = {
  reference: new Date().getTime().toString(),
  email: user.email,
  amount: 15000 * 100, // Amount in kobo
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
};

const onSuccess = (reference: any) => {
  // Submit contribution with reference
  api.createContribution({
    package_id: selectedPackage.id,
    amount: 15000,
    payment_method: 'Card',
    reference: reference.reference,
  });
};

<PaystackButton {...config} onSuccess={onSuccess} />
```

## Storage for Payment Proofs

### Using Supabase Storage

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function uploadProof(file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

## Environment Variables

Create `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Supabase (if using)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxx

# Feature Flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_CHAT=false
```

## Testing the Integration

1. Start your backend server
2. Update `.env` with correct API URL
3. Test each endpoint with Postman/Insomnia
4. Update frontend components one by one
5. Test user flows end-to-end

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate JWT tokens** on every request
3. **Sanitize user inputs** before saving
4. **Use environment variables** for sensitive data
5. **Implement rate limiting** on API endpoints
6. **Hash passwords** with bcrypt (cost factor 12+)
7. **Validate file uploads** (type, size, content)
8. **Use CORS properly** to restrict origins

## Next Steps

1. Set up your backend with chosen stack
2. Implement authentication endpoints
3. Create database tables
4. Build API endpoints
5. Integrate payment gateway
6. Set up file storage
7. Update frontend to use API
8. Test thoroughly
9. Deploy!

---

Good luck with your integration! 🚀
