import api from './client';

export const getNearbyEvents = (lat: number, lng: number) => api.get('/events/nearby', { params: { lat, lng } }).then(r => r.data);
