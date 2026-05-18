import type { ClientMessage, ServerEvent } from "./types";

type Handler = (event: ServerEvent) => void;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<Handler>>();
  private allHandlers = new Set<Handler>();
  private reconnectTimer = 0;
  private manuallyClosed = false;
  private bufferedEvents: ServerEvent[] = [];

  lastSeqId = 0;
  status: "connecting" | "open" | "closed" = "closed";

  constructor(private readonly url: string) {}

  connect() {
    this.manuallyClosed = false;
    this.status = "connecting";

    const replayUrl = new URL(this.url);
    replayUrl.searchParams.set("last_seq", String(this.lastSeqId));
    this.socket = new WebSocket(replayUrl);

    this.socket.addEventListener("open", () => {
      this.status = "open";
      window.clearTimeout(this.reconnectTimer);
    });

    this.socket.addEventListener("message", (message) => {
      const event = JSON.parse(message.data) as ServerEvent;
      this.lastSeqId = Math.max(this.lastSeqId, event.seq ?? 0);
      this.dispatch(event);
    });

    this.socket.addEventListener("close", () => {
      this.status = "closed";
      if (!this.manuallyClosed) {
        this.reconnectTimer = window.setTimeout(() => this.connect(), 1200);
      }
    });
  }

  close() {
    this.manuallyClosed = true;
    window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }

  sendMessage(payload: ClientMessage) {
    const serialized = JSON.stringify(payload);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(serialized);
    }
  }

  onEvent(type: ServerEvent["event"], handler: Handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    this.bufferedEvents
      .filter((event) => event.event === type)
      .forEach((event) => handler(event));

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  onAnyEvent(handler: Handler) {
    this.allHandlers.add(handler);
    this.bufferedEvents.forEach((event) => handler(event));
    return () => {
      this.allHandlers.delete(handler);
    };
  }

  receiveMockEvent(event: ServerEvent) {
    this.lastSeqId = Math.max(this.lastSeqId, event.seq);
    this.dispatch(event);
  }

  private dispatch(event: ServerEvent) {
    if (!this.handlers.has(event.event) && this.allHandlers.size === 0) {
      this.bufferedEvents.push(event);
      return;
    }

    this.handlers.get(event.event)?.forEach((handler) => handler(event));
    this.allHandlers.forEach((handler) => handler(event));
  }
}
