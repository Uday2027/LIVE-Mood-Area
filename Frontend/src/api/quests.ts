import api from './client';

export const getActiveQuest = () =>
  api.get('/quests/today').then(r => r ?? null).catch(() => null);
export const checkQuestCompletion = (id: string) =>
  api.get(`/quests/${id}/progress`).then(r => r ?? null).catch(() => null);
