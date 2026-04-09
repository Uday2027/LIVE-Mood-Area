// src/components/UI/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { MapPin, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const NAV_LINKS = [
  { to: '/',          label: 'Map',       icon: MapPin },
  { to: '/trends',    label: 'Trends',    icon: TrendingUp },
  { to: '/about',     label: 'About',      icon: Info },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const user         = useAuthStore((s) => s.user);
  const clearAuth    = useAuthStore((s) => s.clearAuth);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-1.5 font-bold text-gray-900">
        <MapPin className="size-5 text-blue-500" />
        MoodMap
      </Link>

      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              pathname === to
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">@{user.username}</span>
            <button
              onClick={clearAuth}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/about"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Explore
          </Link>
        )}
      </div>
    </nav>
  );
};
