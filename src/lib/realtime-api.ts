import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "./api";

// One shared Socket.IO connection for the whole portal — Notifications
// and Directory messaging both listen on it rather than each opening
// their own (see RealtimeGateway on the backend: one namespace, one
// room per signed-in user). Lazily created on first use; recreated if
// the stored token has changed since the last connection (e.g. a
// fresh login), since the handshake only happens once, at connect
// time — the socket never re-authenticates mid-connection.
let socket: Socket | null = null;
let socketToken: string | null = null;

const getToken = () =>
  localStorage.getItem("boardToken") ?? sessionStorage.getItem("boardToken");

export function getRealtimeSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (socket && socketToken === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const baseURL = (api.defaults as any)?.baseURL as string | undefined;
  const origin = baseURL ? new URL(baseURL).origin : window.location.origin;
  socketToken = token;
  socket = io(`${origin}/realtime`, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

// Subscribes to one live event for as long as the calling component
// is mounted. Used for 'notification:new' (header bell, Notifications
// page) and 'message:new' (Messages page) — REST still owns the
// initial load and history; this only ever pushes what changed since.
export function useRealtimeEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const sock = getRealtimeSocket();
    if (!sock) return;
    const listener = (payload: T) => handlerRef.current(payload);
    sock.on(event, listener);
    return () => {
      sock.off(event, listener);
    };
  }, [event]);
}
