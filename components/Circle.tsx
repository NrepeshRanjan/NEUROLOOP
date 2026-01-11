
import React from 'react';
import { CircleData, GameType } from '../types';

interface CircleProps {
  circle: CircleData;
  activeGame: GameType | null;
  onClick: (id: string, isTarget: boolean, type?: string) => void;
}

const Circle: React.FC<CircleProps> = ({ circle, activeGame, onClick }) => {
  const { id, x, y, size, color, isTarget, opacity = 1, scale = 1, type } = circle;

  const getStyleOverrides = () => {
    const baseStyle: React.CSSProperties = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: opacity,
      transform: `scale(${scale})`,
    };

    switch (activeGame) {
      case 'delay':
        return {
          ...baseStyle,
          borderRadius: '50%',
          boxShadow: isTarget ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none',
          border: '1px solid rgba(255,255,255,0.1)',
        };
      case 'shift':
        return {
          ...baseStyle,
          borderRadius: type === 'standard' ? '4px' : '50%', // Mix shapes
          rotate: isTarget ? '45deg' : '0deg',
        };
      case 'echo':
        return {
          ...baseStyle,
          borderRadius: '50%',
          border: type === 'echo' ? '2px dashed rgba(165, 180, 252, 0.6)' : '1px solid white',
        };
      case 'weight':
        return {
          ...baseStyle,
          borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%', // "Gooey" blob shape
          filter: 'blur(1px)',
        };
      case 'blind':
        return {
          ...baseStyle,
          borderRadius: '50%',
          filter: 'contrast(150%) brightness(150%)',
        };
      case 'choice':
        return {
          ...baseStyle,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: '900',
          letterSpacing: '-2px',
        };
      default:
        return baseStyle;
    }
  };

  const getAnimationClass = () => {
    if (activeGame === 'delay') return 'animate-pulse';
    if (activeGame === 'echo' && type === 'echo') return 'animate-ping';
    if (activeGame === 'weight') return 'animate-bounce';
    return '';
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-500 ease-out flex items-center justify-center
        ${color}
        ${isTarget ? 'shadow-xl' : 'opacity-20'}
        ${getAnimationClass()}
      `}
      style={getStyleOverrides()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id, isTarget, type);
      }}
    >
      {activeGame === 'choice' && (
        <span className="text-white drop-shadow-md">
          {type === 'choice-left' ? 'LEFT' : 'RIGHT'}
        </span>
      )}
      {activeGame === 'delay' && isTarget && (
        <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
      )}
    </div>
  );
};

export { Circle };
