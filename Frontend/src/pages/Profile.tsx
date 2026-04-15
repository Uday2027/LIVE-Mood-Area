// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ghost, Edit2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getMe } from '@/api/auth';
import { getMoodColor, type Mood, MOODS } from '@/utils/moodColors';
import toast from 'react-hot-toast';

const BADGE_META: Record<string, { emoji: string; label: string; desc: string }> = {
  FIRST_PIN:          { emoji: '🎯', label: 'First Pin',         desc: 'Dropped your very first mood pin.' },
  VERIFIED_10:        { emoji: '✅', label: 'Verified Pro',      desc: 'Gave 10+ confirm votes to community pins.' },
  MOOD_STREAK_7:      { emoji: '🔥', label: 'Mood Streak',       desc: 'Same mood for 7 consecutive days.' },
  FIVE_NEIGHBORHOODS: { emoji: '🌍', label: 'Explorer',          desc: 'Dropped pins in 5 different neighborhoods.' },
  NIGHT_OWL:          { emoji: '🦉', label: 'Night Owl',         desc: '5+ pins dropped between 11pm and 4am.' },
  LOCAL_CROWN:        { emoji: '👑', label: 'Local Crown',       desc: 'Most pins in a neighborhood this week.' },
  PIONEER:            { emoji: '🗺️', label: 'Pioneer',           desc: 'One of the first 100 users in your city.' },
  SOCIAL_BUTTERFLY:   { emoji: '🤝', label: 'Social Butterfly',  desc: 'Connected with 5+ people via Vibe Match.' },
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Re-fetch fresh profile on mount
  useEffect(() => {
    getMe()
      .then(() => {})
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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const earnedBadges = (user as any).badges ?? [];
  const allBadgeKeys = Object.keys(BADGE_META);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">

        {/* ── Vibe Passport ─────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                {user.username?.slice(0, 2).toUpperCase() ?? 'ME'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-bold truncate">@{user.username}</h1>
                <button id="profile-edit" onClick={() => toast('Profile editing coming soon!')} className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300 hover:bg-white/10 transition-colors">
                  <Edit2 className="size-3" /> Edit
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              <p className="mt-2 text-xs text-slate-500">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard label="Total Pins" value={String((user as any).totalPins ?? 0)} icon="📍" />
            <StatCard label="Reputation" value={String(user.reputationScore?.toFixed(2) ?? '1.00')} icon="⭐" />
            <StatCard label="Badges" value={String(earnedBadges.length)} icon="🏅" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              id="profile-ghost-toggle"
              onClick={() => toast('Ghost mode toggle coming soon!')}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition-colors"
            >
              <Ghost className="size-3.5" /> Ghost Mode
            </button>
            <button
              id="profile-logout"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-xs text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </section>

        {/* ── Badge Wall ────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-base font-semibold text-slate-200">🏅 Badge Wall</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {allBadgeKeys.map((key) => {
              const meta    = BADGE_META[key];
              const earned  = earnedBadges.some((b: any) => b.badgeType === key);
              return (
                <div
                  key={key}
                  title={meta.desc}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all ${
                    earned ? 'bg-blue-500/20 ring-1 ring-blue-400/40' : 'bg-white/5 opacity-30'
                  }`}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-[11px] font-medium text-slate-300 leading-tight">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Mood This Week ────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-base font-semibold text-slate-200">📊 Mood Distribution</h2>
          <div className="space-y-2">
            {(Object.keys(MOODS) as Mood[]).map((mood) => {
              const { emoji, label, bg } = getMoodColor(mood);
              return (
                <div key={mood} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-center">{emoji}</span>
                  <span className="w-20 text-slate-400">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: '30%', backgroundColor: bg }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-600">Full mood history coming in Phase 6.</p>
        </section>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center ring-1 ring-white/10">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
