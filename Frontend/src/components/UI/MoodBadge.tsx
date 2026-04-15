// src/components/UI/MoodBadge.tsx
import { getMoodColor } from '@/utils/moodColors';
import { cn } from '@/lib/utils';

type Props = {
  mood: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const MoodBadge = ({ mood, size = 'md', className }: Props) => {
  const { bg, text, label, emoji } = getMoodColor(mood);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      <span>{emoji}</span>
      {label}
    </span>
  );
};
