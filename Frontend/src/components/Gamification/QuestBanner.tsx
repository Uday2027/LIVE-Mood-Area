// src/components/Gamification/QuestBanner.tsx
import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Trophy } from 'lucide-react';
import api from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';

type Quest = {
  id: string;
  title: string;
  description: string;
  rewardBadge?: string;
};

export function QuestBanner() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [completed, setCompleted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fetch today's quest
    api.get('/quests/today')
      .then((res: any) => setQuest(res))
      .catch(() => {});

    // Check my progress
    api.get('/quests/my-progress')
      .then((res: any) => setCompleted(res.completed))
      .catch(() => {});
  }, []);

  if (!quest) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed left-1/2 top-16 z-[1000] w-full max-w-sm -translate-x-1/2 px-4"
        >
          <div className={`relative overflow-hidden rounded-2xl border ${completed ? 'border-green-500/50 bg-green-950/40' : 'border-blue-500/50 bg-slate-900/80'} p-4 shadow-2xl backdrop-blur-xl transition-colors`}>
            {/* Completion Sparkle */}
            {completed && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 pointer-events-none animate-pulse" />
            )}

            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ${completed ? 'ring-green-400' : 'ring-blue-400'}`}>
                {completed ? (
                  <CheckCircle2 className="size-5 text-green-400" />
                ) : (
                  <Target className="size-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Daily Quest: {quest.title}</h3>
                  <button 
                    onClick={() => setVisible(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-tight">
                  {completed ? "Nice work! You've earned reputation points." : quest.description}
                </p>
                {completed && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                    <Trophy className="size-3" />
                    REPUTATION +15
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
