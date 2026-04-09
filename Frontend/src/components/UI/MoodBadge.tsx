// src/components/UI/MoodBadge.tsx
import { getMoodColor } from '@/utils/moodColors';
import { cn } from '@/lib/utils';

type Props = {
  mood: string;
  className?: string;
};

export const MoodBadge = ({ mood, className }: Props) => {
  const { bg, text, label, emoji } = getMoodColor(mood);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      <span>{emoji}</span>
      {label}
    </span>
  );
};
