
import React, { useState } from 'react';
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

  const toggleSound = () => {
    const newState = audioService.toggleMute();
    setIsMuted(newState);
    if (!newState) audioService.playClick();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl gap-6 z-10 animate-fade-in select-none">
       {/* Sound Toggle in Menu */}
       <div className="absolute -top-16 right-4 md:right-0">
          <button 
            onClick={toggleSound}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}
          >
             {isMuted ? '🔇' : '🔊'}
          </button>
       </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full p-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className="group relative flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl mb-3 group-hover:animate-pulse filter grayscale group-hover:grayscale-0 transition-all">{game.icon}</span>
            <h3 className="text-xl font-bold text-indigo-400 mb-1">{game.name}</h3>
            <p className="text-xs text-gray-500 text-center group-hover:text-gray-300">{game.description}</p>
          </button>
        ))}
      </div>

      {/* Banner Ad Placeholder */}
      {appConfig?.banner_enabled && (
        <div className="w-full max-w-[320px] h-[50px] bg-gray-900 border border-gray-800 flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest mt-4">
          AdMob Banner Space
        </div>
      )}
    </div>
  );
};

export { GameSelector };
