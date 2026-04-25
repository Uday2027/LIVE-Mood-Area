import { useQuery } from '@tanstack/react-query';
import { getActiveQuest, checkQuestCompletion } from '@/api/quests';
import { Trophy, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuestBanner = () => {
  const { data: quest, isLoading: questLoading } = useQuery({
    queryKey: ['activeQuest'],
    queryFn: getActiveQuest,
  });

  const { data: progress } = useQuery({
    queryKey: ['questProgress', quest?.id],
    queryFn: () => checkQuestCompletion(quest!.id),
    enabled: !!quest?.id,
  });

  if (questLoading || !quest) return null;

  const isCompleted = progress?.isCompleted;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md md:bottom-6"
      >
        <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-colors duration-500 ${
          isCompleted 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-slate-900/80 border-white/10'
        }`}>
          {/* Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? '100%' : '0%' }}
              className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500/50'}`}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
              isCompleted ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Daily Vibe Quest</span>
                {isCompleted && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">COMPLETED</span>
                )}
              </div>
              <h3 className="truncate text-sm font-semibold text-slate-100">
                {quest.description}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isCompleted ? 'Well done! You found the vibe today.' : 'Earn a daily badge by completing this task.'}
              </p>
            </div>

            {!isCompleted && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
