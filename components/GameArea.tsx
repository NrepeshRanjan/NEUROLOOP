
import React from 'react';
import { CircleData, GameType } from '../types';
import { Circle } from './Circle';

interface GameAreaProps {
  circles: CircleData[];
  activeGame: GameType | null;
  variation?: string;
  onCircleClick: (id: string, isTarget: boolean, type?: string) => void;
  onMissClick: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({ circles, activeGame, variation, onCircleClick, onMissClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onMissClick();
    }
  };

  const getBackgroundOverlay = () => {
    switch (activeGame) {
      case 'weight':
        return <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)] pointer-events-none" />;
      case 'shift':
        return <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10 pointer-events-none" />;
      case 'echo':
        return <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full cursor-crosshair overflow-hidden transition-colors duration-1000 ${
        activeGame === 'blind' ? 'bg-[#010101]' : 'bg-[#050505]'
      }`}
      onClick={handleClick}
    >
      {getBackgroundOverlay()}
      {circles.map((circle) => (
        <Circle 
          key={circle.id} 
          circle={circle} 
          activeGame={activeGame}
          variation={variation}
          onClick={onCircleClick} 
        />
      ))}
    </div>
  );
};

export { GameArea };