
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface BrandingFooterProps {
  onAdminAccessAttempt: () => void;
  appVersion?: string;
}

const BrandingFooter: React.FC<BrandingFooterProps> = ({ onAdminAccessAttempt, appVersion = 'v2.1' }) => {
  const [clickCount, setClickCount] = useState(0);
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

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-end">
      {/* Visual Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-900/50 to-transparent mb-0" />
      
      {/* Content Area */}
      <div className="w-full bg-[#050505]/95 backdrop-blur-md pb-6 pt-4 flex flex-col items-center justify-center text-[10px] uppercase tracking-widest shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-auto text-center group cursor-default transition-all duration-300 hover:scale-105">
           <p className="text-[10px] text-indigo-400 font-bold mb-1 tracking-[0.2em] flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
             POWERED BY <span className="text-white font-black">maaZone</span>
           </p>
           <p className="text-[8px] text-gray-700 font-mono">
             NEUROLOOP ENGINE <span 
               className="cursor-pointer hover:text-indigo-500 transition-colors text-gray-600" 
               onClick={handleVersionClick}
             >
               {appVersion}
             </span>
           </p>
        </div>
      </div>
    </footer>
  );
};

export { BrandingFooter };
