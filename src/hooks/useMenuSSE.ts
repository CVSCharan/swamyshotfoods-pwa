import { useRef } from 'react';
import { useMenuStore } from '../stores/useMenuStore';
import { menuService } from '../services/menuService';
import { config } from '../config/env';

const SSE_URL = `${config.apiBaseUrl}/menu/sse`;
const RECONNECT_DELAY = 3000;

export const useMenuSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectionIdRef = useRef<number>(0);
  const { setItems, setError } = useMenuStore();

  const connect = async () => {
    const currentId = ++connectionIdRef.current;

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 1. Fetch initial menu via HTTP GET
    try {
      const initialMenu = await menuService.getAll();
      if (currentId !== connectionIdRef.current) {
        console.log('🔌 Menu Connection attempt superseded or aborted before GET finished');
        return;
      }
      setItems(initialMenu);
    } catch (err) {
      console.error('❌ Failed to fetch initial menu config via GET:', err);
      if (currentId !== connectionIdRef.current) return;
    }

    // 2. Open EventSource for real-time menu updates
    try {
      console.log('🔌 Connecting to Menu SSE:', SSE_URL);
      const eventSource = new EventSource(SSE_URL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (currentId !== connectionIdRef.current) {
          eventSource.close();
          return;
        }
        console.log('✅ Menu SSE Connected');
        setError(null);
      };

      eventSource.onmessage = (event) => {
        if (currentId !== connectionIdRef.current) {
          eventSource.close();
          return;
        }
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            console.log('📦 Menu SSE Data received:', data.length, 'items');
            setItems(data);
          }
        } catch (err) {
          console.error('❌ Failed to parse Menu SSE data:', err);
          setError('Failed to parse server data');
        }
      };

      eventSource.onerror = (err) => {
        if (currentId !== connectionIdRef.current) {
          eventSource.close();
          return;
        }
        console.error('❌ Menu SSE Error:', err);
        setError('Connection lost. Reconnecting...');

        // Close and attempt reconnect
        eventSource.close();
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('🔄 Attempting to reconnect Menu SSE...');
          connect();
        }, RECONNECT_DELAY);
      };
    } catch (err) {
      if (currentId !== connectionIdRef.current) return;
      console.error('❌ Failed to create Menu EventSource:', err);
      setError('Failed to connect to server');
    }
  };

  const disconnect = () => {
    connectionIdRef.current = -1; // Invalidate any pending connection attempts

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('🔌 Menu SSE Disconnected');
    }
  };

  return { disconnect, connect };
};
