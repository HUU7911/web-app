import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Step,
	StepLabel,
	Stepper,
	Stack,
	Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { orderApi } from '../api/services';
import type { Order, OrderStatus } from '../api/types';
import OrderStatusChip from '../components/OrderStatusChip';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';
import { useNotify } from '../context/NotifyContext';
import { formatDateTime, formatPrice, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../utils/format';
import { useCallback, useEffect, useState } from 'react';
import { useOrderSocket } from '../hooks/useOrderSocket';
import type { OrderStatusEvent } from '../hooks/useOrderSocket';

const FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED'];

export default function OrderDetailPage() {
	const { id = '' } = useParams();
	const notify = useNotify();
	const [order, setOrder] = useState<Order | null>(null);
	const [error, setError] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		orderApi.get(id).then(setOrder).catch((e) => setError(getErrorMessage(e)));
	}, [id]);

	const handleStatusChanged = useCallback(
		(event: OrderStatusEvent) => {
			if (event.orderId !== id) return;
			orderApi.get(id).then(setOrder).catch((e) => setError(getErrorMessage(e)));
		},
		[id],
	);

	// Hook phải được gọi trước mọi lệnh return sớm bên dưới
	useOrderSocket(handleStatusChanged);

	const cancel = async () => {
		setBusy(true);
		try {
			setOrder(await orderApi.cancel(id));
			notify('Đã huỷ đơn hàng.');
		} catch (e) {
			notify(getErrorMessage(e), 'error');
		} finally {
			setBusy(false);
			setConfirmOpen(false);
		}
	};

	if (error) return <Alert severity="error">{error}</Alert>;
	if (!order) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;

	const cancelled = order.status === 'CANCELLED';
	const unpaidOnline = order.paymentMethod === 'PAYOS' && order.paymentStatus === 'UNPAID' && !cancelled;
	// order-service chỉ cho huỷ khi đơn còn PENDING và chưa thanh toán
	const canCancel = order.status === 'PENDING' && order.paymentStatus === 'UNPAID';

	return (
		<Box sx={{ maxWidth: 640, mx: 'auto' }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
				<Typography variant="h4">Đơn #{order.orderCode}</Typography>
				<OrderStatusChip status={order.status} />
			</Stack>

			{cancelled ? (
				<Alert severity="error" sx={{ mb: 2 }}>Đơn hàng đã bị huỷ.</Alert>
			) : (
				<Stepper activeStep={FLOW.indexOf(order.status)} alternativeLabel sx={{ mb: 3 }}>
					{FLOW.map((s) => (
						<Step key={s}><StepLabel>{ORDER_STATUS_LABEL[s]}</StepLabel></Step>
					))}
				</Stepper>
			)}

			<Receipt>
				<Typography variant="body2" color="text.secondary">{formatDateTime(order.createdAt)}</Typography>
				<Box sx={dashed} />
				{order.items.map((i) => (
					<ReceiptRow key={i.id} label={`${i.quantity} × ${i.productName}`} value={formatPrice(i.subTotal)} />
				))}
				<Box sx={dashed} />
				<ReceiptRow label="Tổng cộng" value={formatPrice(order.totalAmount)} bold />
				<Box sx={dashed} />
				<Typography fontWeight={600}>{order.receiverName} · {order.phone}</Typography>
				<Typography variant="body2">{order.address}</Typography>
				{order.note && <Typography variant="body2" color="text.secondary">Ghi chú: {order.note}</Typography>}
				<Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
					<Chip size="small" label={PAYMENT_METHOD_LABEL[order.paymentMethod]} />
					<Chip
						size="small"
						color={order.paymentStatus === 'PAID' ? 'success' : 'default'}
						label={order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
					/>
				</Stack>
			</Receipt>

			{unpaidOnline && (
				<Alert severity="info" sx={{ mt: 2 }}>
					Đơn thanh toán qua PayOS sẽ chuyển sang “Đã thanh toán” sau khi cửa hàng xác nhận đã nhận tiền.
				</Alert>
			)}

			<Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
				<Button component={RouterLink} to="/orders">Tất cả đơn hàng</Button>
				<Stack direction="row" spacing={1}>
					{canCancel && (
						<Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>Huỷ đơn</Button>
					)}
				</Stack>
			</Stack>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Huỷ đơn #{order.orderCode}?</DialogTitle>
				<DialogContent>
					<DialogContentText>Bạn không thể khôi phục đơn hàng sau khi huỷ.</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Giữ đơn</Button>
					<Button color="error" onClick={cancel} disabled={busy}>Huỷ đơn</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
