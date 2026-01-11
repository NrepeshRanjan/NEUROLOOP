
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface BrandingFooterProps {
  onAdminAccessAttempt: () => void;
  appVersion?: string;
}

const BrandingFooter: React.FC<BrandingFooterProps> = ({ onAdminAccessAttempt, appVersion = 'v1.0.0' }) => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);
  const REQUIRED_CLICKS = 5;
  const RESET_TIMEOUT_MS = 3000; // 3 seconds

  const handleVersionClick = useCallback(() => {
    setClickCount((prevCount) => {
      const newCount = prevCount + 1;

      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }

      // If enough clicks, trigger admin access and reset
      if (newCount >= REQUIRED_CLICKS) {
        onAdminAccessAttempt();
        return 0; // Reset count
      }

      // Set a new timeout to reset if clicks stop
      clickTimeoutRef.current = window.setTimeout(() => {
        setClickCount(0);
      }, RESET_TIMEOUT_MS);

      return newCount;
    });
  }, [onAdminAccessAttempt]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);


  return (
    <footer className="absolute bottom-0 left-0 right-0 p-3 text-center text-gray-500 text-xs md:text-sm z-20">
      <p>Developed by <span className="font-bold">maaZone</span></p>
      <p className="mt-1">
        Version:{" "}
        <span
          className="cursor-pointer hover:text-gray-300 transition-colors"
          onClick={handleVersionClick}
          aria-label={`App version ${appVersion}. Click ${REQUIRED_CLICKS} times to access admin panel.`}
          role="button"
          tabIndex={0}
        >
          {appVersion}
        </span>
      </p>
    </footer>
  );
};

export { BrandingFooter };
