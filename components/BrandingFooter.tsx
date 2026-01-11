
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../services/audioService';

interface BrandingFooterProps {
  onAdminAccessAttempt: () => void;
  appVersion?: string;
}

const BrandingFooter: React.FC<BrandingFooterProps> = ({ onAdminAccessAttempt, appVersion = 'v1.0.0' }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isMuted, setIsMuted] = useState(audioService.getMuted());
  const clickTimeoutRef = useRef<number | null>(null);
  const REQUIRED_CLICKS = 5;
  const RESET_TIMEOUT_MS = 3000;

  const handleVersionClick = useCallback(() => {
    setClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);

      if (newCount >= REQUIRED_CLICKS) {
        onAdminAccessAttempt();
        return 0;
      }

      clickTimeoutRef.current = window.setTimeout(() => {
        setClickCount(0);
      }, RESET_TIMEOUT_MS);

      return newCount;
    });
  }, [onAdminAccessAttempt]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const toggleSound = () => {
    const newState = audioService.toggleMute();
    setIsMuted(newState);
    if (!newState) audioService.playClick();
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-center justify-center text-gray-500 text-xs md:text-sm z-20 pointer-events-none">
      <div className="pointer-events-auto mb-2">
        <button 
          onClick={toggleSound}
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      <div className="pointer-events-auto text-center">
        <p>Developed by <span className="font-bold text-gray-400">maaZone</span></p>
        <p className="mt-1">
          Version:{" "}
          <span
            className="cursor-pointer hover:text-gray-300 transition-colors select-none"
            onClick={handleVersionClick}
            role="button"
          >
            {appVersion}
          </span>
        </p>
      </div>
    </footer>
  );
};

export { BrandingFooter };
