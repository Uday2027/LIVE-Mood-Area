import api from './client';

export const getProfile = () => api.get('/users/me');
export const updateProfile = (data: { bio?: string; avatarUrl?: string }) => api.put('/users/me', data);
export const toggleGhostMode = () => api.post('/users/me/ghost');
export const getUserPins = (cursor?: string) => api.get('/users/me/pins', { params: { cursor } });
export const getUserMoodHistory = () => api.get('/users/me/history');
export const getUserDiary = (): Promise<any[]> => api.get('/users/me/diary');
export const getPublicProfile = (id: string) => api.get(`/users/${id}`);
