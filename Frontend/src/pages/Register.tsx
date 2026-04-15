// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, MapPin } from 'lucide-react';
import { register as registerApi } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(30),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least 1 uppercase letter' })
    .regex(/\d/, { message: 'Password must contain at least 1 number' }),
  agreed: z.boolean().refine((val) => val === true, { message: 'You must agree to the Terms & Privacy Policy' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
  if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
};

export default function Register() {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const setAuth  = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const { user, token } = await registerApi({ 
        username: data.username, 
        email: data.email, 
        password: data.password 
      });
      setAuth({ user, token });
      toast.success('Welcome to MoodMap! Drop your first vibe.');
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-400/50">
            <MapPin className="size-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400">Join MoodMap &amp; set your city's vibe</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Username</label>
            <input
              id="reg-username"
              type="text"
              {...formRegister('username')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="vibechecker99"
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Email</label>
            <input
              id="reg-email"
              type="email"
              {...formRegister('email')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Password</label>
            <input
              id="reg-password"
              type="password"
              {...formRegister('password')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            {passwordValue && !errors.password && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{strength.label} password</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-400">
              <input
                id="reg-terms"
                type="checkbox"
                {...formRegister('agreed')}
                className="mt-0.5 accent-blue-500"
              />
              I agree to the Terms &amp; Privacy Policy
            </label>
            {errors.agreed && <p className="mt-1 text-xs text-red-400">{errors.agreed.message}</p>}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/30">
              {error}
            </div>
          )}

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
