import api from './client';

export const getCurrentBattle = () =>
  api.get('/battles/current').then(r => r ?? null).catch(() => null);
export const getBattleHistory = () =>
  api.get('/battles/history').then(r => r ?? []).catch(() => []);
