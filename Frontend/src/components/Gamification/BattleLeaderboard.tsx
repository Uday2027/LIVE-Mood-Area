// src/components/Gamification/BattleLeaderboard.tsx
import { useState, useEffect } from 'react';
import { Swords, Trophy, Timer } from 'lucide-react';
import api from '@/api/client';
import { motion } from 'framer-motion';

type Battle = {
  title: string;
  endTime: string;
  scores: {
    neighborhood: { name: string };
    score: number;
    neighborhoodId: string;
  }[];
};

export function BattleLeaderboard() {
  const [battle, setBattle] = useState<Battle | null>(null);

  useEffect(() => {
    api.get('/battles/current')
      .then((res: any) => setBattle(res))
      .catch(() => {});
  }, []);

  if (!battle || battle.scores.length === 0) return null;

  const timeLeft = new Date(battle.endTime).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30">
            <Swords className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">Vibe Battle</h3>
            <p className="text-[10px] text-slate-400 mt-1">{battle.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300 ring-1 ring-white/10">
          <Timer className="size-3" />
          {daysLeft}d left
        </div>
      </div>

      <div className="space-y-2">
        {battle.scores.slice(0, 3).map((score, i) => (
          <motion.div
            key={score.neighborhoodId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 ring-1 ring-white/5"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                i === 1 ? 'bg-slate-300/20 text-slate-300' : 
                'bg-orange-600/20 text-orange-500'
              }`}>
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-slate-200">{score.neighborhood.neighborhood.name}</span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-blue-400">
              {score.score.toLocaleString()} pts
              {i === 0 && <Trophy className="size-3 text-yellow-500" />}
            </div>
          </motion.div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-xl bg-white/5 py-2 text-[10px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all">
        VIEW FULL LEADERBOARD
      </button>
    </div>
  );
}
