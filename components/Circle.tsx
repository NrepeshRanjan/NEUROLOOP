
import React, { useMemo } from 'react';
import { CircleData, GameType } from '../types';

interface CircleProps {
  circle: CircleData;
  activeGame: GameType | null;
  variation?: string;
  onClick: (id: string, isTarget: boolean, type?: string) => void;
}

const Circle: React.FC<CircleProps> = ({ circle, activeGame, variation, onClick }) => {
  const { id, x, y, size, color, isTarget, opacity = 1, scale = 1, type, spawnTime } = circle;

  const dynamicStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: opacity,
      transform: `scale(${scale})`,
    };

    // Variation-specific visual overrides
    if (activeGame === 'shift' && variation === 'shape-morph') {
      const morph = (Math.sin(Date.now() / 300) + 1) / 2; // 0 to 1
      baseStyle.borderRadius = `${morph * 50}%`; // Oscillate between square and circle
    }

    switch (activeGame) {
      case 'delay':
        return {
          ...baseStyle,
          borderRadius: '50%',
          boxShadow: isTarget ? '0 0 30px rgba(99, 102, 241, 0.3)' : 'none',
          border: '1px solid rgba(255,255,255,0.05)',
        };
      case 'shift':
        return {
          ...baseStyle,
          borderRadius: baseStyle.borderRadius || (isTarget ? '50%' : '2px'),
          rotate: isTarget ? '0deg' : '45deg',
        };
      case 'echo':
        return {
          ...baseStyle,
          borderRadius: '50%',
          border: type === 'echo' ? '2px dashed rgba(165, 180, 252, 0.4)' : '1px solid white',
        };
      case 'weight':
        return {
          ...baseStyle,
          borderRadius: '45% 55% 60% 40% / 50% 50% 50% 50%',
          filter: 'blur(0.5px)',
        };
      case 'blind':
        return {
          ...baseStyle,
          borderRadius: '50%',
        };
      case 'choice':
        return {
          ...baseStyle,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: '800',
        };
      default:
        return baseStyle;
    }
  }, [x, y, size, opacity, scale, activeGame, variation, isTarget, type]);

  const getAnimationClass = () => {
    if (activeGame === 'delay' && variation === 'ghost-pulse') return ''; // Handled by inline opacity
    if (activeGame === 'delay') return 'animate-pulse';
    if (activeGame === 'echo' && type === 'echo') return 'animate-ping';
    return '';
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ease-out flex items-center justify-center
        ${color}
        ${isTarget ? 'shadow-2xl' : 'opacity-10'}
        ${getAnimationClass()}
      `}
      style={dynamicStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id, isTarget, type);
      }}
    >
      {activeGame === 'choice' && (
        <span className="text-white/80 select-none">
          {type === 'choice-left' ? 'ALPHA' : 'BETA'}
        </span>
      )}
      {activeGame === 'delay' && isTarget && (
        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-10" />
      )}
    </div>
  );
};

export { Circle };