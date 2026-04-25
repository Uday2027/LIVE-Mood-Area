import api from './client';

export const getActiveQuest = () => api.get('/quests/today').then(r => r.data);
export const checkQuestCompletion = (id: string) => api.get(`/quests/${id}/progress`).then(r => r.data);
