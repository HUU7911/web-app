import { useCallback, useEffect, useState } from 'react';
import { useOrderSocket } from '../hooks/useOrderSocket';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Alert, Box, Card, CardActionArea, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { orderApi } from '../api/services';
import type { Order, PageResponse } from '../api/types';
import EmptyState from '../components/EmptyState';
import OrderStatusChip from '../components/OrderStatusChip';
import { formatDateTime, formatPrice } from '../utils/format';

export default function OrdersPage() {
	const [page, setPage] = useState(1);
	const [data, setData] = useState<PageResponse<Order> | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		setData(null);
		orderApi.mine(page, 10).then(setData).catch((e) => setError(getErrorMessage(e)));
	}, [page]);

	const handleStatusChanged = useCallback(
		() => {
			orderApi.mine(page, 10)
				.then(setData)
				.catch((e) => setError(getErrorMessage(e)));
		},
		[page],
	);

	useOrderSocket(handleStatusChanged);

	return (
		<Box sx={{ maxWidth: 720, mx: 'auto' }}>
			<Typography variant="h4" gutterBottom>Đơn hàng của tôi</Typography>
			{error && <Alert severity="error">{error}</Alert>}
			{!data && !error && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}
			{data && data.data.length === 0 && (
				<EmptyState title="Bạn chưa có đơn hàng nào" actionLabel="Đặt món ngay" actionTo="/" icon={<ReceiptLongIcon fontSize="large" />} />
			)}
			<Stack spacing={1.5}>
				{data?.data.map((o) => (
					<Card key={o.id}>
						<CardActionArea component={RouterLink} to={`/orders/${o.id}`} sx={{ p: 2 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
								<Box sx={{ minWidth: 0 }}>
									<Typography fontWeight={700}>#{o.orderCode}</Typography>
									<Typography variant="body2" color="text.secondary">
										{formatDateTime(o.createdAt)} · {o.items?.length ?? 0} món
									</Typography>
								</Box>
								<Box sx={{ textAlign: 'right' }}>
									<Typography fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatPrice(o.totalAmount)}</Typography>
									<OrderStatusChip status={o.status} />
								</Box>
							</Stack>
						</CardActionArea>
					</Card>
				))}
			</Stack>
			{data && data.totalPage > 1 && (
				<Stack alignItems="center" sx={{ mt: 3 }}>
					<Pagination count={data.totalPage} page={page} color="primary" onChange={(_, v) => setPage(v)} />
				</Stack>
			)}
		</Box>
	);
}
