// src/components/PinForm/MoodSelector.tsx
import { getMoodColor, type Mood } from '@/utils/moodColors';
import { cn } from '@/lib/utils';

const MOODS: Mood[] = ['CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY'];

type Props = {
  value: Mood | null;
  onChange: (mood: Mood) => void;
};

export const MoodSelector = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap gap-2">
    {MOODS.map((mood) => {
      const { bg, text, label, emoji } = getMoodColor(mood);
      const selected = value === mood;
      return (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
            selected ? 'ring-2 ring-offset-1 scale-105' : 'opacity-70 hover:opacity-100',
          )}
          style={{
            backgroundColor: bg,
            color: text,
          }}
        >
          <span>{emoji}</span>
          {label}
        </button>
      );
    })}
  </div>
);
