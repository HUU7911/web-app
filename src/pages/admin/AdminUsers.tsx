import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../../api/client';
import { userApi } from '../../api/services';
import type { User } from '../../api/types';
import { useNotify } from '../../context/NotifyContext';

const empty = { username: '', password: '', firstName: '', lastName: '', email: '', birthday: '' };

export default function AdminUsers() {
  const notify = useNotify();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers(await userApi.list());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await userApi.createStaff({ ...form, birthday: form.birthday || null });
      notify('Đã tạo tài khoản nhân viên.');
      setForm(empty);
      setOpen(false);
      await load();
    } catch (err) {
      // identity-service: 1004 = USER_EXIST
      setFormError(getErrorCode(err) === 1004 ? 'Tên đăng nhập đã tồn tại.' : getErrorMessage(err));
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Người dùng</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpen(true)}>Tạo nhân viên</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username}</TableCell>
                <TableCell>{[u.lastName, u.firstName].filter(Boolean).join(' ')}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.roles?.map((r) => <Chip key={r.name} size="small" label={r.name} sx={{ mr: 0.5 }} />)}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={4} align="center">Chưa có người dùng.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={create}>
          <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Stack direction="row" spacing={2}>
                <TextField label="Họ" value={form.lastName} onChange={set('lastName')} required />
                <TextField label="Tên" value={form.firstName} onChange={set('firstName')} required />
              </Stack>
              <TextField label="Tên đăng nhập" value={form.username} onChange={set('username')} required />
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required />
              <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required />
              <TextField label="Ngày sinh" type="date" value={form.birthday} onChange={set('birthday')} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Huỷ</Button>
            <Button type="submit" variant="contained">Tạo tài khoản</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
