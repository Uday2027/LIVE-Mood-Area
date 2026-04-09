// src/utils/formatters.ts

export const formatRelativeTime = (date: string | Date): string => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const formatScore = (score: number): string =>
  `${Math.round(score * 100)}%`;
