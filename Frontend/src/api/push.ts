import api from './client';

export const subscribePush = (subscription: any) => api.post('/push/subscribe', subscription);
