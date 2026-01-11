
import React from 'react';
import { CircleData } from '../types';
import { Circle } from './Circle';

interface GameAreaProps {
  circles: CircleData[];
  onCircleClick: (id: string, isTarget: boolean) => void;
  onMissClick: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({ circles, onCircleClick, onMissClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the game area itself, not a circle
    if (e.target === e.currentTarget) {
      onMissClick();
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full cursor-crosshair"
      onClick={handleClick}
    >
      {circles.map((circle) => (
        <Circle key={circle.id} circle={circle} onClick={onCircleClick} />
      ))}
    </div>
  );
};

export { GameArea };
