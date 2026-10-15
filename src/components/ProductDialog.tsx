import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material';
import type { Product } from '../api/types';
import { categoryLabel, formatPrice, PRODUCT_TYPE_LABEL } from '../utils/format';
import AuthImage from './AuthImage';

interface Props {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product) => Promise<void> | void;
}

export default function ProductDialog({ product, onClose, onAdd }: Props) {
  return (
    <Dialog open={!!product} onClose={onClose} maxWidth="sm" fullWidth>
      {product && (
        <>
          <AuthImage src={product.images?.[0]} alt={product.name} sx={{ width: '100%', maxHeight: 320, aspectRatio: '16 / 10' }} />
          <DialogContent>
            <Typography variant="h5" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontVariantNumeric: 'tabular-nums' }} gutterBottom>
              {formatPrice(product.price)}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip size="small" label={PRODUCT_TYPE_LABEL[product.type] ?? product.type} />
              {product.categories?.map((c) => (
                <Chip key={c.name} size="small" variant="outlined" label={categoryLabel(c.name)} />
              ))}
            </Stack>
            {product.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {product.description}
              </Typography>
            )}
            <Box sx={{ color: 'text.secondary', display: 'grid', gap: 0.5 }}>
              {product.timeWork && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleIcon fontSize="small" />
                  <Typography variant="body2">{product.timeWork}</Typography>
                </Stack>
              )}
              {product.position && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceIcon fontSize="small" />
                  <Typography variant="body2">{product.position}</Typography>
                </Stack>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose}>Đóng</Button>
            <Button
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={async () => {
                await onAdd(product);
                onClose();
              }}
            >
              Thêm vào giỏ
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
