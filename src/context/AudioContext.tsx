import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// Served from public/ — stable path in both dev and production (no Vite hash rename)
const AUDIO_SRC = '/assets/The_Gentle_Observer.mp3';

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Whether the user has EXPLICITLY paused via the button — prevents
  // the first-interaction handler from auto-resuming after a manual pause.
  const userPausedRef = useRef(false);

  // Ref to the first-interaction cleanup so togglePlay can cancel it
  // if the user's very first action is clicking the music button.
  const removeFirstInteractionRef = useRef<(() => void) | null>(null);

  // ------------------------------------------------------------------
  // Initialise audio once on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop    = true;
    audio.volume  = 0.45;
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play',  onPlay);
    audio.addEventListener('pause', onPause);

    // ── Attempt 1: direct autoplay (succeeds in some environments) ──
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // ── Attempt 2: play on the user's very first interaction ──
        // This fires before any element's onClick, so clicking "Enter AEGIS"
        // or anything on the landing page starts the music automatically.
        const onFirstInteraction = () => {
          removeFirstInteractionRef.current = null; // already firing — clear ref
          if (!userPausedRef.current && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        };

        const cleanup = () => {
          document.removeEventListener('click',      onFirstInteraction);
          document.removeEventListener('touchstart', onFirstInteraction);
          document.removeEventListener('keydown',    onFirstInteraction);
        };

        removeFirstInteractionRef.current = cleanup;

        // Bubble phase (no capture) so button's onClick fires first,
        // allowing togglePlay to cancel this listener before it double-triggers.
        document.addEventListener('click',      onFirstInteraction, { once: true });
        document.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });
        document.addEventListener('keydown',    onFirstInteraction, { once: true });
      });

    return () => {
      audio.pause();
      audio.removeEventListener('play',  onPlay);
      audio.removeEventListener('pause', onPause);
      audioRef.current = null;
      // Remove pending first-interaction listeners if component unmounts early
      removeFirstInteractionRef.current?.();
    };
  }, []);

  // ------------------------------------------------------------------
  // Toggle — user explicitly starts or stops the music
  // ------------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // User wants to resume — cancel any pending first-interaction listener
      // so it doesn't double-trigger on the same click event.
      removeFirstInteractionRef.current?.();
      removeFirstInteractionRef.current = null;

      userPausedRef.current = false;
      audio.play().catch(() => {});
    } else {
      // User wants to pause
      userPausedRef.current = true;
      audio.pause();
    }
  }, []);

  return (
    <AudioCtx.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
}
