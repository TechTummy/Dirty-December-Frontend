import axios from 'axios';

// Create a standard axios instance given the base URL.
// We'll update the baseURL once the user provides it.
export const api = axios.create({
    baseURL: '/', // Use proxy in development
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

// Auth API methods
export const auth = {
    sendOtp: async (phone: string) => {
        const response = await api.post('/api/v1/users/auth/send-otp', { phone });
        return response.data;
    },
    verifyOtp: async (phone: string, code: string) => {
        const response = await api.post('/api/v1/users/auth/verify-otp', { phone, code });
        return response.data;
    },
    selectPackage: async (registration_token: string, package_id: number) => {
        const response = await api.post('/api/v1/users/auth/select-package', { registration_token, package_id });
        return response.data;
    },
    completeRegistration: async (data: { registration_token: string; name: string; phone: string; email: string; password?: string }) => {
        const response = await api.post('/api/v1/users/auth/complete-registration', data);
        return response.data;
    },
    makeReservation: async (data: { registration_token: string; name: string; phone: string; email: string; password?: string }) => {
        const response = await api.post('/api/v1/users/auth/make-reservation', data);
        return response.data;
    },
    login: async (data: { login: string; password: string }) => {
        const response = await api.post('/api/v1/users/auth/login', data);
        return response.data;
    },
    selectSlot: async (registration_token: string, slots: number) => {
        const response = await api.post('/api/v1/users/auth/select-slot', { registration_token, slots });
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
        const response = await api.get('/api/v1/admin/dashboard');
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/api/v1/admin/users');
        return response.data;
    },
    getPackages: async () => {
        const response = await api.get('/api/v1/admin/packages');
        return response.data;
    },
    getPackageById: async (id: string) => {
        const response = await api.get(`/api/v1/admin/packages/${id}`);
        return response.data;
    },
    getAnnouncements: async () => {
        const response = await api.get('/api/v1/admin/announcements');
        return response.data;
    },
    createAnnouncement: async (data: any) => {
        const response = await api.post('/api/v1/admin/announcements', data);
        return response.data;
    },
    updateAnnouncement: async (id: number, data: any) => {
        const response = await api.put(`/api/v1/admin/announcements/${id}`, data);
        return response.data;
    },
    deleteAnnouncement: async (id: number) => {
        const response = await api.delete(`/api/v1/admin/announcements/${id}`);
        return response.data;
    },
    createPackage: async (data: any) => {
        const response = await api.post('/api/v1/admin/packages', data);
        return response.data;
    },
    updatePackage: async (id: string, data: any) => {
        const response = await api.put(`/api/v1/admin/packages/${id}`, data);
        return response.data;
    },
    getTransactions: async (params?: { package_id?: string; status?: string }) => {
        const response = await api.get('/api/v1/admin/transactions', { params });
        return response.data;
    },
    approveTransaction: async (id: string) => {
        const response = await api.post(`/api/v1/admin/transactions/${id}/approve`);
        return response.data;
    },
    declineTransaction: async (id: string) => {
        const response = await api.post(`/api/v1/admin/transactions/${id}/decline`);
        return response.data;
    },
    createUser: async (data: any) => {
        const response = await api.post('/api/v1/admin/users', data);
        return response.data;
    },
    updateUser: async (id: number, data: any) => {
        const response = await api.put(`/api/v1/admin/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/api/v1/admin/users/${id}`);
        return response.data;
    },
    getReservedUsers: async () => {
        const response = await api.get('/api/v1/admin/users/reserved');
        return response.data;
    },
    suspendUser: async (id: number) => {
        const response = await api.post(`/api/v1/admin/users/${id}/suspend`);
        return response.data;
    },
    activateUser: async (id: number) => {
        const response = await api.post(`/api/v1/admin/users/${id}/activate`);
        return response.data;
    },
    changeUserPassword: async (id: number, password: string) => {
        const response = await api.post(`/api/v1/admin/users/${id}/change-password`, { password });
        return response.data;
    },
};

// Add profile update method to user object
export const user = {
    getDashboard: async () => {
        const response = await api.get('/api/v1/users/dashboard');
        return response.data;
    },
    updateProfile: async (data: { name: string; phone: string }) => {
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
    getDeliverySettings: async () => {
        const response = await api.get('/api/v1/users/delivery-settings');
        return response.data;
    },
    saveDeliverySettings: async (data: any) => {
        const response = await api.post('/api/v1/users/delivery-settings', data);
        return response.data;
    },
};
