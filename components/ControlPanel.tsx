
import React from 'react';
import { GameState, GameRule } from '../types';
import { Button } from './Button';

interface ControlPanelProps {
  gameState: GameState;
  currentRules: GameRule;
  onStartGame: () => void;
  onEndGame: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  onStartGame,
  onEndGame,
}) => {
  const { isRunning, score, accuracy, gameTime, activeGame, message } = gameState;

  const formatTime = (seconds: number): string => {
    const remaining = 60 - seconds;
    return `00:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-md border-b border-white/10 text-white z-40 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black tracking-tighter text-indigo-500">NEUROLOOP</h2>
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded border border-indigo-500/30 uppercase font-bold">
            {activeGame || 'SYSTEM_IDLE'}
          </span>
        </div>
        <div className="flex gap-4 mt-1 text-xs text-gray-400 font-mono">
          <p>VAL: <span className="text-white">{score}</span></p>
          <p>ACC: <span className="text-white">{accuracy.toFixed(1)}%</span></p>
          <p>TIME: <span className="text-white">{formatTime(gameTime)}</span></p>
        </div>
      </div>

      <div className="flex-1 text-center">
        <p className="text-[10px] uppercase tracking-widest text-indigo-400 opacity-70 animate-pulse">
          {message}
        </p>
      </div>

      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={onStartGame} className="text-sm px-4 py-2">BOOT ENGINE</Button>
        ) : (
          <Button onClick={onEndGame} className="bg-red-900/50 hover:bg-red-800 text-sm px-4 py-2 border border-red-500/30">ABORT</Button>
        )}
      </div>
    </div>
  );
};

export { ControlPanel };
