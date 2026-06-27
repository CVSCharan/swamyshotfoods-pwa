import { useRef } from 'react';
import { useStoreConfigStore } from '../stores/useStoreConfigStore';
import { config } from '../config/env';

// Construct the correct SSE URL
const SSE_URL = `${config.apiBaseUrl.replace('/api', '')}/api/store-config/sse`;
const RECONNECT_DELAY = 3000;

export const useStoreConfigSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { setConfig, setConnected, setError } = useStoreConfigStore();

  const connect = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      console.log('🔌 Connecting to SSE:', SSE_URL);
      const eventSource = new EventSource(SSE_URL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE Connected');
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            console.log('📦 SSE Data received:', data);
            setConfig(data);
          }
        } catch (err) {
          console.error('❌ Failed to parse SSE data:', err);
          setError('Failed to parse server data');
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ SSE Error:', err);
        setConnected(false);
        setError('Connection lost. Reconnecting...');

        // Close and attempt reconnect
        eventSource.close();
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, RECONNECT_DELAY);
      };
    } catch (err) {
      console.error('❌ Failed to create EventSource:', err);
      setError('Failed to connect to server');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
      console.log('🔌 SSE Disconnected');
    }
  };



  return { disconnect, connect };
};
