import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { toast } = useToast();

  const connect = useCallback((retryCount = 0) => {
    if (!token || !isAuthenticated) return null;

    // Connect to FastAPI SSE endpoint
    const eventSource = new EventSource(`/api/v1/notifications/stream?token=${token}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("SSE connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle ping events silently
        if (data.event === 'ping') return;

        setNotifications((prev) => [data, ...prev]);

        // Show toast for important events
        if (data.event !== 'ping') {
          toast({
            title: "New Notification",
            description: data.message,
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
      eventSource.close();
      
      // If we're not authenticated anymore, don't try to reconnect
      if (!useAuthStore.getState().isAuthenticated) return;

      // Exponential backoff for reconnect (max 30 seconds)
      const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.log(`Reconnecting SSE in ${timeout}ms...`);
      setTimeout(() => connect(retryCount + 1), timeout);
    };

    return eventSource;
  }, [token, isAuthenticated, toast]);

  useEffect(() => {
    let eventSource = null;
    if (isAuthenticated && token) {
      eventSource = connect();
    }
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [connect, isAuthenticated, token]);

  return { notifications, isConnected };
};
