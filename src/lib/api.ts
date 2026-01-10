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
    login: async (data: { login: string; password: string }) => {
        const response = await api.post('/api/v1/users/auth/login', data);
        return response.data;
    },
};
