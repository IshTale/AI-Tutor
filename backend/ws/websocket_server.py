from collections import defaultdict
from itertools import count

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import TypeAdapter

from backend.ws.event_models import ServerEvent


event_adapter = TypeAdapter(ServerEvent)


class WebSocketHub:
    def __init__(self) -> None:
        self._clients: dict[str, WebSocket] = {}
        self._events: dict[str, list[ServerEvent]] = defaultdict(list)
        self._seq = count(1)

    async def connect(self, client_id: str, websocket: WebSocket, last_seq: int = 0) -> None:
        await websocket.accept()
        self._clients[client_id] = websocket
        await self.replay(client_id, last_seq)

    def disconnect(self, client_id: str) -> None:
        self._clients.pop(client_id, None)

    async def send_event(self, client_id: str, event: ServerEvent) -> None:
        event.seq = next(self._seq)
        self._events[client_id].append(event)
        websocket = self._clients.get(client_id)
        if websocket:
            try:
                await websocket.send_json(event.model_dump())
            except WebSocketDisconnect:
                self.disconnect(client_id)
            except RuntimeError:
                self.disconnect(client_id)

    async def replay(self, client_id: str, last_seq: int) -> None:
        websocket = self._clients.get(client_id)
        if not websocket:
            return
        for event in self._events.get(client_id, []):
            if event.seq > last_seq:
                try:
                    await websocket.send_json(event.model_dump())
                except WebSocketDisconnect:
                    self.disconnect(client_id)
                    return
                except RuntimeError:
                    self.disconnect(client_id)
                    return
