import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' }, timeout: 30000 });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r.data,  // Returns { success, data, message, pagination }
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        try {
          const res = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
          const { accessToken, refreshToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          orig.headers.Authorization = `Bearer ${accessToken}`;
          return api(orig);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
