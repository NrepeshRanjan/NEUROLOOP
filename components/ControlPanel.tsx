
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
      {/* TOP BAR - ALWAYS VISIBLE DURING GAME */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 text-white z-50 flex items-center justify-between px-4 select-none">
        
        {/* LEFT: Navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onHome} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          {/* Pause/Back (Only if running) */}
          {isRunning && (
            <button 
              onClick={onEndGame} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 active:scale-95 transition-all text-gray-300 hover:text-red-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* CENTER: Status (Only if running) */}
        {isRunning && (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-indigo-500 tracking-tighter leading-none">
              {score}
            </div>
            <div className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">
              {formatTime(gameTime)}
            </div>
          </div>
        )}

        {/* RIGHT: Sound & Settings */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSound}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}
          >
             {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* BOTTOM MESSAGE BAR (Only if running) */}
      {isRunning && (
        <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 animate-pulse bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
              {message}
            </p>
        </div>
      )}
    </>
  );
};

export { ControlPanel };
