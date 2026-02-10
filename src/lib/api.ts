import axios from 'axios';

// TypeScript Interfaces for API Responses

export interface Transaction {
    id: number;
    transaction_id: string;
    reference: string;
    amount: string;
    payment_month: number | null;
    payment_year: number | null;
    status: 'pending' | 'success' | 'failed' | 'confirmed';
    created_at: string;
}

export interface DashboardData {
    total_contributed: number;
    target_amount: number;
    next_payment_date: string; // e.g. "April 2026" or "Year Complete"
    next_payment_amount: number;
    contributions_count: number;
    paid_months_indices: number[]; // e.g. [1, 2, 3] for Jan, Feb, Mar
    package_name: string;
    status: 'active' | 'inactive' | 'reserved';
}

export interface PackageStats {
    total_users: number;
    total_contributions: number;
    expected_total: number;
    avg_months_paid: number;
    progress_percentage: number;
    confirmed_transaction_count: number;
    declined_transaction_count: number;
}

export interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    monthly_contribution?: number;
    yearly_contribution?: number;
    gradient?: string;
    shadow_color?: string;
    stats?: PackageStats;
    // Add other fields as they are discovered
}

// Create a standard axios instance given the base URL.
export const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // We can add global error handling here later (e.g., token refresh, logging)
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Create a separate axios instance for Admin API
export const adminApi = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for Admin API (uses admin_auth_token)
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for Admin API
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Admin API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth API methods
export const auth = {

    getPackages: async () => {
        const response = await api.get('/api/v1/users/auth/packages');
        return response.data;
    },

    selectPackage: async (package_id: number, slots: number = 1) => {
        const response = await api.post('/api/v1/users/auth/select-package', { package_id, slots });
        return response.data;
    },
    completeRegistration: async (data: { name: string; phone: string; email: string; password?: string; state?: string }) => {
        const response = await api.post('/api/v1/users/auth/complete-registration', data);
        return response.data;
    },
    makeReservation: async (data: { name: string; phone: string; email: string; password?: string; state?: string }) => {
        const response = await api.post('/api/v1/users/auth/make-reservation', data);
        return response.data;
    },
    login: async (data: { login: string; password: string }) => {
        const response = await api.post('/api/v1/users/auth/login', data);
        return response.data;
    },

    forgotPassword: async (identifier: string) => {
        const response = await api.post('/api/v1/users/auth/forgot-password', { identifier });
        return response.data;
    },
    resetPassword: async (data: any) => {
        const response = await api.post('/api/v1/users/auth/reset-password', data);
        return response.data;
    },
};

// Payment API methods
export const payment = {
    initializeContribution: async () => {
        const response = await api.post('/api/v1/users/contribution');
        return response.data;
    },
    verifyContribution: async (reference: string) => {
        const response = await api.get(`/api/v1/users/contribution/verify?reference=${reference}`);
        return response.data;
    },
};

