// src/components/Charts/TrendChart.tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getMoodColor } from '@/utils/moodColors';
import type { MoodSnapshot } from '@/api/neighborhoods';

type Props = { snapshots: MoodSnapshot[] };

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const TrendChart = ({ snapshots }: Props) => {
  // Transform snapshot array into chart-friendly dataset
  const data = snapshots.map((s) => ({
    time:  formatTime(s.recordedAt),
    score: s.moodScore,
    mood:  s.dominantMood,
    pinCount: s.pinCount,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: '#9ca3af' }} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            domain={[0, 1]} 
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`} 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const moodInfo = getMoodColor(item.mood || 'CHILL');
                return (
                  <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.time}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-lg">{moodInfo.emoji}</span>
                       <div>
                         <p className="text-xs font-bold text-gray-900">{moodInfo.label}</p>
                         <p className="text-[10px] text-gray-500">{item.pinCount} active pins</p>
                       </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-500" 
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">
                        {Math.round(item.score * 100)}%
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
