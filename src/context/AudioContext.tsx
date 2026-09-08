import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import audioSrc from '../assets/The_Gentle_Observer.mp3';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(0.5);

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      userPausedRef.current = false;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      // Browser autoplay policy might block before interaction
      console.warn('Playback waiting for user gesture:', err);
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    userPausedRef.current = true;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);

  useEffect(() => {
    // Initialize audio instance
    const audio = new Audio(audioSrc);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Attempt autoplay immediately
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // If autoplay was blocked by browser policy, play on first user interaction anywhere
        const startOnInteraction = () => {
          if (!userPausedRef.current && audioRef.current) {
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          }
          window.removeEventListener('pointerdown', startOnInteraction);
          window.removeEventListener('keydown', startOnInteraction);
        };

        window.addEventListener('pointerdown', startOnInteraction, { once: true });
        window.addEventListener('keydown', startOnInteraction, { once: true });
      });

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audioRef.current = null;
    };
  }, [volume]);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        play,
        pause,
        togglePlay,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
