// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/UI/Navbar';
import { ProtectedRoute } from '@/components/UI/ProtectedRoute';
import { ErrorBoundary } from 'react-error-boundary';

// Eager-loaded pages (critical path)
import Home     from '@/pages/Home';
import Login    from '@/pages/Login';
import Register from '@/pages/Register';
import Waitlist from '@/pages/Waitlist';

// Lazy-loaded pages (code split on route)
const Trends  = lazy(() => import('@/pages/Trends'));
const About   = lazy(() => import('@/pages/About'));
const Circle  = lazy(() => import('@/pages/Circle'));
const Profile = lazy(() => import('@/pages/Profile'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-white text-center mt-20">Something went wrong. Please refresh the page.</div>}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />

        {/* Waitlist has no Navbar — conversion focused full-screen */}
        <Routes>
          <Route path="/waitlist" element={<Waitlist />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="pt-14">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"           element={<Home />} />
                      <Route path="/trends"     element={<Trends />} />
                      <Route path="/about"      element={<About />} />
                      <Route path="/login"      element={<Login />} />
                      <Route path="/register"   element={<Register />} />
                      <Route
                        path="/circles/:id"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <Circle />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<PageLoader />}>
                              <Profile />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                </main>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
