import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Compact audio controls for navigation headers (AppShell and Landing).
 */
export function HeaderMusicControl() {
  const { isPlaying, togglePlay, replay, stop, currentTime, duration } = useAudio();

  return (
    <div className="flex items-center gap-1.5 bg-[#050810] border border-[#1a2840] hover:border-[#334155] rounded-sm px-2 py-1 transition-all">
      {/* Equalizer animation indicator */}
      <div className="flex items-end gap-0.5 h-3.5 w-3.5 px-0.5" title={isPlaying ? 'Music Playing' : 'Music Stopped'}>
        <span
          className={`w-0.5 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-[#00d4f7] h-3 animate-pulse' : 'bg-[#475569] h-1'
          }`}
        />
        <span
          className={`w-0.5 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-[#00d4f7] h-2 animate-pulse' : 'bg-[#475569] h-1.5'
          }`}
          style={{ animationDelay: '150ms' }}
        />
        <span
          className={`w-0.5 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-[#00d4f7] h-3.5 animate-pulse' : 'bg-[#475569] h-0.5'
          }`}
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Track info */}
      <span className="text-[9px] font-mono text-[#94a3b8] tracking-wider hidden md:inline truncate max-w-[130px]" title="The Gentle Observer">
        THE GENTLE OBSERVER
      </span>

      {/* Main Play / Stop Button */}
      <button
        onClick={togglePlay}
        className={`px-2 py-0.5 text-[9px] font-mono tracking-wider font-semibold rounded-xs transition-all cursor-pointer flex items-center gap-1 ${
          isPlaying
            ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40 hover:bg-[#f43f5e]/25'
            : 'bg-[#00d4f7]/10 text-[#00d4f7] border border-[#00d4f7]/30 hover:bg-[#00d4f7]/20'
        }`}
        title={isPlaying ? 'Pause/Stop Music' : 'Play Background Music'}
      >
        <span>{isPlaying ? '⏸' : '▶'}</span>
        <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
      </button>

      {/* Replay Button (restarts from beginning) */}
      <button
        onClick={replay}
        className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-[#94a3b8] hover:text-[#e2e8f0] border border-[#1a2840] hover:border-[#475569] rounded-xs transition-all cursor-pointer"
        title="Replay from start"
      >
        <span className="text-[10px]">↺</span>
        <span className="hidden sm:inline ml-1">REPLAY</span>
      </button>
    </div>
  );
}

/**
 * Floating mini audio player dockable in bottom-left corner with time scrub & volume.
 */
export function FloatingMusicPlayer() {
  const {
    isPlaying,
    togglePlay,
    replay,
    stop,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = useAudio();

  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-[#0a1020]/90 backdrop-blur border border-[#1a2840] hover:border-[#00d4f7]/50 rounded-full px-3 py-1.5 shadow-lg transition-all cursor-pointer text-[#94a3b8] hover:text-[#00d4f7]"
        title="Open Ambient Music Controls"
      >
        <span className={`text-xs ${isPlaying ? 'text-[#00d4f7]' : 'text-[#64748b]'}`}>♫</span>
        <span className="text-[9px] font-mono tracking-wider">
          {isPlaying ? 'MUSIC PLAYING' : 'MUSIC CONTROLS'}
        </span>
      </button>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-[#0a1020]/95 backdrop-blur-md border border-[#1a2840] rounded-sm p-2.5 shadow-2xl max-w-xs w-72 transition-all">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs ${isPlaying ? 'text-[#00d4f7]' : 'text-[#64748b]'}`}>♫</span>
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-semibold text-[#e2e8f0] tracking-wider truncate">
              The Gentle Observer
            </p>
            <p className="text-[8px] font-mono text-[#64748b]">AMBIENT AUDIO</p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-[#64748b] hover:text-[#94a3b8] text-xs px-1 cursor-pointer"
          title="Minimize player"
        >
          ▾
        </button>
      </div>

      {/* Progress track */}
      <div className="space-y-1 mb-2">
        <div
          className="relative w-full h-1 bg-[#1a2840] rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div
            className="h-full bg-[#00d4f7] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono text-[#64748b]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1a2840]">
        <div className="flex items-center gap-1.5">
          {/* Play/Stop button */}
          <button
            onClick={togglePlay}
            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider rounded-xs transition-all cursor-pointer flex items-center gap-1 ${
              isPlaying
                ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/40 hover:bg-[#f43f5e]/25'
                : 'bg-[#00d4f7] text-[#050b14] hover:bg-[#38bdf8]'
            }`}
          >
            <span>{isPlaying ? '⏸' : '▶'}</span>
            <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
          </button>

          {/* Replay button */}
          <button
            onClick={replay}
            className="px-2 py-1 text-[9px] font-mono border border-[#1a2840] text-[#94a3b8] hover:border-[#475569] hover:text-[#e2e8f0] rounded-xs transition-all cursor-pointer flex items-center gap-1"
            title="Replay from beginning"
          >
            <span>↺</span>
            <span>REPLAY</span>
          </button>
        </div>

        {/* Volume & Mute */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className="text-[10px] text-[#64748b] hover:text-[#94a3b8] cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? '🔇' : '🔉'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-12 h-1 accent-[#00d4f7] cursor-pointer bg-[#1a2840] rounded-full"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}
