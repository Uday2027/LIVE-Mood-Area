// src/components/Social/StoryViewer.tsx
import { useState, useEffect } from 'react';
import { X, Eye, MapPin } from 'lucide-react';
import { getMoodColor } from '@/utils/moodColors';
import { MoodBadge } from '@/components/UI/MoodBadge';
import type { Story } from '@/api/stories';

type Props = {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  userId?: string;
};

// Calculates a quick relative time string
const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000); // mins
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
};

export const StoryViewer = ({ stories, initialIndex, onClose, userId }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); // eslint-disable-line

  // Click areas
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e;
    const { innerWidth } = window;
    if (clientX < innerWidth / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const story = stories[currentIndex];
  if (!story) return null;

  const color = getMoodColor(story.mood);
  const isAuthor = story.userId === userId;

  return (
    <div className="fixed inset-0 z-[600] flex animate-in fade-in flex-col bg-black/95 text-white sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col relative overflow-hidden sm:rounded-[2rem] sm:border border-white/10" style={{ backgroundColor: color.bg }}>
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4 pt-6">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/80' : 'bg-transparent'}`} 
                style={{ width: idx === currentIndex ? '100%' : '100%' }} // Add timer logic if auto-advance is wanted
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-10 left-0 right-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 drop-shadow-md">
            <MoodBadge mood={story.mood} />
            <span className="text-xs font-bold text-white/90">
              {timeAgo(story.createdAt)}
            </span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="rounded-full p-2 text-white/90 hover:bg-white/20 transition-colors drop-shadow-md">
            <X className="size-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={handleClick}>
           {story.imageUrl && (
             <img src={story.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
           )}
           {/* Gradient Overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
           
           <div className="absolute inset-x-8 bottom-24 flex flex-col items-center justify-center text-center">
             {!story.imageUrl && (
               <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-white text-6xl shadow-2xl">
                 {color.emoji}
               </div>
             )}
             <p className="text-2xl font-bold tracking-tight text-white drop-shadow-xl">
               {story.content}
             </p>
           </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-6 drop-shadow-md">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
            <MapPin className="size-4" /> Vibe Zone
          </div>
          {isAuthor && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
              <Eye className="size-4" /> {story.viewsCount}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
