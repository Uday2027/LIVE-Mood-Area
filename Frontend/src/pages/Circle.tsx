// src/pages/Circle.tsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Users, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { useCircleStore } from '@/store/useCircleStore';
import { useCircle } from '@/hooks/useCircle';
import { getSessionId } from '@/utils/session';
import { getMoodColor } from '@/utils/moodColors';
import type { CircleMessage } from '@/api/circles';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;
const MAX_CHARS = 300;

const getTimeLeft = (dissolvesAt: string): string => {
  const ms = new Date(dissolvesAt).getTime() - Date.now();
  if (ms <= 0) return 'Dissolved';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

const getInitials = (sessionId: string): string =>
  sessionId.slice(0, 2).toUpperCase();

export default function Circle() {
  const { id: circleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const activeCircle   = useCircleStore((s) => s.activeCircle);
  const messages       = useCircleStore((s) => s.messages);
  const memberCount    = useCircleStore((s) => s.memberCount);
  const addMessage     = useCircleStore((s) => s.addMessage);

  const { join, leave, loading } = useCircle(circleId!);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    join();
    const socket = io(SOCKET_URL, { auth: { sessionId } });
    socketRef.current = socket;
    socket.emit('join_circle', { circleId });
    socket.on('circle_message', (msg: CircleMessage) => addMessage(msg));

    return () => {
      socket.emit('leave_circle', { circleId });
      socket.disconnect();
      leave();
    };
  }, [circleId]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !socketRef.current || sending) return;
    setSending(true);
    socketRef.current.emit('circle_message', { circleId, content: text.trim() });
    setText('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const moodColor = activeCircle ? getMoodColor(activeCircle.mood) : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-md bg-slate-900/80">
        <button id="circle-back" onClick={() => navigate('/')} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
          style={{ backgroundColor: moodColor?.bg, color: moodColor?.text }}
        >
          {moodColor?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-sm font-semibold">{activeCircle?.name ?? 'Vibe Circle'}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Users className="size-3" /> {memberCount}</span>
            {activeCircle && (
              <span className="flex items-center gap-1"><Clock className="size-3" /> {getTimeLeft(activeCircle.dissolvesAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">
            Be the first to say something in this circle!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sessionId === sessionId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
                {getInitials(msg.sessionId)}
              </div>
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-3 py-2 text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
                  {msg.content}
                </div>
                <span className="px-1 text-[11px] text-slate-500">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur-md">
        <div className="relative flex items-end gap-2">
          <textarea
            id="circle-message-input"
            rows={1}
            maxLength={MAX_CHARS}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something…"
            className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none max-h-28"
          />
          <span className="absolute bottom-3 right-14 text-xs text-slate-600">{MAX_CHARS - text.length}</span>
          <button
            id="circle-send-btn"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
