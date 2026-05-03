// src/components/Social/StoryForm.tsx
import { useState, useRef } from 'react';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { MoodSelector } from '@/components/PinForm/MoodSelector';
import { MOOD_COLORS, type Mood } from '@/utils/moodColors';
import { createStory, type Story } from '@/api/stories';
import toast from 'react-hot-toast';

type Props = {
  neighborhoodId: string;
  onClose: () => void;
  onSuccess: (story: Story) => void;
};

export const StoryForm = ({ neighborhoodId, onClose, onSuccess }: Props) => {
  const [mood, setMood] = useState<Mood>('CHILL');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;

    setLoading(true);
    try {
      const story = await createStory({
        neighborhoodId,
        mood,
        content,
        ...(imagePreview ? { imageUrl: imagePreview } : {}),
      });
      toast.success('Story posted!');
      onSuccess(story);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to post story');
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = MOOD_COLORS[mood].bg;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-colors duration-500" style={{ backgroundColor: bgStyle }}>
        
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Drop a Vibe Story</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-black/5 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-900/60">
              Selected Mood
            </label>
            <MoodSelector value={mood} onChange={setMood} />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden h-40">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/20 bg-white/40 py-5 text-sm font-semibold text-gray-600 hover:border-black/40 hover:bg-white/60 transition-all"
              >
                <ImagePlus className="size-5" />
                Add a photo
              </button>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-900/60">
              Say something (Optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's the vibe right now?"
              className="h-24 w-full resize-none rounded-2xl border-0 bg-white/60 p-4 text-sm font-medium text-gray-900 placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-black/20"
              maxLength={100}
            />
            <div className="mt-2 text-right text-xs font-semibold text-gray-500">
              {100 - content.length} chars left
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !imagePreview)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? 'Posting...' : 'Share Story'}
          </button>
        </form>

      </div>
    </div>
  );
};
