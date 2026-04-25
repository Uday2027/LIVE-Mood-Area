import api from './client';

export const sendVibeCheck = (receiverId: string) => api.post('/vibe-checks', { receiverId });
export const respondVibeCheck = (id: string, mood: string) => api.post(`/vibe-checks/${id}/respond`, { mood });
export const getPendingChecks = (): Promise<any[]> => api.get('/vibe-checks/pending');
