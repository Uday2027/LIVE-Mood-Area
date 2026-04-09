// src/components/Charts/TrendChart.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getMoodColor, MOOD_COLORS, type Mood } from '@/utils/moodColors';
import type { MoodSnapshot } from '@/api/neighborhoods';

type Props = { snapshots: MoodSnapshot[] };

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const TrendChart = ({ snapshots }: Props) => {
  const moods = Object.keys(MOOD_COLORS) as Mood[];

  // Transform snapshot array into chart-friendly dataset
  const data = snapshots.map((s) => ({
    time:  formatTime(s.recordedAt),
    score: s.moodScore,
    mood:  s.dominantMood ?? 'Unknown',
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(val) => [`${Math.round(Number(val) * 100)}%`]}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {moods.map((mood) => (
          <Line
            key={mood}
            type="monotone"
            dataKey={mood}
            dot={false}
            stroke={getMoodColor(mood).bg}
            strokeWidth={2}
          />
        ))}
        <Line type="monotone" dataKey="score" dot={false} stroke="#6366f1" strokeWidth={2} name="Score" />
      </LineChart>
    </ResponsiveContainer>
  );
};
