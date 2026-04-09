// src/components/UI/CredibilityBar.tsx
import { cn } from '@/lib/utils';

type Props = { score: number; className?: string };

export const CredibilityBar = ({ score, className }: Props) => {
  const pct = Math.round(score * 100);
  const color =
    score < 0.3 ? 'bg-red-400'
    : score < 0.5 ? 'bg-orange-400'
    : score < 0.75 ? 'bg-yellow-400'
    : 'bg-green-400';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 rounded-full bg-gray-200">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{pct}%</span>
    </div>
  );
};
