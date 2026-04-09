// src/utils/moodColors.ts

export type Mood = 'CHILL' | 'HYPE' | 'FOCUSED' | 'ROMANTIC' | 'SKETCHY' | 'NATURE' | 'STUDY' | 'FESTIVE' | 'RELAXING';

export type MoodColor = {
  bg: string;
  text: string;
  label: string;
  emoji: string;
};

export const MOOD_COLORS: Record<Mood, MoodColor> = {
  CHILL:    { bg: '#FEF08A', text: '#713F12', label: 'Chill',    emoji: '😌' },
  HYPE:     { bg: '#FCA5A5', text: '#7F1D1D', label: 'Hype',     emoji: '🔥' },
  FOCUSED:  { bg: '#86EFAC', text: '#14532D', label: 'Focused',  emoji: '🎯' },
  ROMANTIC: { bg: '#93C5FD', text: '#1E3A5F', label: 'Romantic', emoji: '💙' },
  SKETCHY:  { bg: '#FDBA74', text: '#7C2D12', label: 'Sketchy',  emoji: '👀' },
  NATURE:   { bg: '#A7F3D0', text: '#065F46', label: 'Nature',   emoji: '🍃' },
  STUDY:    { bg: '#E9D5FF', text: '#581C87', label: 'Study',    emoji: '📚' },
  FESTIVE:  { bg: '#FBCFE8', text: '#831843', label: 'Festive',  emoji: '🎉' },
  RELAXING: { bg: '#BFDBFE', text: '#1E3A8A', label: 'Relaxing', emoji: '☕' },
};

export const getMoodColor = (mood: string): MoodColor =>
  MOOD_COLORS[mood as Mood] ?? MOOD_COLORS.CHILL;
