// src/utils/moodColors.ts

export type Mood = 'CHILL' | 'HYPE' | 'FOCUSED' | 'ROMANTIC' | 'SKETCHY' | 'NATURE' | 'STUDY' | 'FESTIVE' | 'RELAXING';

export type MoodColor = {
  bg: string;
  border: string;
  text: string;
  label: string;
  emoji: string;
  description: string;
};

export const MOOD_COLORS: Record<Mood, MoodColor> = {
  CHILL:    { bg: '#FEF08A', border: '#CA8A04', text: '#713F12', label: 'Chill',    emoji: '😌', description: 'Calm & relaxed' },
  HYPE:     { bg: '#FCA5A5', border: '#DC2626', text: '#7F1D1D', label: 'Hype',     emoji: '🔥', description: 'Energetic & loud' },
  FOCUSED:  { bg: '#86EFAC', border: '#16A34A', text: '#14532D', label: 'Focused',  emoji: '🎯', description: 'Work & study vibes' },
  ROMANTIC: { bg: '#93C5FD', border: '#2563EB', text: '#1E3A5F', label: 'Romantic', emoji: '💙', description: 'Date-night worthy' },
  SKETCHY:  { bg: '#FDBA74', border: '#EA580C', text: '#7C2D12', label: 'Sketchy',  emoji: '👀', description: 'Heads up nearby' },
  NATURE:   { bg: '#A7F3D0', border: '#059669', text: '#065F46', label: 'Nature',   emoji: '🍃', description: 'Fresh & green' },
  STUDY:    { bg: '#E9D5FF', border: '#7C3AED', text: '#581C87', label: 'Study',    emoji: '📚', description: 'Deep focus zone' },
  FESTIVE:  { bg: '#FBCFE8', border: '#DB2777', text: '#831843', label: 'Festive',  emoji: '🎉', description: 'Party mode on' },
  RELAXING: { bg: '#BFDBFE', border: '#3B82F6', text: '#1E3A8A', label: 'Relaxing', emoji: '☕', description: 'Easy going' },
};

// Alias for Prompt.md spec compatibility
export const MOODS = MOOD_COLORS;

export const getMoodColor = (mood: string): MoodColor =>
  MOOD_COLORS[mood as Mood] ?? MOOD_COLORS.CHILL;

export const getCredibilityStyle = (score: number): { opacity: number; ring: string } => {
  if (score >= 0.8) return { opacity: 1.0, ring: 'glow' };
  if (score >= 0.5) return { opacity: 0.85, ring: 'none' };
  if (score >= 0.3) return { opacity: 0.55, ring: 'none' };
  return { opacity: 0.30, ring: 'disputed' };
};

