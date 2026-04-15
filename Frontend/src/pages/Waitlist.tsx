// src/pages/Waitlist.tsx
import { useState, useEffect } from 'react';
import { Send, Users, Zap, MapPin, Shield, Share2, Loader2 } from 'lucide-react';
import api from '@/api/client';

type WaitlistStats = {
  totalSignups: number;
  byCity: { city: string; count: number }[];
};

type WaitlistResult = {
  position: number;
  referralCode: string;
  totalAhead: number;
};

const FEATURES = [
  { icon: MapPin,  title: 'Live Mood Map',     desc: 'See your city\'s real-time emotional landscape on an interactive map.' },
  { icon: Zap,     title: 'Vibe Matching',      desc: 'Get matched with nearby people who share the same mood — anonymously.' },
  { icon: Users,   title: 'Vibe Circles',        desc: 'Instant group chats that form around mood clusters. Dissolve in 2 hours.' },
  { icon: Shield,  title: 'Ghost Mode',          desc: 'Contribute to the map without showing up in the social layer.' },
];

export default function Waitlist() {
  const [email,  setEmail]  = useState('');
  const [city,   setCity]   = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<WaitlistResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [stats,   setStats]   = useState<WaitlistStats | null>(null);

  useEffect(() => {
    // Read referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);

    // Fetch stats for live counter
    (api.get('/waitlist/stats') as Promise<WaitlistStats>)
      .then((s) => setStats(s))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: WaitlistResult = await api.post('/waitlist', {
        email,
        city,
        referralCode: refCode || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = result
    ? `${window.location.origin}/waitlist?ref=${result.referralCode}`
    : '';

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      navigator.share({ title: 'Join MoodMap', url: referralUrl });
    } else {
      navigator.clipboard.writeText(referralUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-x-hidden">

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Animated mood dots */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {['🔴','🟡','🟢','🔵','🟠'].map((dot, i) => (
            <span
              key={i}
              className="absolute text-3xl opacity-0 animate-[float_8s_ease-in-out_infinite]"
              style={{
                left: `${15 + i * 16}%`,
                top: `${20 + ((i * 13) % 50)}%`,
                animationDelay: `${i * 1.5}s`,
              }}
            >
              {dot}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {stats ? `${stats.totalSignups.toLocaleString()} people already waiting` : 'Loading…'}
          </div>

          <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">
            Your city has a mood.
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Now you can feel it.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            Real-time mood map + find your vibe tribe nearby.
            Drop anonymous mood pins, verify others, and connect — no profiles, no follows, just vibes.
          </p>

          {/* Form */}
          {!result ? (
            <form id="waitlist-form" onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-2 max-w-lg mx-auto">
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                id="waitlist-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                className="sm:w-36 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                id="waitlist-submit"
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 disabled:opacity-60 transition-all"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Join
              </button>
            </form>
          ) : (
            <div className="mt-10 max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md space-y-4">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400">#{result.position}</div>
                <p className="text-slate-300 mt-1">in {city}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {result.totalAhead} people ahead of you. Share your link to move up the list.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-300 font-mono break-all">
                {referralUrl}
              </div>
              <button
                id="waitlist-share"
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold hover:bg-blue-500 transition-all"
              >
                <Share2 className="size-4" /> Share Your Link
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold">What is MoodMap?</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-400/30">
                <Icon className="size-5 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-600">
        MoodMap — Feel the city © 2026
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { opacity: 0; transform: translateY(0); }
          20%, 80% { opacity: 0.5; }
          50% { opacity: 0.7; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
}
