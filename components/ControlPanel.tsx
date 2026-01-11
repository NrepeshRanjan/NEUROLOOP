
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
      {/* TOP LEFT: Navigation (Persistent Home & Back) */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
         {/* Home Button */}
         <button 
            onClick={onHome} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900/80 border border-gray-700 hover:border-white text-gray-400 hover:text-white transition-all shadow-lg active:scale-95 backdrop-blur-sm"
            aria-label="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* Back/End Game Button */}
          {isRunning && (
            <button 
              onClick={onEndGame} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900/80 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-500 transition-all shadow-lg active:scale-95 backdrop-blur-sm"
              aria-label="End Game"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
      </div>

      {/* TOP RIGHT: Sound Toggle (Matching GameSelector position) */}
      <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={toggleSound}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 backdrop-blur-sm border ${isMuted ? 'bg-red-900/80 text-red-400 border-red-500' : 'bg-indigo-900/80 text-indigo-400 border-indigo-500'}`}
             aria-label={isMuted ? "Unmute" : "Mute"}
          >
             {isMuted ? '🔇' : '🔊'}
          </button>
      </div>

      {/* TOP CENTER: Score & Status (Only if running) */}
      {isRunning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none">
            <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] tracking-tighter leading-none">
              {score}
            </div>
            <div className="text-[10px] text-gray-400 font-mono tracking-[0.2em] mt-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
              {formatTime(gameTime)}
            </div>
        </div>
      )}

      {/* MESSAGE OVERLAY */}
      {isRunning && message && (
        <div className="absolute top-28 left-0 right-0 flex justify-center pointer-events-none z-30 select-none">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 animate-pulse bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-white/5">
              {message}
            </p>
        </div>
      )}
    </>
  );
};

export { ControlPanel };
