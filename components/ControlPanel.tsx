
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
      {/* --- TOP HEADER (Solid Black Strip) --- */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-black border-b border-gray-800 z-50 flex items-center justify-between px-4 shadow-2xl">
        
        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-3">
           <button 
              onClick={onHome} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-500 transition-all active:scale-95 group"
              aria-label="Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>

            {isRunning && (
              <button 
                onClick={onEndGame} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-500 transition-all active:scale-95 group"
                aria-label="End Game"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
        </div>

        {/* Center: Mini Status (Optional, keeping main score in gameplay area but ensuring this space is reserved) */}
        <div className="flex-1"></div>

        {/* Right: Sound Control */}
        <div>
            <button 
              onClick={toggleSound}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-95 group ${isMuted ? 'bg-red-900/20 border-red-900 text-red-500' : 'bg-indigo-900/20 border-indigo-900 text-indigo-500'}`}
               aria-label={isMuted ? "Unmute" : "Mute"}
            >
               <span className="text-lg group-hover:scale-110 transition-transform">{isMuted ? '🔇' : '🔊'}</span>
            </button>
        </div>
      </div>

      {/* --- GAMEPLAY HUD (Located below Header) --- */}
      {isRunning && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none w-full max-w-[200px]">
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
        <div className="absolute top-48 left-0 right-0 flex justify-center pointer-events-none z-30 select-none px-4">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 animate-pulse bg-black/80 px-6 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] text-center">
              {message}
            </p>
        </div>
      )}
    </>
  );
};

export { ControlPanel };
