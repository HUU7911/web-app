import { useEffect } from 'react';
import type { OrderStatus } from '../api/types';
import { socket } from '../socket/socket';

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
}

export function useOrderSocket(
  onStatusChanged: (event: OrderStatusEvent) => void
) {
  useEffect(() => {
    socket.on('order:status_changed', onStatusChanged);

    return () => {
      socket.off('order:status_changed', onStatusChanged);
    };
  }, [onStatusChanged]);
}
