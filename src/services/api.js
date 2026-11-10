import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Attach authorization JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ela_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const salesApi = {
  // Fetch entries for CENET, LOOP, or all logs
  getSales: async (systemType = null, filter = null) => {
    const params = {};
    if (systemType) params.systemType = systemType;
    if (filter) params.filter = filter;
    const res = await api.get('/sales', { params });
    return res.data;
  },

  // Create a new sales entry
  createSale: async (saleData) => {
    const res = await api.post('/sales', saleData);
    return res.data;
  },

  // Get KPI stats
  getStats: async () => {
    const res = await api.get('/sales/stats');
    return res.data;
  },

  // Simulate automated API sync
  importApi: async (systemType) => {
    const res = await api.post('/import/api', { systemType });
    return res.data;
  },

  // Upload file (Excel, CSV, PDF) for parsing
  importFile: async (file, systemType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('systemType', systemType);
    const res = await api.post('/import/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export const authApi = {
  getUsers: async () => {
    const res = await api.get('/auth/users');
    return res.data;
  },
  login: async (userId) => {
    const res = await api.post('/auth/login', { userId });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export default api;
