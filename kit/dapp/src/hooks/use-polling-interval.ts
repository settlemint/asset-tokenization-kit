import { useEffect, useState } from 'react';

export const usePollingInterval = (defaultInterval: number) => {
  const [interval, setInterval] = useState(defaultInterval);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setInterval(60000); // Slower polling when tab is not visible
      } else {
        setInterval(defaultInterval); // Normal polling when tab is visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [defaultInterval]);

  return interval;
};
