import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// Served from public/ — stable URL in both dev and production
const AUDIO_SRC = '/assets/The_Gentle_Observer.mp3';

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const userPausedRef = useRef(false);
  const pendingPlayRef = useRef(false); // true while first-interaction is registered

  // ------------------------------------------------------------------
  // Initialise audio element once on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const audio = new Audio();
    audio.src    = AUDIO_SRC;
    audio.loop   = true;
    audio.volume = 0.45;
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = (e: Event) => console.warn('[AEGIS audio] load error', e);
    audio.addEventListener('play',  onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    // ── Attempt immediate autoplay ──
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // Browser blocked autoplay — register first-interaction handlers.
        // Using bubble phase so button's onClick fires first and can cancel
        // these listeners to avoid the play→pause double-trigger race.
        pendingPlayRef.current = true;

        const startAudio = () => {
          pendingPlayRef.current = false;
          if (userPausedRef.current || !audioRef.current) return;
          audioRef.current.play().catch(() => {});
        };

        document.addEventListener('click',      startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true, passive: true });
        document.addEventListener('keydown',    startAudio, { once: true });

        // Store cleanup so togglePlay can cancel before double-firing
        audioRef.current._pendingCleanup = () => {
          document.removeEventListener('click',      startAudio);
          document.removeEventListener('touchstart', startAudio);
          document.removeEventListener('keydown',    startAudio);
          pendingPlayRef.current = false;
        };
      });

    return () => {
      audio.pause();
      audio.removeEventListener('play',  onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio._pendingCleanup?.();
      audioRef.current = null;
    };
  }, []);

  // ------------------------------------------------------------------
  // Toggle — explicit user action
  // ------------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Cancel pending first-interaction listener so it doesn't double-fire
      audio._pendingCleanup?.();
      delete audio._pendingCleanup;

      userPausedRef.current = false;
      audio.play().catch(() => {});
    } else {
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

// Augment HTMLAudioElement to allow the cleanup ref trick
declare global {
  interface HTMLAudioElement {
    _pendingCleanup?: () => void;
  }
}
