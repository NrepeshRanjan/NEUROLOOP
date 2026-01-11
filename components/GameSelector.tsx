
import React, { useState, useEffect } from 'react';
import { GameType, AppConfig } from '../types';
import { audioService } from '../services/audioService';

interface GameSelectorProps {
  onSelect: (game: GameType) => void;
  appConfig: AppConfig | null;
}

const GAMES: { id: GameType; name: string; description: string; icon: string }[] = [
  { id: 'orbit', name: 'ORBIT', description: 'Timing is survival.', icon: '🪐' },
  { id: 'phase', name: 'PHASE', description: 'Match the rhythm.', icon: '〰️' },
  { id: 'flux', name: 'FLUX', description: 'Control the polarity.', icon: '🌗' },
  { id: 'gather', name: 'GATHER', description: 'Contain the entropy.', icon: '⚛️' },
  { id: 'avoid', name: 'AVOID', description: 'Evade the swarm.', icon: '💠' },
  { id: 'breath', name: 'BREATH', description: 'Size matters.', icon: '🌬️' },
];

const GameSelector: React.FC<GameSelectorProps> = ({ onSelect, appConfig }) => {
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
    const newState = audioService.toggleMute();
    setIsMuted(newState);
    if (!newState) audioService.playClick();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 z-10 animate-fade-in select-none pb-32 pt-24 px-4">
       
       {/* HEADER BACKGROUND */}
       <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-40 pointer-events-none border-b border-white/5" />

       {/* Branding - Fixed Top Left */}
       <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-none select-none text-left flex flex-col items-start">
          <h1 className="text-xl md:text-3xl font-black tracking-tighter text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)] italic leading-none">
            NEUROLOOP
          </h1>
          <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 to-transparent mt-1 mb-1 opacity-50" />
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'} animate-pulse`} />
            <p className="text-[8px] md:text-[10px] text-gray-400 font-mono tracking-widest uppercase opacity-80">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
       </div>

       {/* Sound Toggle - Fixed Top Right */}
       <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
          <button 
            onClick={toggleSound}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-90 backdrop-blur-sm border-2 ${isMuted ? 'bg-red-900/80 text-red-400 border-red-500/50' : 'bg-indigo-900/80 text-indigo-400 border-indigo-500/50'}`}
            aria-label="Toggle Sound"
            style={{ touchAction: 'manipulation' }}
          >
             <span className="text-lg md:text-xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
       </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-2xl mt-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className="group relative flex flex-col items-center justify-center p-4 md:p-8 bg-gray-900/80 border border-gray-800 rounded-2xl hover:border-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden backdrop-blur-sm active:bg-gray-800"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:animate-pulse filter grayscale group-hover:grayscale-0 transition-all">{game.icon}</span>
            <h3 className="text-lg md:text-xl font-bold text-indigo-400 mb-1">{game.name}</h3>
            <p className="text-[10px] md:text-xs text-gray-500 text-center group-hover:text-gray-300 leading-tight">{game.description}</p>
          </button>
        ))}
      </div>

      {/* Banner Ad Placeholder */}
      {appConfig?.banner_enabled && (
        <div className="w-full max-w-[320px] h-[50px] bg-gray-900 border border-gray-800 flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest mt-4 rounded">
          AdMob Banner Space
        </div>
      )}
    </div>
  );
};

export { GameSelector };
