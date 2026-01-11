
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
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center">
      {/* Solid Black Footer Strip */}
      <div className="w-full h-16 bg-black border-t border-gray-800 flex flex-col items-center justify-center text-[10px] uppercase tracking-widest shadow-2xl">
        <div className="text-center group cursor-default">
           <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-[0.2em] flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
             POWERED BY <span className="text-white font-black">maaZone</span>
           </p>
           <p className="text-[8px] text-gray-700 font-mono">
             NEUROLOOP ENGINE <span 
               className="cursor-pointer hover:text-indigo-500 transition-colors text-gray-800" 
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
