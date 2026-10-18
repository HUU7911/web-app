import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import type { Product } from '../api/types';
import { categoryLabel, formatPrice } from '../utils/format';
import AuthImage from './AuthImage';

interface Props {
	product: Product;
	onOpen: (p: Product) => void;
	onAdd: (p: Product) => Promise<void> | void;
}

const TYPE_LABEL: Record<string, string> = {
	FOOD: 'Món ăn',
	DRINK: 'Đồ uống',
};

export default function ProductCard({ product, onOpen, onAdd }: Props) {
	const [busy, setBusy] = useState(false);
	const categories = product.categories?.map((c) => categoryLabel(c.name)).join(' · ');
	const typeLabel = TYPE_LABEL[product.type as string];

	return (
		<Card
			variant="outlined"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				borderRadius: 2,
				overflow: 'hidden',
				transition: 'transform .25s, box-shadow .25s, border-color .25s',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: '0 12px 28px rgba(0,0,0,.12)',
					borderColor: 'primary.light',
				},
				// phóng nhẹ ảnh khi rê chuột
				'&:hover .card-media > *': { transform: 'scale(1.06)' },
			}}
		>
			<CardActionArea onClick={() => onOpen(product)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
				{/* Ảnh + nhãn nổi */}
				<Box
					className="card-media"
					sx={{
						position: 'relative',
						width: '100%',
						aspectRatio: '4 / 3',
						overflow: 'hidden',
						bgcolor: 'action.hover',
						'& > *': { transition: 'transform .5s ease' },
					}}
				>
					<AuthImage src={product.images?.[0]} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover'}} />

					{typeLabel && (
						<Box
							sx={{
								position: 'absolute',
								top: 10,
								left: 10,
								px: 1.25,
								py: 0.25,
								borderRadius: 4,
								bgcolor: 'rgba(255,255,255,.92)',
								color: 'primary.main',
								fontSize: '.72rem',
								fontWeight: 700,
								// giữ nhãn đứng yên khi ảnh phóng to
								transform: 'none !important',
							}}
						>
							{typeLabel}
						</Box>
					)}

					{product.timeWork && (
						<Box
							sx={{
								position: 'absolute',
								bottom: 10,
								left: 10,
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								px: 1,
								py: 0.25,
								borderRadius: 4,
								bgcolor: 'rgba(0,0,0,.6)',
								color: '#fff',
								backdropFilter: 'blur(4px)',
								transform: 'none !important',
							}}
						>
							<ScheduleIcon sx={{ fontSize: 14 }} />
							<Typography variant="caption" sx={{ lineHeight: 1.4, fontWeight: 600 }}>
								{product.timeWork}
							</Typography>
						</Box>
					)}
				</Box>

				<CardContent sx={{ pb: 1 }}>
					<Typography
						variant="h6"
						sx={{
							fontSize: '1.02rem',
							fontWeight: 700,
							lineHeight: 1.3,
							// tối đa 2 dòng, giữ chiều cao đồng đều giữa các card
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							minHeight: '2.6em',
						}}
					>
						{product.name}
					</Typography>
					<Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5, minHeight: '1.43em' }}>
						{categories || ' '}
					</Typography>
				</CardContent>
			</CardActionArea>

			<CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0.5 }}>
				<Typography
					sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}
				>
					{formatPrice(product.price)}
				</Typography>
				<Button
					size="small"
					variant="contained"
					disableElevation
					aria-label={`Thêm ${product.name} vào giỏ hàng`}
					startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <AddShoppingCartIcon />}
					disabled={busy}
					sx={{ borderRadius: 6, px: 2, fontWeight: 700 }}
					onClick={async () => {
						setBusy(true);
						try {
							await onAdd(product);
						} finally {
							setBusy(false);
						}
					}}
				>
					Thêm
				</Button>
			</CardActions>
		</Card>
	);
}