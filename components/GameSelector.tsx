
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
    <div className="flex flex-col items-center w-full min-h-screen bg-[#050505]">
       
       {/* --- TOP HEADER (Solid Black Strip) --- */}
       <div className="fixed top-0 left-0 right-0 h-20 bg-black border-b border-gray-800 z-50 flex items-center justify-between px-4 shadow-2xl">
          {/* Left: Branding */}
          <div className="flex flex-col items-start justify-center">
             <h1 className="text-2xl font-black tracking-tighter text-indigo-500 italic leading-none drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
               NEUROLOOP
             </h1>
             <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'} animate-pulse`} />
                <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </p>
             </div>
          </div>

          {/* Right: Sound Control */}
          <button 
            onClick={toggleSound}
            className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-95 hover:bg-gray-900 ${isMuted ? 'border-red-900 text-red-500' : 'border-indigo-900 text-indigo-500'}`}
            aria-label="Toggle Sound"
          >
             <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
          </button>
       </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center pt-28 pb-32 px-4 animate-fade-in select-none">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className="group relative flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl overflow-hidden active:bg-gray-800"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl mb-3 group-hover:animate-pulse filter grayscale group-hover:grayscale-0 transition-all">{game.icon}</span>
              <h3 className="text-lg font-bold text-gray-300 group-hover:text-indigo-400 transition-colors mb-1">{game.name}</h3>
              <p className="text-[10px] text-gray-600 group-hover:text-gray-400 leading-tight">{game.description}</p>
            </button>
          ))}
        </div>

        {/* Banner Ad Placeholder */}
        {appConfig?.banner_enabled && (
          <div className="w-full max-w-[320px] h-[50px] bg-black border border-gray-800 flex items-center justify-center text-[10px] text-gray-700 uppercase tracking-widest mt-8 rounded">
            AdMob Banner Space
          </div>
        )}
      </div>
    </div>
  );
};

export { GameSelector };
