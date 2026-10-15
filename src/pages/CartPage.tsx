import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AuthImage from '../components/AuthImage';
import EmptyState from '../components/EmptyState';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, increase, decrease, remove } = useCart();
  const items = cart?.items ?? [];

  if (!isAuthenticated)
    return (
      <EmptyState
        title="Đăng nhập để xem giỏ hàng"
        actionLabel="Đăng nhập"
        actionTo="/login"
        icon={<ShoppingBagOutlinedIcon fontSize="large" />}
      />
    );
  if (loading && !cart) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
  if (items.length === 0)
    return (
      <EmptyState
        title="Giỏ hàng đang trống"
        description="Chọn vài món từ thực đơn để bắt đầu."
        actionLabel="Xem thực đơn"
        actionTo="/"
        icon={<ShoppingBagOutlinedIcon fontSize="large" />}
      />
    );

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Giỏ hàng</Typography>
      <Receipt>
        {items.map((item, idx) => (
          <Box key={item.id}>
            {idx > 0 && <Box sx={dashed} />}
            <Stack direction="row" spacing={2} alignItems="center">
              <AuthImage src={item.image} alt={item.productName} sx={{ width: 64, height: 64, borderRadius: 1, flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>{item.productName}</Typography>
                <Typography variant="body2" color="text.secondary">{formatPrice(item.price)}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  <IconButton size="small" aria-label="Giảm" onClick={() => decrease(item.id)} disabled={item.quantity <= 1}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                  <IconButton size="small" aria-label="Tăng" onClick={() => increase(item.id)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(item.price * item.quantity)}
                </Typography>
                <IconButton size="small" aria-label="Xoá món" onClick={() => remove(item.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          </Box>
        ))}
        <Box sx={dashed} />
        <ReceiptRow label="Tổng cộng" value={formatPrice(cart?.totalPrice)} bold />
      </Receipt>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
        <Button component={RouterLink} to="/">Chọn thêm món</Button>
        <Button component={RouterLink} to="/checkout" variant="contained" size="large">Đặt hàng</Button>
      </Stack>
    </Box>
  );
}
