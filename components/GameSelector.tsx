
import React from 'react';
import { GameType, AppConfig } from '../types';

interface GameSelectorProps {
  onSelect: (game: GameType) => void;
  appConfig: AppConfig | null;
}

const GAMES: { id: GameType; name: string; description: string; icon: string }[] = [
  { id: 'delay', name: 'DELAY', description: 'Waiting is the skill.', icon: '⏳' },
  { id: 'shift', name: 'SHIFT', description: 'Rules change silently.', icon: '🌀' },
  { id: 'echo', name: 'ECHO', description: 'Your actions repeat later.', icon: '👥' },
  { id: 'weight', name: 'WEIGHT', description: 'The screen feels heavy.', icon: '⚖️' },
  { id: 'blind', name: 'BLIND', description: 'Don’t trust what you see.', icon: '🌑' },
  { id: 'choice', name: 'CHOICE', description: 'Consequences appear later.', icon: '⚖️' },
];

const GameSelector: React.FC<GameSelectorProps> = ({ onSelect, appConfig }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 z-10 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full p-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            className="group relative flex flex-col items-center justify-center p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl mb-3 group-hover:animate-pulse">{game.icon}</span>
            <h3 className="text-xl font-bold text-indigo-400 mb-1">{game.name}</h3>
            <p className="text-xs text-gray-400 text-center">{game.description}</p>
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
