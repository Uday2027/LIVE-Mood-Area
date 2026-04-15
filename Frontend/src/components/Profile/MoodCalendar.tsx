// src/components/Profile/MoodCalendar.tsx
import { useMemo } from 'react';
import { getMoodColor, type Mood } from '@/utils/moodColors';

export type DayHistory = {
  date: string; // YYYY-MM-DD
  dominantMood: Mood | null;
  pinCount: number;
};

type Props = {
  history: DayHistory[];
};

export const MoodCalendar = ({ history }: Props) => {
  // Generate last 90 days
  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = history.find(h => h.date === dateStr);
      result.push({
        date: dateStr,
        dominantMood: match?.dominantMood || null,
        pinCount: match?.pinCount || 0
      });
    }
    return result;
  }, [history]);

  // Group into weeks for the grid
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-2">
       <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
         {weeks.map((week, wIdx) => (
           <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => {
                 return (
                   <div 
                     key={day.date} 
                     className={`size-3 lg:size-4 rounded-sm transition-all hover:scale-125 hover:z-10 ${day.dominantMood ? '' : 'bg-white/5'}`}
                     style={day.dominantMood ? { backgroundColor: getMoodColor(day.dominantMood).text } : undefined}
                     title={`${day.date}: ${day.pinCount} pins${day.dominantMood ? ` (${day.dominantMood})` : ''}`}
                   />
                 );
              })}
           </div>
         ))}
       </div>
    </div>
  );
};
