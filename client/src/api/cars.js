import api from './client';

export const getCars         = ()         => api.get('/cars');
export const createCar       = (data)     => api.post('/cars', data);
export const updateCar       = (id, data) => api.put(`/cars/${id}`, data);
export const deleteCar       = (id)       => api.delete(`/cars/${id}`);
export const uploadCarPhoto  = (id, file) => {
  const fd = new FormData();
  fd.append('photo', file);
  return api.post(`/cars/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
