
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
    <footer className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-center text-gray-600 text-[10px] uppercase tracking-widest z-20 pointer-events-none">
      <div className="pointer-events-auto text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
        <p>NEUROLOOP ENGINE</p>
        <p className="mt-1">
          BUILD:{" "}
          <span
            className="cursor-pointer hover:text-white transition-colors select-none font-bold"
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
