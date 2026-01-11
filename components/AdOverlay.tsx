
import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface AdOverlayProps {
  type: 'interstitial' | 'rewarded';
  onClose: () => void;
  onReward?: () => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ type, onClose, onReward }) => {
  const [countdown, setCountdown] = useState(type === 'rewarded' ? 5 : 3);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    if (type === 'rewarded' && onReward) {
      onReward();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute top-4 right-4 bg-gray-800 px-3 py-1 rounded text-xs text-gray-400 border border-gray-700">
        ADVERTISEMENT
      </div>

      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-500 mx-auto rounded-full mb-4 animate-pulse" />
        <h3 className="text-xl font-bold mb-2">
          {type === 'rewarded' ? 'Unlock Insight' : 'Game Break'}
        </h3>
        <p className="text-gray-400 mb-8 text-sm">
          {type === 'rewarded' 
            ? 'Watch this short ad to reveal the neurocasual analysis.' 
            : 'Taking a breath between cycles...'}
        </p>

        {canClose ? (
          <Button onClick={handleClose} className="w-full bg-white text-black hover:bg-gray-200">
            {type === 'rewarded' ? 'Collect Reward' : 'Close Ad'}
          </Button>
        ) : (
          <div className="w-full py-3 bg-gray-800 rounded-full text-gray-500 font-mono">
            Wait {countdown}s
          </div>
        )}
      </div>
      
      <p className="mt-8 text-xs text-gray-600">Simulated AdMob Experience</p>
    </div>
  );
};

export { AdOverlay };
