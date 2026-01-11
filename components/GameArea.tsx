
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
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-full cursor-crosshair overflow-hidden transition-colors duration-1000 bg-[#050505]`}
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
