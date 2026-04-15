// src/components/Charts/MoodDistributionChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOOD_COLORS } from '@/utils/moodColors';
import type { Pin } from '@/api/pins';
import { useMemo } from 'react';

type Props = { pins: Pin[] };

export const MoodDistributionChart = ({ pins }: Props) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    pins.forEach((p) => {
      counts[p.mood] = (counts[p.mood] || 0) + 1;
    });

    return Object.entries(MOOD_COLORS).map(([key, config]) => ({
      name: config.label,
      value: counts[key] || 0,
      color: config.bg,
    })).filter((d) => d.value > 0);
  }, [pins]);

  if (data.length === 0) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
              padding: '8px 12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
