import { useQuery } from '@tanstack/react-query';
import { getCurrentBattle, getBattleHistory } from '@/api/battles';
import { Sword, Crown, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';

export const BattleLeaderboard = () => {
  const { data: currentBattle, isLoading: currentLoading } = useQuery({
    queryKey: ['currentBattle'],
    queryFn: getCurrentBattle,
  });

  const { data: history } = useQuery({
    queryKey: ['battleHistory'],
    queryFn: getBattleHistory,
  });

  if (currentLoading || !currentBattle) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-900/50 border border-white/5">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const sortedScores = [...(currentBattle.scores || [])].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Live Battle Card */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Neighborhood Battle</h2>
          </div>
          <div className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400 animate-pulse">
            LIVE NOW
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Weekly Objective</p>
                <h3 className="text-xl font-black text-white italic">
                  THE {currentBattle.mood} CHALLENGE
                </h3>
              </div>
              <TrendingUp className="h-8 w-8 text-white/20" />
            </div>
          </div>

          <div className="p-2">
            {sortedScores.map((entry: any, index: number) => (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                key={entry.neighborhoodId}
                className={`flex items-center gap-4 rounded-xl p-3 transition-colors ${
                  index === 0 ? 'bg-white/5 shadow-inner' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-sm">
                  {index === 0 ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <span className="text-white/20">#{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-200">
                    {entry.neighborhood?.name || 'Unknown Zone'}
                  </h4>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: sortedScores[0]?.score > 0 ? `${(entry.score / sortedScores[0].score) * 100}%` : '0%' }}
                      className={`h-full ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-blue-500/40'}`}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-white">{entry.score.toFixed(0)}</div>
                  <div className="text-[10px] font-bold text-white/30 uppercase">points</div>
                </div>
              </motion.div>
            ))}

            {sortedScores.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                No scores recorded yet. Be the first to drop a {currentBattle.mood} pin!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-400">Past Winners</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {history?.map((battle: any) => (
            <div key={battle.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/30 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <Crown className="h-5 w-5 text-yellow-500/50" />
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold text-slate-300">
                  {battle.winnerNeighborhood?.name}
                </h4>
                <p className="text-[10px] font-bold text-white/20 uppercase">
                  {battle.mood} champion
                </p>
              </div>
            </div>
          ))}
          {(!history || history.length === 0) && (
            <div className="col-span-full py-4 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              The saga has just begun...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
