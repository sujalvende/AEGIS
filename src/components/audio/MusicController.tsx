import React from 'react';
import { useAudio } from '../../context/AudioContext';

/**
 * Apple Music style icon button:
 * - Automatically plays background music
 * - Tapping this icon stops / pauses the music
 * - Tapping again resumes / plays the music
 */
export function AppleMusicButton() {
  const { isPlaying, togglePlay } = useAudio();

  return (
    <button
      onClick={togglePlay}
      aria-label={isPlaying ? 'Stop Apple Music' : 'Play Apple Music'}
      title={isPlaying ? 'Music playing — Tap to stop' : 'Music stopped — Tap to play'}
      className={`relative p-2 rounded-sm border transition-all cursor-pointer flex items-center justify-center group ${
        isPlaying
          ? 'bg-[#fa233b]/15 border-[#fa233b]/50 text-[#fa233b] hover:bg-[#fa233b]/25 hover:border-[#fa233b] shadow-[0_0_12px_rgba(250,35,59,0.25)]'
          : 'bg-[#050810] border-[#1a2840] text-[#64748b] hover:text-[#94a3b8] hover:border-[#475569]'
      }`}
    >
      {isPlaying ? (
        // Apple Music Beamed Eighth Notes (Active)
        <svg
          className="w-4 h-4 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 3.25a.75.75 0 0 0-.87-.73l-10 1.75A.75.75 0 0 0 9.5 5v9.33A3.99 3.99 0 0 0 8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7.61l9-1.57v6.29A3.99 3.99 0 0 0 19 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.25z" />
        </svg>
      ) : (
        // Apple Music Beamed Eighth Notes (Paused / Muted with slash)
        <div className="relative flex items-center justify-center">
          <svg
            className="w-4 h-4 opacity-50 transition-transform group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 3.25a.75.75 0 0 0-.87-.73l-10 1.75A.75.75 0 0 0 9.5 5v9.33A3.99 3.99 0 0 0 8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7.61l9-1.57v6.29A3.99 3.99 0 0 0 19 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.25z" />
          </svg>
          {/* Subtle diagonal strike-through indicating paused */}
          <span className="absolute w-[18px] h-[1.5px] bg-[#94a3b8] rotate-45 pointer-events-none rounded-full" />
        </div>
      )}
    </button>
  );
}

// Aliases for seamless drop-in
export const SpeakerMusicButton = AppleMusicButton;
export const HeaderMusicControl = AppleMusicButton;
