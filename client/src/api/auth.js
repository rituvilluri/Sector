import api from './client';

export const getMe         = ()     => api.get('/auth/me');
export const login         = (data) => api.post('/auth/login', data);
export const signup        = (data) => api.post('/auth/signup', data);
export const logout        = ()     => api.post('/auth/logout');
export const googleLogin   = ()     => { window.location.href = '/api/auth/google'; };
export const updateProfile = (data) => api.put('/auth/profile', data);
export const deleteAccount = ()     => api.delete('/auth/account');
