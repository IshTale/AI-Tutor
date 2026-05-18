import { useCallback, useEffect, useMemo, useState } from "react";
import { WebSocketClient } from "../ws/wsClient";
import type { ClientMessage, ServerEvent } from "../ws/types";

const resolveWsUrl = () => {
  const configured = import.meta.env.VITE_AI_TUTOR_WS_URL as string | undefined;
  if (configured) {
    return configured;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:8000/ws`;
};

export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "open" | "closed">("closed");
  const client = useMemo(() => new WebSocketClient(resolveWsUrl()), []);

  useEffect(() => {
    client.connect();
    const interval = window.setInterval(() => setConnectionStatus(client.status), 300);
    return () => {
      window.clearInterval(interval);
      client.close();
    };
  }, [client]);

  const sendMessage = useCallback(
    (payload: ClientMessage) => {
      client.sendMessage(payload);
    },
    [client],
  );

  const onEvent = useCallback(
    <T extends ServerEvent["event"]>(
      type: T,
      handler: (event: Extract<ServerEvent, { event: T }>) => void,
    ) => client.onEvent(type, handler as (event: ServerEvent) => void),
    [client],
  );

  const receiveMockEvent = useCallback((event: ServerEvent) => client.receiveMockEvent(event), [client]);

  return { connectionStatus, sendMessage, onEvent, receiveMockEvent, lastSeqId: client.lastSeqId };
}
