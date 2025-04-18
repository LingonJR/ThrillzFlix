import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const UblockNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if notification has been dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('ublockNotificationDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ublockNotificationDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-xs bg-gray-900 rounded-lg shadow-xl border border-primary/20 z-50 overflow-hidden">
      <div className="p-4 pr-10">
        <p className="text-sm text-white mb-2">
          <span className="font-semibold text-primary">Recommended:</span> Use uBlock Origin for a better experience.
        </p>
        <a 
          href="https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline inline-block"
        >
          Download it here
        </a>
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white p-1"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default UblockNotification;