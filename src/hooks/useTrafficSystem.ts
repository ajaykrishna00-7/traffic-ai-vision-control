
import { useState, useEffect } from 'react';

interface SystemStatus {
  running: boolean;
  manual_override: boolean;
  current_states: string[];
  vehicle_counts: number[];
  extra_counts: number[];
  current_direction: number;
  remaining_time: number;
  direction_names: string[];
}

export const useTrafficSystem = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const startSystem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error starting system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSystem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });
      
      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error stopping system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setManualOverride = async (enabled: boolean, states?: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'manual_override', 
          enabled,
          states: states || ["RED", "RED", "RED", "RED"]
        }),
      });
      
      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error setting manual override:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    systemStatus,
    startSystem,
    stopSystem,
    setManualOverride,
    isLoading
  };
};
