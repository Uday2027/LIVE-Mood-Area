// src/pages/About.tsx
// Immersive About page utilizing the WovenLightHero and data from README.md
import { WovenLightHero } from "@/components/UI/woven-light-hero";
import { MOOD_COLORS } from "@/utils/moodColors";
import { 
  ShieldCheck, 
  Zap, 
  Map as MapIcon, 
  Users, 
  Clock, 
  Navigation, 
  Database,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <WovenLightHero />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-white">
        {/* Intro Section */}
        <section className="mb-32 text-center">
          <h2 className="mb-6 text-4xl font-black tracking-tight md:text-6xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            See the vibe of your city, right now.
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400 leading-relaxed md:text-2xl">
            MoodMap is a real-time web application where users anonymously drop "mood pins" on a live city map. 
            Experience the atmosphere of any neighborhood instantly—no login required.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-40">
          <div className="mb-16 flex items-center gap-4">
             <div className="h-px flex-1 bg-gray-800" />
             <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-blue-500">Core Features</h3>
             <div className="h-px flex-1 bg-gray-800" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<MapIcon className="size-6" />}
              title="Live Mood Map"
              description="Interactive map with color-coded neighborhood vibes updating in real time via Socket.io."
            />
            <FeatureCard 
              icon={<Users className="size-6" />}
              title="Anonymous Pinning"
              description="Drop a mood pin in seconds to share the current vibe without needing an account."
            />
            <FeatureCard 
              icon={<ShieldCheck className="size-6" />}
              title="Crowd Verification"
              description="Pins are verified or disputed by the community to ensure collective data integrity."
            />
            <FeatureCard 
              icon={<Navigation className="size-6" />}
              title="Native Routing"
              description="Calculate street-level routes from your GPS to any pin natively with our OSRM engine."
            />
            <FeatureCard 
              icon={<Clock className="size-6" />}
              title="Auto-Expiry"
              description="Pins automatically disappear after 2 hours, keeping the city vibe strictly current."
            />
             <FeatureCard 
              icon={<Zap className="size-6" />}
              title="Smart Geocoding"
              description="Raw GPS coordinates are automatically resolved into human-readable location names."
            />
          </div>
        </section>

        {/* Mood Types */}
        <section className="mb-40">
           <div className="mb-16 flex items-center justify-center gap-4">
             <div className="h-px w-12 bg-gray-800" />
             <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-500">The Visual Language</h3>
             <div className="h-px w-12 bg-gray-800" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(MOOD_COLORS).map(([key, config]) => (
              <div key={key} className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/60">
                <span className="text-3xl">{config.emoji}</span>
                <div>
                  <h4 className="font-bold text-white" style={{ color: config.bg }}>{config.label}</h4>
                  <p className="text-xs text-gray-400">Atmosphere indicator</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Logic */}
        <section className="mb-40 rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black p-8 md:p-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="mb-6 text-3xl font-bold">The Verification System</h3>
              <p className="mb-8 text-gray-400 leading-relaxed">
                To maintain high data integrity, we use a decentralized credibility scoring system. 
                Every pin is a community-verified signal.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-300">Pins below 30% credibility are automatically dimmed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-300">Heavily disputed pins (3x disputes) are auto-removed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-300">Session-based voting ensures one vote per person per pin.</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl border border-gray-800 bg-black p-8 shadow-2xl">
               <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Integrity Protocol</span>
                  <ActivityIndicator />
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                      <span>Confirms</span>
                      <span>Disputes</span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-gray-900 overflow-hidden flex">
                       <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
                       <div className="h-full bg-rose-500" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 italic font-medium">
                    "Decentralized trust ensures that the map reflects reality, not noise."
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Summary */}
        <section className="text-center">
           <h3 className="mb-12 text-2xl font-bold">Built with Modern Resilience</h3>
           <div className="flex flex-wrap justify-center gap-8 text-gray-500">
              <TechItem icon={<Database className="size-5" />} label="PostgreSQL" />
              <TechItem icon={<Zap className="size-5" />} label="Socket.io" />
              <TechItem icon={<Search className="size-5" />} label="Prisma" />
              <TechItem icon={<MapIcon className="size-5" />} label="Leaflet" />
           </div>
           <p className="mt-20 text-xs text-gray-600 uppercase tracking-[0.5em]">
             Built with ❤️ by the MoodMap Team
           </p>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group rounded-3xl border border-gray-800 bg-gray-900/20 p-8 transition-all hover:bg-gray-900/40 hover:border-gray-700">
      <div className="mb-6 inline-flex rounded-2xl bg-gray-800/50 p-4 text-blue-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="mb-3 text-lg font-bold text-white">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TechItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 grayscale transition-all hover:grayscale-0 hover:text-white">
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function ActivityIndicator() {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <span 
          key={i} 
          className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" 
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
