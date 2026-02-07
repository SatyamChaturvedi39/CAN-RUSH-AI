import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// Vendor API
export const vendorAPI = {
    getAll: () => api.get('/vendors'),
    getById: (id) => api.get(`/vendors/${id}`),
    toggleStatus: (id) => api.put(`/vendors/${id}/status`),
    getStats: (id) => api.get(`/vendors/${id}/stats`)
};

// Food API
export const foodAPI = {
    getAll: () => api.get('/foods'),
    getByVendor: (vendorId) => api.get(`/foods/vendor/${vendorId}`),
    create: (data) => api.post('/foods', data),
    update: (id, data) => api.put(`/foods/${id}`, data),
    toggleAvailability: (id) => api.put(`/foods/${id}/availability`),
    delete: (id) => api.delete(`/foods/${id}`)
};

// Order API
export const orderAPI = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getVendorQueue: () => api.get('/orders/vendor/queue'),
    getById: (id) => api.get(`/orders/${id}`),
    accept: (id) => api.put(`/orders/${id}/accept`),
    markPreparing: (id) => api.put(`/orders/${id}/preparing`),
    markReady: (id) => api.put(`/orders/${id}/ready`),
    complete: (id) => api.put(`/orders/${id}/complete`),
    cancel: (id) => api.put(`/orders/${id}/cancel`)
};

// Admin API
export const adminAPI = {
    getPenalties: () => api.get('/admin/penalties'),
    clearPenalty: (id) => api.put(`/admin/penalties/${id}/clear`),
    unblockUser: (id, data) => api.post(`/admin/users/${id}/unblock`, data),
    getAnalytics: () => api.get('/admin/analytics')
};

export default api;
