// src/components/Profile/MoodWrapped.tsx
import { useRef, useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { getMoodColor, type Mood } from '@/utils/moodColors';

type Props = {
  data: {
    dominantMood: Mood;
    neighborhoodsVisited: number;
    totalPins: number;
    highlight: string;
    weekRange: string;
  };
};

export const MoodWrapped = ({ data }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const color = getMoodColor(data.dominantMood);

  const generateCard = async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1920;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, color.bg || '#ffffff');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Grid pattern overlay (optional styling)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1080; i += 60) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
    }
    for (let i = 0; i < 1920; i += 60) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
    }

    // Title setup
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 80px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My Week in Vibes', 540, 300);

    // Emoji Circle Background
    ctx.beginPath();
    ctx.arc(540, 700, 250, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Emoji
    ctx.font = '250px "Inter", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.emoji, 540, 720);

    // Dominant Mood Label
    ctx.fillStyle = color.text || '#ffffff';
    ctx.font = '900 120px "Inter", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(data.dominantMood, 540, 1100);

    // Stats
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '500 50px "Inter", sans-serif';
    ctx.fillText(`${data.totalPins} Pins Dropped`, 540, 1250);
    ctx.fillText(`${data.neighborhoodsVisited} Neighborhoods Explored`, 540, 1350);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'italic 45px "Inter", sans-serif';
    ctx.fillText(`"${data.highlight}"`, 540, 1550);

    // Footer Branding
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillText(`MOODMAP • ${data.weekRange}`, 540, 1800);

    return canvas.toDataURL('image/png');
  };

  const handleShare = async () => {
    setGenerating(true);
    // Simulate generation delay for UX
    await new Promise(r => setTimeout(r, 600)); 
    
    const dataUrl = await generateCard();
    setGenerating(false);
    
    if (!dataUrl) return;

    // Check Web Share API
    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'mood-wrapped.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Mood Wrapped',
          text: 'Check out my vibe this week on MoodMap!',
          files: [file]
        });
        return;
      } catch (err) {
        console.error('Share failed', err);
      }
    }

    // Fallback: Download
    const link = document.createElement('a');
    link.download = 'mood-wrapped.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/5 p-6 border border-white/10">
      <div className="text-center">
         <h3 className="text-lg font-bold text-white">Mood Wrapped</h3>
         <p className="text-xs text-slate-400">Your weekly summary is ready</p>
      </div>
      
      <div className="relative aspect-[9/16] w-full max-w-[192px] overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black/50">
         <canvas ref={canvasRef} className="hidden" />
         {/* Preview box */}
         <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${color.bg}, #000)`}}>
            <div className="text-4xl shadow-sm mb-2">{color.emoji}</div>
            <div className="text-lg font-black tracking-widest text-white/90 uppercase">{data.dominantMood}</div>
            <div className="mt-4 text-center text-[8px] text-white/60 font-medium">My Week in Vibes</div>
         </div>
      </div>

      <button 
        onClick={handleShare}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
      >
        {generating ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
        {generating ? 'Generating...' : 'Share or Download'}
      </button>
    </div>
  );
};
