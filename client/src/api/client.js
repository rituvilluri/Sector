import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,        // send session cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

// Global error interceptor — surface 401 as a known type
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      err.isUnauthorized = true;
    }
    return Promise.reject(err);
  }
);

export default api;
