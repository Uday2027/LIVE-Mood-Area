// src/components/UI/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export const ProtectedRoute = ({ children }: Props) => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
