// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Ghost, MapPin, Star, Award,
  Calendar, TrendingUp, ChevronRight, Book
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getMe } from '@/api/auth';
import { getUserDiary } from '@/api/users';
import { getMoodColor, type Mood, MOODS } from '@/utils/moodColors';

import toast from 'react-hot-toast';
import { MoodCalendar } from '@/components/Profile/MoodCalendar';
import type { DayHistory } from '@/components/Profile/MoodCalendar';
import { MoodWrapped } from '@/components/Profile/MoodWrapped';
import { MoodBadge } from '@/components/UI/MoodBadge';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingChecks, respondVibeCheck } from '@/api/vibeChecks';
import { MessageSquare, Check, X } from 'lucide-react';


// ─── Types ───────────────────────────────────────────────────────────────────

const BADGE_META: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  FIRST_PIN:          { emoji: '🎯', label: 'First Pin',        desc: 'Dropped your very first mood pin.',              color: '#6366f1' },
  VERIFIED_10:        { emoji: '✅', label: 'Verified Pro',     desc: 'Gave 10+ confirm votes to community pins.',      color: '#22c55e' },
  MOOD_STREAK_7:      { emoji: '🔥', label: 'Mood Streak',      desc: 'Same mood for 7 consecutive days.',              color: '#f97316' },
  FIVE_NEIGHBORHOODS: { emoji: '🌍', label: 'Explorer',         desc: 'Dropped pins in 5 different neighborhoods.',    color: '#3b82f6' },
  NIGHT_OWL:          { emoji: '🦉', label: 'Night Owl',        desc: '5+ pins dropped between 11pm and 4am.',         color: '#8b5cf6' },
  LOCAL_CROWN:        { emoji: '👑', label: 'Local Crown',      desc: 'Most pins in a neighborhood this week.',        color: '#eab308' },
  PIONEER:            { emoji: '🗺️', label: 'Pioneer',          desc: 'One of the first 100 users in your city.',      color: '#ec4899' },
  SOCIAL_BUTTERFLY:   { emoji: '🤝', label: 'Social Butterfly', desc: 'Connected with 5+ people via Vibe Match.',      color: '#14b8a6' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const user       = useAuthStore((s) => s.user);
  const logout     = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate   = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingChecks } = useQuery({
    queryKey: ['pendingChecks'],
    queryFn: getPendingChecks,
  });

  const { data: diaries } = useQuery({
    queryKey: ['myDiaries'],
    queryFn: getUserDiary,
  });


  const respondMutation = useMutation({
    mutationFn: ({ id, mood }: { id: string; mood: string }) => respondVibeCheck(id, mood),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingChecks'] });
      toast.success('Response sent!');
    },
  });


  useEffect(() => {
    getMe()
      .then((freshUser) => updateUser(freshUser))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    toast('Logged out. See you around the map!');
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] p-4 space-y-6" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)' }}>
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="h-32 rounded-xl bg-white/5 animate-pulse mt-8" />
      </div>
    );
  }

  const earnedBadges      = user.badges ?? [];
  const totalPins         = user.totalPins ?? 0;
  const reputation        = user.reputationScore?.toFixed(2) ?? '1.00';
  const moodDistribution  = user.moodDistribution ?? [];
  const pinHistory        = user.pinHistory ?? [];
  const allBadgeKeys      = Object.keys(BADGE_META);
  const initials          = user.username?.slice(0, 2).toUpperCase() ?? 'ME';

  // Transform flat PinHistoryEntry[] → DayHistory[] expected by MoodCalendar
  const dayHistory: DayHistory[] = (() => {
    const map = new Map<string, { dominantMood: string; pinCount: number; moodCounts: Record<string, number> }>();
    for (const entry of pinHistory) {
      const date = entry.createdAt.split('T')[0]!;
      if (!map.has(date)) map.set(date, { dominantMood: entry.mood, pinCount: 0, moodCounts: {} });
      const d = map.get(date)!;
      d.pinCount++;
      d.moodCounts[entry.mood] = (d.moodCounts[entry.mood] ?? 0) + 1;
      const dominant = Object.entries(d.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (dominant) d.dominantMood = dominant;
    }
    return Array.from(map.entries()).map(([date, v]) => ({
      date,
      dominantMood: v.dominantMood as Mood | null,
      pinCount: v.pinCount,
    }));
  })();

  const totalMoodPins = moodDistribution.reduce((sum, m) => sum + m.count, 0);
  const getMoodPct = (mood: Mood): number => {
    const entry = moodDistribution.find((m) => m.mood === mood);
    if (!entry || totalMoodPins === 0) return 0;
    return Math.round((entry.count / totalMoodPins) * 100);
  };

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] text-white"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)' }}
    >
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden px-4 pt-12 pb-24"
        style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.3) 0%, transparent 100%)' }}
      >
        {/* Glowing orb behind avatar */}
        <div
          className="absolute left-1/2 top-8 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div className="mx-auto max-w-xl relative text-center">
          {/* Avatar */}
          <div className="relative inline-flex">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black shadow-2xl border-4 border-indigo-400/50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)' }}
            >
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs shadow ring-2 ring-slate-900">
              ✓
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight">@{user.username}</h1>
          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              id="profile-ghost-toggle"
              onClick={() => toast('Ghost mode toggle coming soon!')}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Ghost className="size-3.5" /> Ghost Mode
            </button>
            <button
              id="profile-logout"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards — float over hero */}
      <div className="mx-auto -mt-16 max-w-xl px-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<MapPin className="size-5 text-indigo-400" />} label="Pins" value={String(totalPins)} accent="#6366f1" />
          <StatCard icon={<Star className="size-5 text-yellow-400" />} label="Rep" value={reputation} accent="#eab308" />
          <StatCard icon={<Award className="size-5 text-pink-400" />} label="Badges" value={String(earnedBadges.length)} accent="#ec4899" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-xl px-4 pt-6 pb-12 space-y-5">

        {/* Badge Wall */}
        <Section icon={<Award className="size-4 text-pink-400" />} title="Badge Wall">
          <div className="grid grid-cols-4 gap-2">
            {allBadgeKeys.map((key) => {
              const meta   = BADGE_META[key]!;
              const earned = earnedBadges.some((b) => b.badgeType === key);
              return (
                <div
                  key={key}
                  title={meta.desc}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all cursor-default"
                  style={{
                    background: earned
                      ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}11)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${earned ? meta.color + '55' : 'rgba(255,255,255,0.08)'}`,
                    opacity: earned ? 1 : 0.45,
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-[10px] font-semibold text-white/80 leading-tight">{meta.label}</span>
                </div>
              );
            })}
          </div>
          {earnedBadges.length === 0 && (
            <p className="mt-3 text-center text-xs text-slate-500">Drop pins and interact with the map to earn badges!</p>
          )}
        </Section>

        {/* Mood Distribution */}
        <Section icon={<TrendingUp className="size-4 text-cyan-400" />} title="Mood Palette">
          {moodDistribution.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-4">No pin data yet. Start dropping pins to see your mood palette!</p>
          ) : (
            <div className="space-y-3">
              {(Object.keys(MOODS) as Mood[]).map((mood) => {
                const { emoji, label, bg } = getMoodColor(mood);
                const pct = getMoodPct(mood);
                return (
                  <div key={mood} className="flex items-center gap-3 text-sm">
                    <span className="w-6 shrink-0 text-center text-base">{emoji}</span>
                    <span className="w-20 shrink-0 text-xs text-slate-400">{label}</span>
                    <div className="relative flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: bg }}
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Vibe History Calendar */}
        <Section icon={<Calendar className="size-4 text-emerald-400" />} title="Vibe History">
          <MoodCalendar history={dayHistory} />
          <p className="mt-2 text-xs text-slate-500">
            {pinHistory.length > 0
              ? `${pinHistory.length} pins in the last 90 days`
              : 'No history yet — drop your first pin!'}
          </p>
        </Section>

        {/* Vibe Checks */}
        {pendingChecks && pendingChecks.length > 0 && (
          <Section icon={<MessageSquare className="size-4 text-orange-400" />} title="Vibe Checks">
            <div className="space-y-3">
              {pendingChecks.map((check: any) => (
                <div key={check.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                      {check.sender.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">@{check.sender.username}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter">sent a vibe check</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondMutation.mutate({ id: check.id, mood: 'CHILL' })}
                      className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    >
                      <Check className="size-4" />
                    </button>
                    <button className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* My Journal */}
        {diaries && diaries.length > 0 && (
          <Section icon={<Book className="size-4 text-blue-400" />} title="My Journal">
            <div className="grid grid-cols-2 gap-3">
              {diaries.map((diary: any) => (
                <div key={diary.id} className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 cursor-pointer">
                  <p className="text-xs font-bold text-slate-300">
                    {new Date(diary.weekStart).toLocaleDateString()} - {new Date(diary.weekEnd).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <MoodBadge mood={diary.summaryData.dominantMood} size="sm" />
                    <span className="text-[10px] text-slate-400">{diary.summaryData.totalPins} pins</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* MoodWrapped */}


        <Section icon={<ChevronRight className="size-4 text-purple-400" />} title="This Week's Wrap">
          <MoodWrapped
            data={{
              dominantMood:         'HYPE',
              neighborhoodsVisited: 4,
              totalPins,
              highlight:            'Most verified: "Huge party at TSC!"',
              weekRange:            'This Week',
            }}
          />
        </Section>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 text-center"
      style={{
        background:  `linear-gradient(135deg, ${accent}22 0%, rgba(255,255,255,0.04) 100%)`,
        border:      `1px solid ${accent}44`,
        boxShadow:   `0 0 20px ${accent}22`,
      }}
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">{title}</h2>
      </div>
      {children}
    </section>
  );
}
