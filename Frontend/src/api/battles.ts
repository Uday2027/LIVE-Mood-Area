import api from './client';

export const getCurrentBattle = () => api.get('/battles/current').then(r => r.data);
export const getBattleHistory = () => api.get('/battles/history').then(r => r.data);
