
import React from 'react';
import { CircleData } from '../types';

interface CircleProps {
  circle: CircleData;
  onClick: (id: string, isTarget: boolean, type?: string) => void;
}

const Circle: React.FC<CircleProps> = ({ circle, onClick }) => {
  const { id, x, y, size, color, isTarget, opacity = 1, scale = 1, type } = circle;

  const getExtraClasses = () => {
    if (type === 'phantom') return 'opacity-30 blur-sm pointer-events-none';
    if (type === 'echo') return 'border-2 border-dashed border-indigo-300 animate-pulse';
    if (type === 'choice-left' || type === 'choice-right') return 'rounded-xl flex items-center justify-center font-bold text-2xl';
    return '';
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ease-out flex items-center justify-center
        ${color}
        ${isTarget ? 'shadow-lg shadow-indigo-500/20' : 'opacity-40'}
        ${getExtraClasses()}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        transform: `scale(${scale})`,
        borderRadius: type?.startsWith('choice') ? '12px' : '50%',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id, isTarget, type);
      }}
    >
      {type === 'choice-left' && "A"}
      {type === 'choice-right' && "B"}
    </div>
  );
};

export { Circle };
