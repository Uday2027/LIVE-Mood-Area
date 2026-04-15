// src/components/Social/PushPrompt.tsx
import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import api from '@/api/client';

export function PushPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [loading, setLoading] = useState(false);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    setLoading(true);
    try {
      const resp = await Notification.requestPermission();
      setPermission(resp);
      
      if (resp === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await api.post('/push/subscribe', { subscription });
        console.log('Push subscription successful');
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications', err);
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'granted' || typeof Notification === 'undefined') return null;

  return (
    <div className="fixed bottom-24 left-6 z-[1000] max-w-[200px]">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 ring-1 ring-blue-400/30">
            {permission === 'denied' ? (
              <BellOff className="size-4 text-slate-500" />
            ) : (
              <Bell className="size-4 text-blue-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Stay Vibing</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Get notified when your mood matches someone nearby.
            </p>
            <button
              onClick={subscribe}
              disabled={loading || permission === 'denied'}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-1.5 text-[10px] font-bold hover:bg-blue-500 disabled:opacity-50 transition-all text-white"
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : 'ENABLE ALERTS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
