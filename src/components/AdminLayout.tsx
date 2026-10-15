import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Button, Container, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  const tabs = [
    { to: '/admin/orders', label: 'Đơn hàng', icon: <ReceiptLongIcon /> },
    { to: '/admin/products', label: 'Món ăn', icon: <LunchDiningIcon /> },
    { to: '/admin/categories', label: 'Danh mục', icon: <CategoryIcon /> },
    { to: '/admin/banners', label: 'Banner', icon: <ImageIcon /> },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Người dùng', icon: <GroupIcon /> }] : []),
  ];
  const current = tabs.find((t) => pathname.startsWith(t.to))?.to ?? false;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">Quản trị cửa hàng</Typography>
        <Button component={RouterLink} to="/" startIcon={<StorefrontIcon />}>
          Về trang bán hàng
        </Button>
      </Box>
      <Tabs value={current} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {tabs.map((t) => (
          <Tab key={t.to} value={t.to} label={t.label} icon={t.icon} iconPosition="start" component={RouterLink} to={t.to} />
        ))}
      </Tabs>
      <Outlet />
    </Container>
  );
}