// Admin API methods
export const admin = {
    getDashboardStats: async () => {
        const response = await adminApi.get('/api/v1/admin/dashboard');
        return response.data;
    },
    triggerReminders: async () => {
        const response = await adminApi.post('/api/v1/admin/reminders/trigger');
        return response.data;
    },
    getUsers: async (params?: {
        page?: number;
        per_page?: number;
        package_id?: string;
        status?: string;
        payment_month?: number;
        payment_year?: number;
        completed_payments?: boolean;
        search?: string;
    }) => {
        const response = await adminApi.get('/api/v1/admin/users', { params });
        return response.data;
    },
    getPackages: async () => {
        const response = await adminApi.get('/api/v1/admin/packages');
        return response.data;
    },
    getPackageById: async (id: string) => {
        const response = await adminApi.get(`/api/v1/admin/packages/${id}`);
        return response.data;
    },
    getAnnouncements: async () => {
        const response = await adminApi.get('/api/v1/admin/announcements');
        return response.data;
    },
    createAnnouncement: async (data: any) => {
        const response = await adminApi.post('/api/v1/admin/announcements', data);
        return response.data;
    },
    updateAnnouncement: async (id: number, data: any) => {
        const response = await adminApi.put(`/api/v1/admin/announcements/${id}`, data);
        return response.data;
    },
    deleteAnnouncement: async (id: number) => {
        const response = await adminApi.delete(`/api/v1/admin/announcements/${id}`);
        return response.data;
    },
    createPackage: async (data: any) => {
        const response = await adminApi.post('/api/v1/admin/packages', data);
        return response.data;
    },
    updatePackage: async (id: string, data: any) => {
        const response = await adminApi.put(`/api/v1/admin/packages/${id}`, data);
        return response.data;
    },
    deletePackage: async (id: string) => {
        const response = await adminApi.delete(`/api/v1/admin/packages/${id}`);
        return response.data;
    },
    getTransactions: async (params?: { package_id?: string; status?: string; page?: number; per_page?: number; search?: string; month?: string }) => {
        const response = await adminApi.get('/api/v1/admin/transactions', { params });
        return response.data;
    },
    approveTransaction: async (id: string) => {
        const response = await adminApi.post(`/api/v1/admin/transactions/${id}/approve`);
        return response.data;
    },
    declineTransaction: async (id: string) => {
        const response = await adminApi.post(`/api/v1/admin/transactions/${id}/decline`);
        return response.data;
    },
    createUser: async (data: any) => {
        const response = await adminApi.post('/api/v1/admin/users', data);
        return response.data;
    },
    updateUser: async (id: number, data: any) => {
        const response = await adminApi.put(`/api/v1/admin/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await adminApi.delete(`/api/v1/admin/users/${id}`);
        return response.data;
    },
    getReservedUsers: async (params?: { page?: number; per_page?: number }) => {
        const response = await adminApi.get('/api/v1/admin/users/reserved', { params });
        return response.data;
    },
    suspendUser: async (id: number) => {
        const response = await adminApi.post(`/api/v1/admin/users/${id}/suspend`);
        return response.data;
    },
    activateUser: async (id: number) => {
        const response = await adminApi.post(`/api/v1/admin/users/${id}/activate`);
        return response.data;
    },
    changeUserPassword: async (id: number, password: string) => {
        const response = await adminApi.post(`/api/v1/admin/users/${id}/change-password`, { password });
        return response.data;
    },
    getDeliveryFees: async () => {
        const response = await adminApi.get('/api/v1/admin/delivery-fees');
        return response.data;
    },
    createDeliveryFee: async (data: { state: string; fee: number }) => {
        const response = await adminApi.post('/api/v1/admin/delivery-fees', data);
        return response.data;
    },
    updateDeliveryFee: async (id: number, data: { state?: string; fee?: number }) => {
        const response = await adminApi.put(`/api/v1/admin/delivery-fees/${id}`, data);
        return response.data;
    },
    deleteDeliveryFee: async (id: number) => {
        const response = await adminApi.delete(`/api/v1/admin/delivery-fees/${id}`);
        return response.data;
    },
    getDeliveryTransactions: async (params?: { page?: number; status?: string }) => {
        const response = await adminApi.get('/api/v1/admin/transactions/delivery', { params });
        return response.data;
    },
};

// Add profile update method to user object
export const user = {
    getDashboard: async () => {
        const response = await api.get('/api/v1/users/dashboard');
        return response.data;
    },
    updateProfile: async (data: { name: string; phone: string; state?: string }) => {
        const response = await api.put('/api/v1/users/profile', data);
        return response.data;
    },
    getTransactions: async () => {
        const response = await api.get('/api/v1/users/transactions');
        return response.data;
    },
    getNotifications: async () => {
        const response = await api.get('/api/v1/users/notifications');
        return response.data;
    },
    getDeliveryFees: async () => {
        const response = await api.get('/api/v1/users/delivery/fees');
        return response.data;
    },
    getDeliverySettings: async () => {
        const response = await api.get('/api/v1/users/delivery-settings');
        return response.data;
    },
    saveDeliverySettings: async (data: any) => {
        const response = await api.post('/api/v1/users/delivery-settings', data);
        return response.data;
    },
    getPaymentReminderStatus: async () => {
        const response = await api.get('/api/v1/users/settings/payment-reminder-status');
        return response.data;
    },
    togglePaymentReminder: async () => {
        const response = await api.post('/api/v1/users/settings/toggle-payment-reminder');
        return response.data;
    },
    verifyPackage: async (formData: FormData) => {
        const response = await api.post('/api/v1/users/package/verify', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    initiateDeliveryPayment: async (state: string) => {
        const response = await api.post('/api/v1/users/delivery/pay', { state });
        return response.data;
    },
    verifyDeliveryPayment: async (reference: string) => {
        const response = await api.get(`/api/v1/users/delivery/verify?reference=${reference}`);
        return response.data;
    },
};
