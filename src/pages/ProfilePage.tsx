import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Alert, Avatar, Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { profileApi } from '../api/services';
import AuthImage from '../components/AuthImage';
import { useAuth } from '../auth/AuthContext';
import { useNotify } from '../context/NotifyContext';

export default function ProfilePage() {
  const { profile, setProfile, reloadProfile } = useAuth();
  const notify = useNotify();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', address: '', dob: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      email: profile.email ?? '',
      address: profile.address ?? '',
      dob: profile.dob ?? '',
    });
  }, [profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updated = await profileApi.update({
        username: profile?.username,
        avatar: profile?.avatar,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        dob: form.dob || null,
      });
      setProfile(updated);
      notify('Đã lưu hồ sơ.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (file?: File) => {
    if (!file) return;
    try {
      setProfile(await profileApi.uploadAvatar(file));
      notify('Đã cập nhật ảnh đại diện.');
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  if (!profile)
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Alert severity="info" action={<Button onClick={reloadProfile}>Tải lại</Button>}>
          Đang tải hồ sơ hoặc tài khoản chưa có hồ sơ.
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Hồ sơ của tôi</Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, overflow: 'hidden' }}>
              {profile.avatar ? (
                <AuthImage src={profile.avatar} alt="Ảnh đại diện" sx={{ width: '100%', height: '100%' }} />
              ) : (
                (profile.firstName || profile.username || '?').charAt(0).toUpperCase()
              )}
            </Avatar>
            <IconButton
              size="small"
              aria-label="Đổi ảnh đại diện"
              onClick={() => fileRef.current?.click()}
              sx={{ position: 'absolute', right: -6, bottom: -6, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onAvatar(e.target.files?.[0])} />
          </Box>
          <Box>
            <Typography variant="h6">{[profile.lastName, profile.firstName].filter(Boolean).join(' ')}</Typography>
            <Typography color="text.secondary">@{profile.username}</Typography>
          </Box>
        </Stack>

        <Stack component="form" spacing={2} onSubmit={save}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="Họ" value={form.lastName} onChange={set('lastName')} />
            <TextField label="Tên" value={form.firstName} onChange={set('firstName')} />
          </Stack>
          <TextField label="Phone" type="phone" value={form.phoneNumber} onChange={set('phoneNumber')} />
          <TextField label="Email" type="email" value={form.email} onChange={set('email')} />
          <TextField label="Địa chỉ" value={form.address} onChange={set('address')} multiline minRows={2} />
          <TextField label="Ngày sinh" type="date" value={form.dob} onChange={set('dob')} slotProps={{ inputLabel: { shrink: true } }} />
          <Button type="submit" variant="contained" disabled={busy} sx={{ alignSelf: 'flex-start' }}>
            Lưu thay đổi
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
