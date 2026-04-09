// src/pages/Dashboard.tsx
// Protected page — shows user pin history and allows sign-in if visitor.
import { useEffect, useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { CredibilityBar } from '@/components/UI/CredibilityBar';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyPins, login, register, type AuthUser } from '@/api/auth';
import { formatRelativeTime } from '@/utils/formatters';

type PinRecord = {
  id: string; mood: string; message: string | null;
  credibilityScore: number; createdAt: string;
};

type AuthFormMode = 'login' | 'register';

export default function Dashboard() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [pins,    setPins]    = useState<PinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode,    setMode]    = useState<AuthFormMode>('login');
  const [form,    setForm]    = useState({ username: '', email: '', password: '' });
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    (getMyPins() as Promise<PinRecord[]>)
      .then(setPins)
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fn = mode === 'login' ? login : register;
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : form;
      const res = await fn(payload as Parameters<typeof fn>[0]);
      setAuth(res.token, res.user as AuthUser);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <LogIn className="size-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
          </div>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            {mode === 'register' && (
              <input
                required
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              required type="email" placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              required type="password" placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500">@{user?.username}</p>
        </div>
        <button
          onClick={clearAuth}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">My Pins</h2>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-blue-500" />
        </div>
      ) : pins.length === 0 ? (
        <p className="text-sm text-gray-400">You haven't dropped any pins yet.</p>
      ) : (
        <div className="space-y-3">
          {pins.map((pin) => (
            <div key={pin.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <MoodBadge mood={pin.mood} />
                <span className="text-xs text-gray-400">{formatRelativeTime(pin.createdAt)}</span>
              </div>
              {pin.message && <p className="mb-2 text-sm text-gray-700">{pin.message}</p>}
              <CredibilityBar score={pin.credibilityScore} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
