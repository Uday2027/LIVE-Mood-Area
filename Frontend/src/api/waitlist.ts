import api from './client';

export const joinWaitlist = (data: { email: string; city: string; referredBy?: string }) => api.post('/waitlist', data);
export const getWaitlistStats = () => api.get('/waitlist/stats');
