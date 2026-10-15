import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorCode, getErrorMessage, getErrorStatus } from '../api/client';
import { authApi } from '../api/services';
import { useAuth } from '../auth/AuthContext';
import { parseToken } from '../auth/jwt';
import { useNotify } from '../context/NotifyContext';

function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', mt: { xs: 1, sm: 5 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h4" gutterBottom>{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
        {children}
      </Paper>
    </Box>
  );
}

// ---------------- Đăng nhập ----------------
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleRedirect = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/authenticate`;
  const googleUrl = googleId
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleId)}&redirect_uri=${encodeURIComponent(
        googleRedirect,
      )}&response_type=code&scope=openid%20email%20profile`
    : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      // identity-service: 1002 = USER_NOT_FOUND, 1006 = UNAUTHENTICATED (sai mật khẩu)
      const code = getErrorCode(err);
      setError(
        code === 1002 || code === 1006
          ? 'Sai tên đăng nhập hoặc mật khẩu.'
          : getErrorMessage(err, 'Sai tên đăng nhập hoặc mật khẩu.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Đăng nhập" subtitle="Đăng nhập để đặt món và theo dõi đơn hàng.">
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <TextField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
        <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ alignSelf: 'flex-end' }}>
          Quên mật khẩu?
        </Link>
        {googleUrl && (
          <>
            <Divider>hoặc</Divider>
            <Button variant="outlined" href={googleUrl}>Đăng nhập bằng Google</Button>
          </>
        )}
        <Typography variant="body2" align="center">
          Chưa có tài khoản? <Link component={RouterLink} to="/register">Đăng ký</Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

// ---------------- Đăng ký ----------------
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await authApi.register({
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        birthday: form.birthday || null,
      });
      await login(form.username.trim(), form.password);
      notify('Tạo tài khoản thành công. Chào mừng bạn!');
      navigate('/', { replace: true });
    } catch (err) {
      // identity-service: 1004 = USER_EXIST (message gốc của backend ghi nhầm "User not exist")
      setError(
        getErrorCode(err) === 1004
          ? 'Tên đăng nhập đã tồn tại. Hãy chọn tên khác.'
          : getErrorMessage(err, 'Không tạo được tài khoản. Vui lòng thử lại.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Tạo tài khoản">
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction="row" spacing={2}>
          <TextField label="Họ" value={form.lastName} onChange={set('lastName')} required />
          <TextField label="Tên" value={form.firstName} onChange={set('firstName')} required />
        </Stack>
        <TextField label="Tên đăng nhập" value={form.username} onChange={set('username')} required />
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} required />
        <TextField
          label="Ngày sinh"
          type="date"
          value={form.birthday}
          onChange={set('birthday')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required />
        <TextField label="Nhập lại mật khẩu" type="password" value={form.confirm} onChange={set('confirm')} required />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? 'Đang tạo…' : 'Đăng ký'}
        </Button>
        <Typography variant="body2" align="center">
          Đã có tài khoản? <Link component={RouterLink} to="/login">Đăng nhập</Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

// ---------------- Quên mật khẩu (email -> OTP -> mật khẩu mới) ----------------
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      // Gateway và identity-service hiện chưa mở công khai 3 endpoint quên mật khẩu -> khách nhận 401.
      setError(
        getErrorStatus(err) === 401
          ? 'Máy chủ đang từ chối yêu cầu này khi chưa đăng nhập. Hãy liên hệ quản trị viên để đặt lại mật khẩu.'
          : getErrorMessage(err),
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0)
      void run(async () => {
        await authApi.forgotPassword(email.trim());
        setStep(1);
      });
    else if (step === 1)
      void run(async () => {
        const res = await authApi.verifyOtp(email.trim(), otp.trim());
        setResetToken(res.resetToken);
        setStep(2);
      });
    else
      void run(async () => {
        await authApi.resetPassword(resetToken, password);
        notify('Đã đặt lại mật khẩu. Hãy đăng nhập lại.');
        navigate('/login', { replace: true });
      });
  };

  return (
    <AuthShell title="Quên mật khẩu">
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {['Email', 'Mã OTP', 'Mật khẩu mới'].map((l) => (
          <Step key={l}><StepLabel>{l}</StepLabel></Step>
        ))}
      </Stepper>
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        {step === 0 && (
          <TextField label="Email đã đăng ký" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        )}
        {step === 1 && (
          <>
            <Alert severity="info">Nếu email tồn tại, mã OTP 6 số đã được gửi tới {email}.</Alert>
            <TextField
              label="Mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6, pattern: '\\d{6}', title: 'Mã OTP gồm 6 chữ số' } }}
            />
          </>
        )}
        {step === 2 && (
          <TextField
            label="Mật khẩu mới (ít nhất 8 ký tự)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            slotProps={{ htmlInput: { minLength: 8, maxLength: 100 } }}
          />
        )}
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {step === 0 ? 'Gửi mã OTP' : step === 1 ? 'Xác nhận mã' : 'Đặt lại mật khẩu'}
        </Button>
        <Link component={RouterLink} to="/login" variant="body2" align="center">Quay lại đăng nhập</Link>
      </Stack>
    </AuthShell>
  );
}

// ---------------- Callback đăng nhập Google ----------------
export function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return; // StrictMode gọi effect 2 lần, mã code chỉ dùng được 1 lần
    called.current = true;
    const code = params.get('code');
    if (!code) {
      setError('Không nhận được mã xác thực từ Google.');
      return;
    }
    authApi
      .googleExchange(code)
      .then((res) => {
        // identity-service trả access_token của Google; nếu không phải JWT của hệ thống thì không dùng được.
        if (!parseToken(res.token)) {
          setError('Máy chủ chưa cấp phiên đăng nhập hợp lệ cho tài khoản Google. Hãy đăng nhập bằng tên đăng nhập và mật khẩu.');
          return;
        }
        loginWithToken(res.token);
        navigate('/', { replace: true });
      })
      .catch((e) => setError(getErrorMessage(e, 'Đăng nhập Google thất bại.')));
  }, [params, loginWithToken, navigate]);

  return (
    <AuthShell title="Đăng nhập Google">
      {error ? (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button component={RouterLink} to="/login">Quay lại đăng nhập</Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>Đang xác thực…</Typography>
        </Stack>
      )}
    </AuthShell>
  );
}
