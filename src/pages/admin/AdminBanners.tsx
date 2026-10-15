import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { bannerApi } from '../../api/services';
import type { Banner } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import AuthImage from '../../components/AuthImage';
import { useNotify } from '../../context/NotifyContext';

// post-service: STAFF/ADMIN được tải banner lên, chỉ ADMIN được xoá.
export default function AdminBanners() {
  const { isAdmin } = useAuth();
  const notify = useNotify();
  const fileRef = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Banner | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      setBanners(await bannerApi.list());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      await bannerApi.create(file);
      notify('Đã tải banner lên.');
      await load();
    } catch (e) {
      notify(getErrorMessage(e), 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await bannerApi.remove(toDelete.id);
      notify('Đã xoá banner.');
      setToDelete(null);
      await load();
    } catch (e) {
      notify(getErrorMessage(e), 'error');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Banner trang chủ</Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Đang tải lên…' : 'Tải banner lên'}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Banner hiển thị dạng slide ở đầu trang chủ cho người dùng đã đăng nhập. Tỉ lệ ảnh khuyến nghị 3:1 trở lên.
        {!isAdmin && ' Chỉ quản trị viên (ADMIN) mới xoá được banner.'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {banners.map((b) => (
          <Paper key={b.id} variant="outlined" sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
            <AuthImage src={b.url} alt="Banner" sx={{ width: '100%', aspectRatio: '16 / 7' }} />
            {isAdmin && (
              <IconButton
                aria-label="Xoá banner"
                onClick={() => setToDelete(b)}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: '#fff' } }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </Paper>
        ))}
      </Box>
      {!error && banners.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>Chưa có banner nào.</Typography>
      )}

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Xoá banner này?</DialogTitle>
        <DialogContent>
          <DialogContentText>Banner sẽ biến mất khỏi slide trang chủ.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Giữ lại</Button>
          <Button color="error" onClick={remove}>Xoá banner</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
