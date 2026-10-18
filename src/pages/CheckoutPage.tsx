import {
	Alert,
	Box,
	Button,
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { orderApi } from '../api/services';
import type { PaymentMethod } from '../api/types';
import EmptyState from '../components/EmptyState';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotifyContext';
import { formatPrice, PAYMENT_METHOD_LABEL } from '../utils/format';

const PHONE_RE = /^(0|\+84)\d{9}$/;

export default function CheckoutPage() {
	const { profile } = useAuth();
	const { cart, clearAfterOrder } = useCart();
	const notify = useNotify();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		receiverName: '',
		phone: '',
		address: '',
		note: '',
	});

	const [method, setMethod] = useState<PaymentMethod>('COD');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!profile) return;

		setForm((f) => ({
			...f,
			receiverName:
				f.receiverName ||
				[profile.lastName, profile.firstName].filter(Boolean).join(' '),
			phone: f.phone || profile.phoneNumber || '',
			address: f.address || profile.address || '',
		}));
	}, [profile]);

	const items = cart?.items ?? [];

	const set = (k: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setForm((f) => ({ ...f, [k]: e.target.value }));
		};

	const submit = async (e: FormEvent) => {
		e.preventDefault();

		if (!form.receiverName.trim()) {
			setError('Vui lòng nhập tên người nhận.');
			return;
		}

		if (!PHONE_RE.test(form.phone.trim())) {
			setError(
				'Số điện thoại không hợp lệ (ví dụ 0901234567 hoặc +84901234567).',
			);
			return;
		}

		if (!form.address.trim()) {
			setError('Vui lòng nhập địa chỉ giao hàng.');
			return;
		}

		setBusy(true);
		setError('');

		try {
			const order = await orderApi.create({
				receiverName: form.receiverName.trim(),
				phone: form.phone.trim(),
				address: form.address.trim(),
				note: form.note.trim() || undefined,
				paymentMethod: method,
			});

			await clearAfterOrder();

			if (method === 'PAYOS' && order.checkoutUrl) {
				window.location.href = order.checkoutUrl;
				return;
			}

			notify('Đặt hàng thành công!');
			navigate(`/orders/${order.id}`, { replace: true });
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setBusy(false);
		}
	};

	if (items.length === 0 && !busy) {
		return (
			<EmptyState
				title="Giỏ hàng đang trống"
				actionLabel="Xem thực đơn"
				actionTo="/"
			/>
		);
	}

	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				Thanh toán
			</Typography>

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						md: '1fr 380px',
					},
					gap: 4,
					alignItems: 'start',
				}}
			>
				<Stack
					component="form"
					id="checkout-form"
					spacing={2}
					onSubmit={submit}
				>
					{error && <Alert severity="error">{error}</Alert>}

					<TextField
						label="Tên người nhận"
						value={form.receiverName}
						onChange={set('receiverName')}
						required
						slotProps={{
							htmlInput: { maxLength: 100 },
						}}
					/>

					<TextField
						label="Số điện thoại"
						type="tel"
						value={form.phone}
						onChange={set('phone')}
						required
						placeholder="0901234567"
						slotProps={{
							htmlInput: {
								maxLength: 13,
								inputMode: 'tel',
							},
						}}
					/>

					<TextField
						label="Địa chỉ giao hàng"
						value={form.address}
						onChange={set('address')}
						required
						multiline
						minRows={2}
						slotProps={{
							htmlInput: { maxLength: 500 },
						}}
					/>

					<TextField
						label="Ghi chú cho quán (không bắt buộc)"
						value={form.note}
						onChange={set('note')}
						slotProps={{
							htmlInput: { maxLength: 255 },
						}}
					/>

					<FormControl>
						<FormLabel>Phương thức thanh toán</FormLabel>

						<RadioGroup
							value={method}
							onChange={(e) =>
								setMethod(e.target.value as PaymentMethod)
							}
						>
							{(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map(
								(m) => (
									<FormControlLabel
										key={m}
										value={m}
										control={<Radio />}
										label={PAYMENT_METHOD_LABEL[m]}
									/>
								),
							)}
						</RadioGroup>
					</FormControl>
				</Stack>

				<Box>
					<Receipt>
						{items.map((i) => (
							<ReceiptRow
								key={i.id}
								label={`${i.quantity} × ${i.productName}`}
								value={formatPrice(i.price * i.quantity)}
							/>
						))}

						<Box sx={dashed} />

						<ReceiptRow
							label="Tổng cộng"
							value={formatPrice(cart?.totalPrice)}
							bold
						/>
					</Receipt>

					<Stack spacing={1} sx={{ mt: 3 }}>
						<Button
							type="submit"
							form="checkout-form"
							variant="contained"
							size="large"
							disabled={busy}
						>
							{busy
								? 'Đang đặt hàng…'
								: method === 'PAYOS'
									? 'Đặt hàng và thanh toán'
									: 'Đặt hàng'}
						</Button>

						<Button component={RouterLink} to="/cart">
							Quay lại giỏ hàng
						</Button>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}