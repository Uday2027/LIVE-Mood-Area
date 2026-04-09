// src/components/Map/MoodPin.tsx
// Individual pin marker — credibility-aware opacity per AGENT.md spec.
import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getMoodColor } from '@/utils/moodColors';
import type { Pin } from '@/api/pins';

const pinOpacity = (score: number): number => {
  if (score < 0.30) return 0.35;
  if (score < 0.50) return 0.65;
  return 1.0;
};

const createMoodIcon = (mood: string, opacity: number): L.DivIcon => {
  const { bg, emoji } = getMoodColor(mood);
  return L.divIcon({
    html: `<div style="
      background:${bg};
      opacity:${opacity};
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.25);
    "><span style="transform:rotate(45deg);font-size:14px">${emoji}</span></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
};

type Props = {
  pin: Pin;
  onClick: (pin: Pin) => void;
};

export const MoodPinMarker = ({ pin, onClick }: Props) => {
  const opacity = pinOpacity(pin.credibilityScore);
  const icon = useMemo(
    () => createMoodIcon(pin.mood, opacity),
    [pin.mood, opacity],
  );

  return (
    <Marker
      position={[pin.latitude, pin.longitude]}
      icon={icon}
      eventHandlers={{ click: () => onClick(pin) }}
    >
      <Popup>{getMoodColor(pin.mood).label}</Popup>
    </Marker>
  );
};
