import { Chip } from '@mui/material';
import type { OrderStatus } from '../api/types';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../utils/format';

export default function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <Chip size="small" label={ORDER_STATUS_LABEL[status]} color={ORDER_STATUS_COLOR[status]} variant="outlined" />;
}
