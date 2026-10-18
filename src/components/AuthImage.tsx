import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Box, SxProps, Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

// Ảnh do file-service phục vụ tại /file/media/download/{name}. Gateway hiện yêu cầu Bearer token
// cho đường dẫn này nên <img src> thuần sẽ bị 401 -> tải bằng fetch kèm token rồi hiển thị blob.
// Nếu chưa đăng nhập (hoặc fetch lỗi) thì dùng URL gốc, sẽ chạy khi backend cho phép tải công khai.
const cache = new Map<string, Promise<string>>();

function loadBlob(src: string, token: string): Promise<string> {
  let p = cache.get(src);
  if (!p) {
    p = fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => URL.createObjectURL(b));
    p.catch(() => cache.delete(src));
    cache.set(src, p);
  }
  return p;
}

/** Tải ảnh hiện có (kèm token) thành File, dùng khi backend bắt buộc gửi lại file lúc cập nhật món. */
export async function fetchImageFile(src: string, token: string | null): Promise<File> {
  const res = await fetch(src, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) throw new Error(String(res.status));
  const blob = await res.blob();
  const name = decodeURIComponent(src.split('?')[0].split('/').pop() || 'image');
  return new File([blob], name, { type: blob.type || 'application/octet-stream' });
}

interface Props {
  src?: string;
  alt: string;
  sx?: SxProps<Theme>;
  fit?: 'cover' | 'contain';
}

export default function AuthImage({ src, alt, sx, fit = 'cover' }: Props) {
  const { token } = useAuth();
  const [url, setUrl] = useState<string | undefined>(token ? undefined : src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setUrl(undefined);
    if (!src) return;
    if (!token) {
      setUrl(src);
      return;
    }
    let active = true;
    loadBlob(src, token)
      .then((u) => active && setUrl(u))
      .catch(() => active && setUrl(src));
    return () => {
      active = false;
    };
  }, [src, token]);

  if (!src || failed || !url) {
    return (
      <Box
        role="img"
        aria-label={alt}
        sx={[
          { display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.disabled' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <RestaurantIcon />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      sx={[{ objectFit: fit, display: 'block' }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
