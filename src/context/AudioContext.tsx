/**
 * AEGIS Audio System
 * ==================
 * - Single HTMLAudioElement instance at module scope — survives route changes,
 *   provider re-mounts, and React StrictMode double-invocations.
 * - Audio NEVER starts automatically. It only starts from an explicit user click.
 * - play() is always called with await + try/catch so errors surface cleanly.
 * - Asset path: /audio/aegis-bg.mp3 (served from public/audio/ — no Vite hash).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

// ─── Module-level singleton ───────────────────────────────────────────────────
// Created once when the module is first imported. A new Audio() is not created
// on every render/mount, so there is never more than one audio instance.
const AUDIO_URL = '/audio/aegis-bg.mp3';

let _singletonAudio: HTMLAudioElement | null = null;

function getSingletonAudio(): HTMLAudioElement {
  if (!_singletonAudio) {
    _singletonAudio = new Audio(AUDIO_URL);
    _singletonAudio.loop    = true;
    _singletonAudio.volume  = 0.45;
    _singletonAudio.preload = 'auto';
  }
  return _singletonAudio;
}
// ─────────────────────────────────────────────────────────────────────────────

export type AudioError = 'unavailable' | null;

interface AudioContextType {
  /** true while the audio element is actively playing */
  isPlaying: boolean;
  /** non-null when the audio file cannot be loaded or played */
  audioError: AudioError;
  /**
   * Toggle playback. Must be called directly from a user interaction handler
   * (click / touchstart) so the browser grants the autoplay permission.
   */
  togglePlay: () => Promise<void>;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [audioError, setAudioError] = useState<AudioError>(null);

  // ── Sync React state with the singleton's real play/pause state ──────────
  useEffect(() => {
    const audio = getSingletonAudio();

    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      console.error('[AEGIS] Audio load error — asset may be missing:', AUDIO_URL);
      setAudioError('unavailable');
      setIsPlaying(false);
    };

    audio.addEventListener('play',  onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    // Reflect current state in case provider remounts mid-playback
    setIsPlaying(!audio.paused);

    return () => {
      audio.removeEventListener('play',  onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      // Do NOT pause or destroy the singleton here — it must survive remounts.
    };
  }, []);

  // ── Toggle: only ever called from a direct user click ───────────────────
  const togglePlay = useCallback(async () => {
    const audio = getSingletonAudio();
    if (audioError === 'unavailable') return;

    if (!audio.paused) {
      // ── PAUSE ──
      audio.pause();
      // State is updated via the 'pause' event listener above.
    } else {
      // ── PLAY ──
      // play() must be called synchronously inside a user-gesture handler.
      // Do NOT defer with setTimeout / Promise chain before this point.
      try {
        await audio.play();
        // State updated via the 'play' event listener above.
      } catch (error) {
        // NotAllowedError  → autoplay blocked (should not happen from a direct click)
        // NotSupportedError → codec/format not supported
        // AbortError       → another play() call aborted this one (harmless)
        const domError = error as DOMException;
        if (domError.name !== 'AbortError') {
          console.error('[AEGIS] music playback failed:', domError.name, domError.message);
          setAudioError('unavailable');
        }
      }
    }
  }, [audioError]);

  return (
    <AudioCtx.Provider value={{ isPlaying, audioError, togglePlay }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextType {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('[AEGIS] useAudio must be called inside <AudioProvider>');
  }
  return ctx;
}
