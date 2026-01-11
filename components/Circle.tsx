
import React from 'react';
import { CircleData } from '../types';

interface CircleProps {
  circle: CircleData;
  onClick: (id: string, isTarget: boolean) => void;
}

const Circle: React.FC<CircleProps> = ({ circle, onClick }) => {
  const { id, x, y, size, color, isTarget } = circle;

  return (
    <div
      className={`absolute rounded-full cursor-pointer transition-colors duration-100 ease-out
        ${color}
        ${isTarget ? 'shadow-md shadow-slate-500/50 hover:scale-105' : 'hover:scale-95'}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={() => onClick(id, isTarget)}
    ></div>
  );
};

export { Circle };
