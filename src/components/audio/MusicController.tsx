import React from 'react';
import { useAudio } from '../../context/AudioContext';

/**
 * Apple Music–style music toggle button.
 *
 * Behaviour:
 *   - Click → play (first click grants browser autoplay permission)
 *   - Click again → pause
 *   - If audio is unavailable → shows "AUDIO N/A" label, button is disabled
 *
 * Visual design is preserved exactly:
 *   - Red glow + animated ping when playing
 *   - Dim icon + diagonal slash when paused
 *   - No changes to colours, sizing, or border style
 */
export function AppleMusicButton() {
  const { isPlaying, audioError, togglePlay } = useAudio();

  // ── Graceful degradation: asset missing or codec unsupported ────────────
  if (audioError === 'unavailable') {
    return (
      <div
        title="Audio unavailable"
        className="relative p-2 rounded-sm border border-[#1a2840] bg-[#050810] text-[#475569] flex items-center justify-center gap-1 opacity-50 cursor-not-allowed select-none"
        aria-label="Audio unavailable"
      >
        <svg
          className="w-4 h-4 opacity-40"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21 3.25a.75.75 0 0 0-.87-.73l-10 1.75A.75.75 0 0 0 9.5 5v9.33A3.99 3.99 0 0 0 8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7.61l9-1.57v6.29A3.99 3.99 0 0 0 19 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.25z" />
        </svg>
        <span className="text-[8px] font-mono tracking-widest">N/A</span>
      </div>
    );
  }

  // ── Normal toggle button ─────────────────────────────────────────────────
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
      {/* Music note — always rendered */}
      <svg
        className={`w-4 h-4 transition-transform group-hover:scale-110 ${isPlaying ? '' : 'opacity-40'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M21 3.25a.75.75 0 0 0-.87-.73l-10 1.75A.75.75 0 0 0 9.5 5v9.33A3.99 3.99 0 0 0 8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7.61l9-1.57v6.29A3.99 3.99 0 0 0 19 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.25z" />
      </svg>

      {/* Diagonal slash overlay — shown only when paused */}
      {!isPlaying && (
        <span
          aria-hidden="true"
          className="absolute w-[18px] h-[1.5px] bg-[#94a3b8] rotate-45 pointer-events-none rounded-full"
        />
      )}

      {/* Ambient pulse ring — shown only when playing */}
      {isPlaying && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-sm animate-ping opacity-20 bg-[#fa233b] pointer-events-none"
        />
      )}
    </button>
  );
}

// Named aliases — drop-in replacements used by AppShell and Landing
export const SpeakerMusicButton = AppleMusicButton;
export const HeaderMusicControl = AppleMusicButton;
