// src/components/Social/MoodStoriesRow.tsx
import { useEffect, useState } from 'react';
import { getNeighborhoodStories, type Story } from '@/api/stories';
import { getMoodColor } from '@/utils/moodColors';
import { Plus } from 'lucide-react';
import { StoryViewer } from './StoryViewer';
import { StoryForm } from './StoryForm';
import { useAuthStore } from '@/store/useAuthStore';

type Props = {
  neighborhoodId: string;
};

export const MoodStoriesRow = ({ neighborhoodId }: Props) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [showStoryForm, setShowStoryForm] = useState(false);
  
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    // Guard: only call API when neighborhoodId is a valid integer
    if (!neighborhoodId || !/^\d+$/.test(neighborhoodId)) return;
    let mounted = true;
    getNeighborhoodStories(neighborhoodId)
      .then(data => { if(mounted) setStories(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [neighborhoodId]);

  return (
    <div className="flex flex-col gap-2 mt-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800">
        Vibe Stories
      </h3>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        
        {/* Add Story Button (If logged in) */}
        {user && (
           <button 
             onClick={() => setShowStoryForm(true)}
             className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all"
           >
             <Plus className="size-5" />
           </button>
        )}

        {/* Story Bubbles */}
        {stories.map((story, idx) => {
           const color = getMoodColor(story.mood);
           return (
             <button
               key={story.id}
               onClick={() => setActiveStoryIdx(idx)}
               className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 p-0.5 shadow-sm transition-transform hover:scale-105"
               style={{ borderColor: color.border }}
             >
               <div className="flex h-full w-full items-center justify-center rounded-full text-xl" style={{ backgroundColor: color.bg }}>
                 {color.emoji}
               </div>
             </button>
           );
        })}

        {stories.length === 0 && !user && (
           <p className="text-xs text-gray-400 font-medium">No stories in this neighborhood yet. Log in to drop one!</p>
        )}
      </div>

      {activeStoryIdx !== null && (
         <StoryViewer 
           stories={stories} 
           initialIndex={activeStoryIdx} 
           onClose={() => setActiveStoryIdx(null)} 
           userId={user?.id}
         />
      )}

      {showStoryForm && (
         <StoryForm 
           neighborhoodId={neighborhoodId} 
           onClose={() => setShowStoryForm(false)} 
           onSuccess={(newStory) => setStories([newStory, ...stories])}
         />
      )}
    </div>
  );
};
