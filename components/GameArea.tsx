
import React from 'react';
import { CircleData, GameType } from '../types';
import { Circle } from './Circle';

interface GameAreaProps {
  circles: CircleData[];
  activeGame: GameType | null;
  onCircleClick: (id: string, isTarget: boolean, type?: string) => void;
  onMissClick: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({ circles, activeGame, onCircleClick, onMissClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onMissClick();
    }
  };

  // Unique background effects based on the game
  const getBackgroundOverlay = () => {
    switch (activeGame) {
      case 'weight':
        return <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />;
      case 'shift':
        return <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />;
      case 'echo':
        return <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(255,255,255,0.02)_25%,_transparent_25%,_transparent_50%,_rgba(255,255,255,0.02)_50%,_rgba(255,255,255,0.02)_75%,_transparent_75%,_transparent)] bg-[length:20px_20px] pointer-events-none" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full cursor-crosshair overflow-hidden transition-colors duration-1000 ${
        activeGame === 'blind' ? 'bg-[#020202]' : ''
      }`}
      onClick={handleClick}
    >
      {getBackgroundOverlay()}
      {circles.map((circle) => (
        <Circle 
          key={circle.id} 
          circle={circle} 
          activeGame={activeGame}
          onClick={onCircleClick} 
        />
      ))}
    </div>
  );
};

export { GameArea };
