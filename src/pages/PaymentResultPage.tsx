import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// payment-service cấu hình return-url = /payment/success, cancel-url = /payment/cancel
export default function PaymentResultPage({ success }: { success: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, maxWidth: 480, mx: 'auto' }}>
      {success ? (
        <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
      ) : (
        <CancelIcon color="error" sx={{ fontSize: 64 }} />
      )}
      <Typography variant="h4" sx={{ mt: 1 }} gutterBottom>
        {success ? 'Đã nhận thanh toán' : 'Thanh toán đã bị huỷ'}
      </Typography>
      <Typography color="text.secondary">
        {success
          ? 'Trạng thái đơn hàng sẽ được cập nhật sau khi cửa hàng xác nhận khoản thanh toán.'
          : 'Đơn hàng vẫn được giữ lại ở trạng thái chưa thanh toán. Bạn có thể huỷ đơn trong mục “Đơn hàng của tôi” và đặt lại, hoặc liên hệ cửa hàng để thanh toán.'}
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button component={RouterLink} to="/orders" variant="contained">Xem đơn hàng</Button>
        <Button component={RouterLink} to="/">Về thực đơn</Button>
      </Stack>
    </Box>
  );
}
