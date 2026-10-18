import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8099';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export function connectSocket(accessToken: string) {
    socket.io.opts.query = {
        token: accessToken,
    };

    if (!socket.connected) {
        socket.connect();
    }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
