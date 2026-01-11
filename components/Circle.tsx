
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

    // Game Specific Overrides
    if (activeGame === 'orbit') {
      return {
        ...baseStyle,
        borderRadius: '50%',
        boxShadow: type === 'player' ? '0 0 15px rgba(99, 102, 241, 0.8)' : 'none',
      };
    }
    
    if (activeGame === 'flux') {
      return {
        ...baseStyle,
        borderRadius: '50%',
        boxShadow: type === 'player' ? `0 0 40px ${color === 'bg-white' ? 'rgba(255,255,255,0.4)' : 'rgba(244,63,94,0.4)'}` : 'none',
        transition: 'background-color 0.3s ease',
      };
    }

    if (activeGame === 'breath') {
      if (type === 'gate') {
        return {
          ...baseStyle,
          borderRadius: '4px',
          width: `${size}px`, // Gates are actually rectangular in logic, but rendered as circles/blocks
          height: '20px', 
        };
      }
    }
    
    if (activeGame === 'phase') {
        if (type === 'target-ring') {
            return {
                ...baseStyle,
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '50%'
            };
        }
        if (type === 'breathing-ring') {
            return {
                ...baseStyle,
                background: 'transparent',
                border: '4px solid #6366f1',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            };
        }
    }

    // Default Fallback
    return {
      ...baseStyle,
      borderRadius: '50%',
    };

  }, [x, y, size, opacity, scale, activeGame, variation, isTarget, type, color]);

  return (
    <div
      className={`absolute cursor-pointer transition-transform duration-75 ease-linear flex items-center justify-center
        ${color}
        ${type === 'player' ? 'z-20' : 'z-10'}
        ${activeGame === 'gather' && type === 'particle' ? 'hover:scale-110 active:scale-90' : ''}
      `}
      style={dynamicStyle}
      onClick={(e) => {
        // Only propagate clicks for interactive elements
        if (activeGame === 'gather' || activeGame === 'flux') {
           e.stopPropagation();
           onClick(id, isTarget, type);
        }
      }}
    >
      {/* Visual flourishes */}
      {activeGame === 'avoid' && type === 'player' && (
        <div className="absolute inset-0 border border-indigo-400 rounded-full animate-ping opacity-20" />
      )}
    </div>
  );
};

export { Circle };
