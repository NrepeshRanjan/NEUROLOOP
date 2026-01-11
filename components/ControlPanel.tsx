
import React, { useState, useEffect } from 'react';
import { GameState, GameRule } from '../types';
import { audioService } from '../services/audioService';

interface ControlPanelProps {
  gameState: GameState;
  currentRules: GameRule;
  onStartGame: () => void;
  onEndGame: () => void;
  onHome: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  onStartGame,
  onEndGame,
  onHome,
}) => {
  const { isRunning, score, accuracy, gameTime, message } = gameState;
  const [isMuted, setIsMuted] = useState(audioService.getMuted());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const toggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) audioService.playClick();
  };

  const formatTime = (seconds: number): string => {
    const remaining = 90 - seconds;
    return remaining > 0 ? `00:${remaining.toString().padStart(2, '0')}` : 'OVERTIME';
  };

  return (
    <>
      {/* TOP LEFT: Control Group (Home, Back, Sound) */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex flex-row gap-3 md:gap-4 items-start">
         {/* Home Button */}
         <button 
            onClick={onHome} 
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-gray-900/90 border-2 border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-500 transition-all shadow-lg active:scale-90 backdrop-blur-sm group"
            aria-label="Home"
            style={{ touchAction: 'manipulation' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* Sound Toggle */}
          <button 
            onClick={toggleSound}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-gray-900/90 border-2 transition-all shadow-lg active:scale-90 backdrop-blur-sm group ${isMuted ? 'border-red-500/50 text-red-400' : 'border-indigo-500/50 text-indigo-400'}`}
             aria-label={isMuted ? "Unmute" : "Mute"}
             style={{ touchAction: 'manipulation' }}
          >
             <span className="text-xl group-hover:scale-110 transition-transform">{isMuted ? '🔇' : '🔊'}</span>
          </button>

          {/* Back/End Game Button */}
          {isRunning && (
            <button 
              onClick={onEndGame} 
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-gray-900/90 border-2 border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-500 transition-all shadow-lg active:scale-90 backdrop-blur-sm group"
              aria-label="End Game"
              style={{ touchAction: 'manipulation' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
      </div>

      {/* TOP RIGHT: Branding & Status (Compact) */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 pointer-events-none select-none text-right flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity duration-300">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)] italic leading-none">
            NEUROLOOP
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <p className="text-[8px] md:text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
      </div>

      {/* TOP CENTER: Score & Status (Only if running) */}
      {isRunning && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none w-full max-w-[200px]">
            <div className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.6)] tracking-tighter leading-none">
              {score}
            </div>
            <div className="text-[10px] text-gray-400 font-mono tracking-[0.2em] mt-1 bg-black/60 px-3 py-0.5 rounded-full backdrop-blur-md border border-white/5">
              {formatTime(gameTime)}
            </div>
        </div>
      )}

      {/* MESSAGE OVERLAY */}
      {isRunning && message && (
        <div className="absolute top-36 left-0 right-0 flex justify-center pointer-events-none z-30 select-none px-4">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 animate-pulse bg-black/60 px-6 py-2 rounded-full backdrop-blur-md border border-indigo-500/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] text-center">
              {message}
            </p>
        </div>
      )}
    </>
  );
};

export { ControlPanel };
