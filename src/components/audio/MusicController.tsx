import React from 'react';
import { useAudio } from '../../context/AudioContext';

/**
 * Apple Music–style music toggle button.
 * - Icon glows red with an animated pulse when music is playing
 * - Click once → pauses music (icon goes dim with a slash)
 * - Click again → resumes music
 */
export function AppleMusicButton() {
  const { isPlaying, togglePlay } = useAudio();

  return (
    <button
      id="music-toggle-btn"
      onClick={togglePlay}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      title={isPlaying ? 'Music playing — click to pause' : 'Music paused — click to play'}
      className={`relative p-2 rounded-sm border transition-all duration-300 cursor-pointer flex items-center justify-center group ${
        isPlaying
          ? 'bg-[#fa233b]/15 border-[#fa233b]/50 text-[#fa233b] hover:bg-[#fa233b]/25 hover:border-[#fa233b] shadow-[0_0_12px_rgba(250,35,59,0.25)]'
          : 'bg-[#050810] border-[#1a2840] text-[#64748b] hover:text-[#94a3b8] hover:border-[#475569]'
      }`}
    >
      {/* Music note icon — always shown */}
      <svg
        className={`w-4 h-4 transition-transform group-hover:scale-110 ${isPlaying ? '' : 'opacity-40'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M21 3.25a.75.75 0 0 0-.87-.73l-10 1.75A.75.75 0 0 0 9.5 5v9.33A3.99 3.99 0 0 0 8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7.61l9-1.57v6.29A3.99 3.99 0 0 0 19 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.25z" />
      </svg>

      {/* Strike-through line shown only when paused */}
      {!isPlaying && (
        <span
          aria-hidden="true"
          className="absolute w-[18px] h-[1.5px] bg-[#94a3b8] rotate-45 pointer-events-none rounded-full"
        />
      )}

      {/* Subtle ripple ring when playing */}
      {isPlaying && (
        <span className="absolute inset-0 rounded-sm animate-ping opacity-20 bg-[#fa233b] pointer-events-none" />
      )}
    </button>
  );
}

// Aliases for seamless drop-in
export const SpeakerMusicButton  = AppleMusicButton;
export const HeaderMusicControl  = AppleMusicButton;
